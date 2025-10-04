import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ParticipantsPage } from './pages/admin/ParticipantsPage';
import { Layout } from './components/Layout';
import { DesignSystemPage } from './pages/DesignSystemPage';
import { UsersPage } from './pages/admin/UsersPage';
import { LocationsPage } from './pages/admin/LocationsPage';
import { ProgramsPage } from './pages/admin/ProgramsPage';
import { ProgramCreationWizard } from './pages/admin/ProgramCreationWizard';

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
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/admin/participants" replace />} />
            <Route path="admin">
              <Route path="participants" element={<ParticipantsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="locations" element={<LocationsPage />} />
              <Route path="programs" element={<ProgramsPage />} />
              <Route path="design-system" element={<DesignSystemPage />} />
              <Route path="programs/new" element={<ProgramCreationWizard />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;