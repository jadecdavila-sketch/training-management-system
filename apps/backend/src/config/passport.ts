import passport from 'passport';
import { Strategy as SamlStrategy, Profile } from 'passport-saml';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// Type for SAML profile with custom attributes
interface SamlProfile extends Profile {
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  groups?: string[];
  [key: string]: any;
}

/**
 * Map SAML/IdP groups to TMS roles
 * Customize this based on your IdP group naming
 */
function mapRoleFromGroups(groups: string[] = []): UserRole {
  // Check for specific group names (customize for your IdP)
  if (groups.some(g => g.toLowerCase().includes('tms-admin') || g.toLowerCase().includes('admin'))) {
    return 'ADMIN';
  }
  if (groups.some(g => g.toLowerCase().includes('tms-coordinator') || g.toLowerCase().includes('coordinator'))) {
    return 'COORDINATOR';
  }
  if (groups.some(g => g.toLowerCase().includes('tms-hr') || g.toLowerCase().includes('hr'))) {
    return 'HR';
  }
  // Default role
  return 'FACILITATOR';
}

/**
 * Configure SAML Strategy
 * This setup is compatible with Azure AD, Okta, and generic SAML 2.0 providers
 */
if (process.env.SAML_ENABLED === 'true') {
  passport.use(
    new SamlStrategy(
      {
        entryPoint: process.env.SAML_ENTRY_POINT!, // IdP SSO URL
        issuer: process.env.SAML_ISSUER || 'urn:tms:app', // Your app's identifier
        callbackUrl: `${process.env.API_URL}/auth/saml/callback`,
        cert: process.env.SAML_CERT!, // IdP's public certificate (PEM format)
        identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
        // Optional: Sign requests if IdP requires it
        decryptionPvk: process.env.SAML_PRIVATE_KEY,
        privateCert: process.env.SAML_PRIVATE_KEY,
        // Accept different certificate formats
        signatureAlgorithm: 'sha256',
      },
      async (profile: SamlProfile, done: any) => {
        try {
          // Extract user info from SAML assertion
          const email = profile.email || profile.nameID || profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
          const firstName = profile.firstName || profile.givenName || profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] || '';
          const lastName = profile.lastName || profile.surname || profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'] || '';
          const fullName = profile.name || profile.displayName || `${firstName} ${lastName}`.trim() || email;
          const groups = profile.groups || profile['http://schemas.microsoft.com/ws/2008/06/identity/claims/groups'] || [];
          const ssoId = profile.nameID || email;

          if (!email) {
            return done(new Error('Email not provided by IdP'), null);
          }

          // Map groups to TMS role
          const role = mapRoleFromGroups(groups);

          // Just-In-Time (JIT) user provisioning
          let user = await prisma.user.findUnique({ where: { email } });

          if (!user) {
            // Create new user on first login
            user = await prisma.user.create({
              data: {
                email,
                name: fullName,
                role,
                ssoProvider: 'saml',
                ssoId,
                lastLoginAt: new Date(),
              },
            });

            console.log(`✓ New SSO user provisioned: ${email} (${role})`);
          } else {
            // Update existing user's SSO info and last login
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                ssoProvider: 'saml',
                ssoId,
                lastLoginAt: new Date(),
                // Optionally update role if changed in IdP
                role: mapRoleFromGroups(groups),
              },
            });
          }

          done(null, user);
        } catch (error) {
          console.error('SAML authentication error:', error);
          done(error, null);
        }
      }
    )
  );
}

/**
 * Serialize user to session (store minimal data)
 */
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

/**
 * Deserialize user from session (retrieve full user object)
 */
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        ssoProvider: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      return done(new Error('User not found'), null);
    }

    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
