import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  /**
   * Optional: Restrict access to specific roles
   * If not provided, any authenticated user can access
   */
  allowedRoles?: Array<'ADMIN' | 'COORDINATOR' | 'HR' | 'FACILITATOR'>;
  /**
   * Optional: Custom redirect path when not authorized
   */
  redirectTo?: string;
}

/**
 * ProtectedRoute component
 * Requires authentication and optionally specific roles
 *
 * Usage:
 * <ProtectedRoute allowedRoles={['ADMIN', 'COORDINATOR']}>
 *   <ProgramsPage />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role-based access if required
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-900 mb-2">
              Access Denied
            </h2>
            <p className="text-red-700 mb-4">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-red-600">
              Your role: <span className="font-medium">{user.role}</span>
              <br />
              Required roles: <span className="font-medium">{allowedRoles.join(', ')}</span>
            </p>
            <button
              onClick={() => window.history.back()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and authorized
  return <>{children}</>;
}
