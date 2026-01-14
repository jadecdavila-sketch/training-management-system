import { AuthProvider, User } from './types';

/**
 * Auth0 SSO auth provider (Future implementation)
 *
 * To switch to Auth0:
 * 1. Install: pnpm add @auth0/auth0-react
 * 2. Implement this class using Auth0's SDK
 * 3. Change VITE_AUTH_PROVIDER=auth0 in .env
 *
 * Example implementation:
 *
 * import { useAuth0 } from '@auth0/auth0-react';
 *
 * export class Auth0Provider implements AuthProvider {
 *   private auth0SDK: ReturnType<typeof useAuth0>;
 *
 *   get user() {
 *     return this.mapAuth0User(this.auth0SDK.user);
 *   }
 *
 *   async login() {
 *     await this.auth0SDK.loginWithRedirect();
 *   }
 *
 *   async logout() {
 *     await this.auth0SDK.logout({ returnTo: window.location.origin });
 *   }
 *
 *   getToken() {
 *     return this.auth0SDK.getAccessTokenSilently();
 *   }
 * }
 */
export class Auth0Provider implements AuthProvider {
  user = null;
  isLoading = false;
  isAuthenticated = false;

  async initialize() {
    throw new Error('Auth0 provider not yet implemented. Set VITE_AUTH_PROVIDER=self-hosted');
  }

  async login() {
    throw new Error('Auth0 not implemented');
  }

  async logout() {
    throw new Error('Auth0 not implemented');
  }

  getToken() {
    return null;
  }
}
