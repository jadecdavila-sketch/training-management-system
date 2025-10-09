import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ParticipantsPage } from './pages/admin/ParticipantsPage';
import { Layout } from './components/Layout';
import { DesignSystemPage } from './pages/DesignSystemPage';
import { UsersPage } from './pages/admin/UsersPage';
import { LocationsPage } from './pages/admin/LocationsPage';
import { ProgramsPage } from './pages/admin/ProgramsPage';
import { ProgramCreationWizard } from './pages/admin/ProgramCreationWizard';
import { ProgramCohortsPage } from './pages/admin/ProgramCohortsPage';
import { CohortDetailPage } from './pages/admin/CohortDetailPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ErrorTestPage } from './pages/admin/ErrorTestPage';

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
              {/* All users can view */}
              <Route path="participants" element={<ParticipantsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="locations" element={<LocationsPage />} />
              <Route path="programs" element={<ProgramsPage />} />
              <Route path="programs/:programId/cohorts" element={<ProgramCohortsPage />} />
              <Route path="cohorts/:cohortId" element={<CohortDetailPage />} />

              {/* Only ADMIN and COORDINATOR can create/edit programs */}
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

              <Route path="design-system" element={<DesignSystemPage />} />
              <Route path="error-test" element={<ErrorTestPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;