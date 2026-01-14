import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProviderComponent } from './contexts/AuthContext';
import { ParticipantsPage } from './pages/admin/ParticipantsPage';
import { Layout } from './components/Layout';
import { DesignSystemPage } from './pages/DesignSystemPage';
import { UsersPage } from './pages/admin/UsersPage';
import { LocationsPage } from './pages/admin/LocationsPage';
import { ProgramsPage } from './pages/admin/ProgramsPage';
import { ProgramCreationWizard } from './pages/admin/ProgramCreationWizard';
import { ProgramCohortsPage } from './pages/admin/ProgramCohortsPage';
import { CohortDetailPage } from './pages/admin/CohortDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <AuthProviderComponent>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/programs" replace />} />
            <Route path="admin">
              {/* Programs - All users can view */}
              <Route path="programs" element={<ProgramsPage />} />
              <Route path="programs/:programId/cohorts" element={<ProgramCohortsPage />} />
              <Route path="cohorts/:cohortId" element={<CohortDetailPage />} />

              {/* Programs - Only ADMIN and COORDINATOR can create/edit */}
              <Route
                path="programs/new"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'COORDINATOR']}>
                    <ProgramCreationWizard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="programs/edit/:id"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'COORDINATOR']}>
                    <ProgramCreationWizard />
                  </ProtectedRoute>
                }
              />

              {/* Participants - All users can view */}
              <Route path="participants" element={<ParticipantsPage />} />

              {/* Users - Only ADMIN and HR can access */}
              <Route
                path="users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
                    <UsersPage />
                  </ProtectedRoute>
                }
              />

              {/* Locations - All users can view */}
              <Route path="locations" element={<LocationsPage />} />

              {/* Design system - Only available in development */}
              {import.meta.env.DEV && (
                <Route path="design-system" element={<DesignSystemPage />} />
              )}
            </Route>

            {/* Profile - All authenticated users */}
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProviderComponent>
    </ErrorBoundary>
  );
}

export default App;