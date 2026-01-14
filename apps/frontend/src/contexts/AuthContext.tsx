import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthProvider, User } from '../lib/auth/types';
import { SelfHostedAuthProvider } from '../lib/auth/SelfHostedAuthProvider';
import { Auth0Provider } from '../lib/auth/Auth0Provider';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Create auth provider based on environment configuration
 */
function createAuthProvider(): AuthProvider {
  const authProvider = import.meta.env.VITE_AUTH_PROVIDER || 'self-hosted';
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  switch (authProvider) {
    case 'auth0':
      return new Auth0Provider();

    case 'self-hosted':
    default:
      return new SelfHostedAuthProvider(apiUrl);
  }
}

// Singleton auth provider instance
const authProvider = createAuthProvider();

/**
 * AuthProvider component
 * Wraps the app and provides authentication context
 */
export function AuthProviderComponent({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth provider
    const init = async () => {
      // For SelfHostedAuthProvider, call initialize
      if ('initialize' in authProvider && typeof authProvider.initialize === 'function') {
        await authProvider.initialize();
      }

      setUser(authProvider.user);
      setIsLoading(authProvider.isLoading);
    };

    init();

    // Subscribe to auth state changes
    if ('subscribe' in authProvider && typeof authProvider.subscribe === 'function') {
      const unsubscribe = authProvider.subscribe(() => {
        setUser(authProvider.user);
        setIsLoading(authProvider.isLoading);
      });

      return unsubscribe;
    }
  }, []);

  const refreshAuthState = async () => {
    if ('initialize' in authProvider && typeof authProvider.initialize === 'function') {
      await authProvider.initialize();
      setUser(authProvider.user);
      setIsLoading(authProvider.isLoading);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: authProvider.isAuthenticated,
    login: authProvider.login.bind(authProvider),
    logout: authProvider.logout.bind(authProvider),
    refreshAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth hook
 * Access authentication state and methods
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
