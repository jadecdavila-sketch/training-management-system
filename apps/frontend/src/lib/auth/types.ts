/**
 * User object returned from authentication
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'COORDINATOR' | 'HR' | 'FACILITATOR';
  ssoProvider?: string | null;
  lastLoginAt?: Date | null;
  createdAt?: Date;
}

/**
 * Auth provider abstraction
 * Implement this interface for different auth providers (self-hosted, Auth0, etc.)
 */
export interface AuthProvider {
  /**
   * Currently authenticated user (null if not logged in)
   */
  user: User | null;

  /**
   * Whether the auth state is still loading
   */
  isLoading: boolean;

  /**
   * Whether user is authenticated
   */
  isAuthenticated: boolean;

  /**
   * Initiate login flow
   */
  login: () => Promise<void>;

  /**
   * Log out user
   */
  logout: () => Promise<void>;

  /**
   * Get current access token (for API calls)
   */
  getToken: () => string | null;

  /**
   * Refresh access token if expired
   */
  refreshToken?: () => Promise<string | null>;
}

/**
 * Auth configuration for different providers
 */
export type AuthConfig =
  | { provider: 'self-hosted'; apiUrl: string }
  | { provider: 'auth0'; domain: string; clientId: string; audience: string };
