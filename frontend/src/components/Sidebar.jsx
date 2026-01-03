import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiGrid, FiUsers, FiClock, FiCalendar, FiDollarSign, FiSettings } from 'react-icons/fi';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user, isAdmin } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: FiGrid, label: 'Dashboard' },
    { path: '/employees', icon: FiUsers, label: 'Employees', adminOnly: true },
    { path: '/attendance', icon: FiClock, label: 'Attendance' },
    { path: '/time-off', icon: FiCalendar, label: 'Time Off' },
    { path: '/payroll', icon: FiDollarSign, label: 'Payroll' },
  ];

  const getLinkStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
    background: isActive ? '#f3e8ff' : 'transparent',
    color: isActive ? '#7c3aed' : '#4b5563',
    border: isActive ? '1px solid #c084fc' : '1px solid transparent',
    transition: 'all 0.2s'
  });

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 40
          }}
          className="lg-hide"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100%',
          width: '220px',
          background: 'white',
          borderRight: '1px solid #e5e7eb',
          paddingTop: '64px',
          zIndex: 40,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-out',
          display: 'flex',
          flexDirection: 'column'
        }}
        className="sidebar-aside"
      >
        <div style={{ padding: '16px', flex: 1 }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.map((item) => {
              // Skip admin-only items for non-admin users
              if (item.adminOnly && !isAdmin()) return null;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={({ isActive }) => getLinkStyle(isActive)}
                  onClick={closeSidebar}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Settings at bottom */}
        <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
          <NavLink
            to="/settings"
            style={({ isActive }) => getLinkStyle(isActive)}
            onClick={closeSidebar}
          >
            <FiSettings size={20} />
            <span>Settings</span>
          </NavLink>
        </div>
      </aside>

      <style>{`
        @media (min-width: 1024px) {
          .sidebar-aside { transform: translateX(0) !important; }
          .lg-hide { display: none !important; }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
