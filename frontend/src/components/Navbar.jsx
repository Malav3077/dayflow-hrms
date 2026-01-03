import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiLogOut, FiMenu } from 'react-icons/fi';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      position: 'fixed',
      width: '100%',
      top: 0,
      zIndex: 50,
      height: '64px'
    }}>
      <div style={{
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={toggleSidebar}
            style={{
              padding: '8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '6px'
            }}
            className="mobile-only"
          >
            <FiMenu size={22} style={{ color: '#4b5563' }} />
          </button>

          {/* Top Navigation Tabs */}
          <div style={{ display: 'flex', gap: '8px' }} className="hide-mobile">
            <Link to="/dashboard" style={{
              padding: '8px 18px',
              background: '#f3e8ff',
              border: '1px solid #c084fc',
              borderRadius: '6px',
              textDecoration: 'none',
              color: '#7c3aed',
              fontSize: '14px',
              fontWeight: '500'
            }}>Dashboard</Link>
            {['Employees', 'Attendance', 'Time Off'].map(tab => (
              <Link key={tab} to={`/${tab.toLowerCase().replace(' ', '-')}`} style={{
                padding: '8px 18px',
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                textDecoration: 'none',
                color: '#4b5563',
                fontSize: '14px'
              }}>{tab}</Link>
            ))}
          </div>
        </div>

        {/* User Profile */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '6px'
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              background: '#fee2e2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FiUser style={{ color: '#dc2626' }} size={18} />
            </div>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: '8px',
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              border: '1px solid #e5e7eb',
              minWidth: '180px',
              zIndex: 100
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                <p style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '15px' }}>
                  {user?.firstName} {user?.lastName}
                </p>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0', textTransform: 'capitalize' }}>
                  {user?.role}
                </p>
              </div>
              <div style={{ padding: '8px' }}>
                <Link
                  to="/profile"
                  onClick={() => setShowDropdown(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    color: '#374151',
                    fontSize: '15px'
                  }}
                >
                  <FiUser size={18} />
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#dc2626',
                    fontSize: '15px',
                    width: '100%',
                    textAlign: 'left'
                  }}
                >
                  <FiLogOut size={18} />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .mobile-only { display: none !important; }
        }
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
