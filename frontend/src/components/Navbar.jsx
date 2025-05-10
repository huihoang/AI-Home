import React, { useState, useEffect } from 'react';
import { FaSearch, FaBell, FaMoon, FaSun, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onDarkModeToggle, darkMode }) => {
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuVisible, setUserMenuVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const goToProfile = () => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user?.role === 'admin') {
      navigate('/admin-infor');
    } else {
      navigate('/user-infor');
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 32px',
      backgroundColor: darkMode ? '#2f3542' : 'white',
      color: darkMode ? 'white' : '#2f3542',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      {/* Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: darkMode ? '#57606f' : '#f5f6fa',
          borderRadius: '8px',
          padding: '8px 16px',
          flex: 1,
          maxWidth: '400px'
        }}>
          <FaSearch style={{ marginRight: '8px' }} />
          <input
            type="text"
            placeholder="Search devices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              width: '100%',
              color: darkMode ? 'white' : '#2f3542',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      {/* Right Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {/* Dark Mode Toggle */}
        <button
          onClick={() => onDarkModeToggle(!darkMode)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            ':hover': {
              backgroundColor: darkMode ? '#57606f' : '#f1f2f6'
            }
          }}
        >
          {darkMode ? (
            <FaSun size={20} color="#FFD700" />
          ) : (
            <FaMoon size={20} />
          )}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setNotificationsVisible(!notificationsVisible)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              ':hover': {
                backgroundColor: darkMode ? '#57606f' : '#f1f2f6'
              }
            }}
          >
            <FaBell size={20} />
          </button>
          
          {notificationsVisible && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '40px',
              width: '300px',
              backgroundColor: darkMode ? '#2f3542' : 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              padding: '16px'
            }}>
              <div style={{ 
                fontSize: '14px', 
                color: darkMode ? '#dfe4ea' : '#57606f',
                textAlign: 'center'
              }}>
                No new notifications
              </div>
            </div>
          )}
        </div>

        {/* User Avatar with dropdown menu */}
        {currentUser && (
          <div style={{ position: 'relative' }}>
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
              onClick={() => setUserMenuVisible(!userMenuVisible)}
            >
              {currentUser.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt="User Avatar"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <FaUserCircle size={32} />
              )}
              <span style={{ 
                fontWeight: 600,
                fontSize: '14px',
                color: darkMode ? 'white' : '#2f3542'
              }}>
                {currentUser.fullName || currentUser.username}
              </span>
            </div>
            
            {userMenuVisible && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '40px',
                width: '200px',
                backgroundColor: darkMode ? '#2f3542' : 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                padding: '8px 0',
                zIndex: 1001,
                border: darkMode ? '1px solid #57606f' : '1px solid #f1f2f6'
              }}>
                <button
                  onClick={goToProfile}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 16px',
                    background: 'none',
                    border: 'none',
                    color: darkMode ? 'white' : '#2f3542',
                    cursor: 'pointer',
                    ':hover': {
                      backgroundColor: darkMode ? '#57606f' : '#f1f2f6'
                    }
                  }}
                >
                  <FaUserCircle />
                  <span>Thông tin cá nhân</span>
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 16px',
                    background: 'none',
                    border: 'none',
                    color: darkMode ? 'white' : '#2f3542',
                    cursor: 'pointer',
                    ':hover': {
                      backgroundColor: darkMode ? '#57606f' : '#f1f2f6'
                    }
                  }}
                >
                  <FaSignOutAlt />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;