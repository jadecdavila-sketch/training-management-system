import { Router, Request, Response } from 'express';
import passport from '../config/passport.js';
import { authService } from '../services/authService.js';

const router = Router();

/**
 * Initiate SAML login
 * Redirects user to IdP login page
 */
router.get('/login', (req: Request, res: Response, next) => {
  if (process.env.SAML_ENABLED !== 'true') {
    return res.status(501).json({
      success: false,
      error: 'SAML SSO is not enabled on this server',
      hint: 'Set SAML_ENABLED=true and configure SAML environment variables',
    });
  }

  passport.authenticate('saml', {
    failureRedirect: '/auth/saml/error',
  })(req, res, next);
});

/**
 * SAML callback endpoint
 * IdP redirects here after successful authentication
 */
router.post(
  '/callback',
  passport.authenticate('saml', {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=saml_failed`,
    session: true, // Enable session for SSO
  }),
  (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
      }

      // Generate JWT tokens for the authenticated user
      const tokens = authService.generateTokensFromSSOUser(req.user);

      // Set JWT as HTTP-only cookie (primary auth method)
      res.cookie('auth_token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 8 * 60 * 60 * 1000, // 8 hours
      });

      // Also set refresh token
      res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Redirect to frontend dashboard
      const redirectUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${redirectUrl}/admin/programs`);
    } catch (error) {
      console.error('SAML callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=callback_failed`);
    }
  }
);

/**
 * SAML metadata endpoint
 * Provides metadata XML for IdP configuration
 */
router.get('/metadata', (req: Request, res: Response) => {
  if (process.env.SAML_ENABLED !== 'true') {
    return res.status(501).json({
      error: 'SAML SSO is not enabled',
    });
  }

  // Generate SAML metadata XML
  // This would be provided to your IdP admin to configure the integration
  const metadata = `<?xml version="1.0"?>
<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata"
                  entityID="${process.env.SAML_ISSUER || 'urn:tms:app'}">
  <SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat>
    <AssertionConsumerService
      Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
      Location="${process.env.API_URL}/auth/saml/callback"
      index="0" />
  </SPSSODescriptor>
</EntityDescriptor>`;

  res.header('Content-Type', 'text/xml');
  res.send(metadata);
});

/**
 * SAML logout (SLO - Single Logout)
 */
router.post('/logout', (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
    }

    // Clear auth cookies
    res.clearCookie('auth_token');
    res.clearCookie('refresh_token');
    res.clearCookie('tms.sid');

    // Redirect to frontend
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  });
});

/**
 * SAML error handler
 */
router.get('/error', (req: Request, res: Response) => {
  res.redirect(`${process.env.FRONTEND_URL}/login?error=saml_error`);
});

export default router;
