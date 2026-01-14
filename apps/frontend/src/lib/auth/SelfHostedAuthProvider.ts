import { AuthProvider, User } from './types';

/**
 * Self-hosted SSO auth provider
 * Uses SAML + JWT tokens via backend
 */
export class SelfHostedAuthProvider implements AuthProvider {
  private _user: User | null = null;
  private _isLoading: boolean = true;
  private apiUrl: string;
  private listeners: Array<() => void> = [];

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  get user(): User | null {
    return this._user;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get isAuthenticated(): boolean {
    return this._user !== null;
  }

  /**
   * Initialize auth state (check if user is logged in)
   * Call this on app startup
   */
  async initialize(): Promise<void> {
    try {
      this._isLoading = true;
      this.notifyListeners();

      const response = await fetch(`${this.apiUrl}/api/auth/me`, {
        method: 'GET',
        credentials: 'include', // Send cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        this._user = result.success && result.data ? result.data : null;
      } else {
        this._user = null;
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      this._user = null;
    } finally {
      this._isLoading = false;
      this.notifyListeners();
    }
  }

  /**
   * Initiate SAML SSO login
   * Redirects to backend which redirects to IdP
   */
  async login(): Promise<void> {
    // Check if SAML is enabled
    const samlEnabled = import.meta.env.VITE_SAML_ENABLED === 'true';

    if (samlEnabled) {
      // Redirect to SAML login endpoint
      window.location.href = `${this.apiUrl}/auth/saml/login`;
    } else {
      // Fallback: redirect to manual login page (for development)
      window.location.href = '/login';
    }
  }

  /**
   * Log out user
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this._user = null;
      this.notifyListeners();

      // Redirect to login
      window.location.href = '/login';
    }
  }

  /**
   * Get access token from cookie
   * Note: Token is in HTTP-only cookie, so we can't access it directly
   * Instead, we rely on 'credentials: include' in fetch calls
   */
  getToken(): string | null {
    // With HTTP-only cookies, we can't access the token in JS
    // This is a security feature. The browser automatically sends it.
    return null;
  }

  /**
   * Subscribe to auth state changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all subscribers of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}
