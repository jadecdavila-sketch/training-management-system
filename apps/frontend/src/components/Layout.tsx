import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const Layout = () => {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#FDF9F3' }}>
      <Sidebar />

      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};