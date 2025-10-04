import { Link, useLocation } from 'react-router-dom';

export const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { 
      path: '/admin/participants', 
      label: 'Participants',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
  { 
  path: '/admin/users', 
  label: 'Users',
  icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
},
    { 
      path: '/admin/programs', 
      label: 'Programs',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18" />
        </svg>
      )
    },
    { 
      path: '/admin/locations', 
      label: 'Locations',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      )
    },
     { 
    path: '/admin/design-system', 
    label: 'Design System',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <circle cx="8" cy="8" r="2" />
        <path d="M14.5 9.5L19 14" />
        <line x1="15" y1="15" x2="19" y2="19" />
      </svg>
    )
  },
  ];

  return (
    <div className="w-16 bg-primary-500 flex flex-col items-center py-6 gap-6">
      {/* Logo */}
      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="#FF6B2C"/>
        </svg>
      </div>

      {/* Nav Items */}
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            location.pathname === item.path
              ? 'bg-white text-primary-500'
              : 'text-white hover:bg-primary-600'
          }`}
          title={item.label}
        >
          {item.icon}
        </Link>
      ))}
    </div>
  );
};