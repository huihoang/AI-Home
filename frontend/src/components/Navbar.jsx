import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaBell,
  FaMoon,
  FaSun,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
const Navbar = ({ onDarkModeToggle, darkMode, notifications = [], setNotifications }) => {
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuVisible, setUserMenuVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const clearNotifications = () => {
    setNotifications([]);
  };
  const markAsRead = (index) => {
    const updatedNotifications = [...notifications];
    updatedNotifications[index].read = true;
    setNotifications(updatedNotifications);
  };
  const deleteNotification = (index) => {
  const updatedNotifications = [...notifications];
  updatedNotifications.splice(index, 1);
  setNotifications(updatedNotifications);
};
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const goToProfile = () => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user?.role === "admin") {
      navigate("/admin-infor");
    } else {
      navigate("/user-infor");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 32px",
        backgroundColor: darkMode ? "#2f3542" : "white",
        color: darkMode ? "white" : "#2f3542",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Search Bar */}
      <div
        style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: darkMode ? "#57606f" : "#f5f6fa",
            borderRadius: "8px",
            padding: "8px 16px",
            flex: 1,
            maxWidth: "400px",
          }}
        >
          <FaSearch style={{ marginRight: "8px" }} />
          <input
            type="text"
            placeholder="Search devices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              width: "100%",
              color: darkMode ? "white" : "#2f3542",
              fontSize: "14px",
            }}
          />
        </div>
      </div>

      {/* Right Section */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        {/* Dark Mode Toggle */}
        <button
          onClick={() => onDarkModeToggle(!darkMode)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            borderRadius: "50%",
            ":hover": {
              backgroundColor: darkMode ? "#57606f" : "#f1f2f6",
            },
          }}
        >
          {darkMode ? (
            <FaSun size={20} color="#FFD700" />
          ) : (
            <FaMoon size={20} />
          )}
        </button>

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setNotificationsVisible(!notificationsVisible)}
          >
            <FaBell size={20} />
            {notifications.filter((n) => !n.read).length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  backgroundColor: "#ff4757",
                  color: "white",
                  borderRadius: "50%",
                  width: "18px",
                  height: "18px",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {notifications.filter((n) => !n.read).length}
              </span>
            )}
          </button>

          {notificationsVisible && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "40px",
                width: "350px",
                maxHeight: "500px",
                overflowY: "auto",
                backgroundColor: darkMode ? "#2f3542" : "white",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  padding: "12px",
                  borderBottom: `1px solid ${darkMode ? "#57606f" : "#f1f2f6"}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <strong>Thông báo cảnh báo</strong>
                <button
                  onClick={clearNotifications}
                  style={{
                    background: "none",
                    border: "none",
                    color: darkMode ? "#a4b0be" : "#57606f",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Xóa tất cả
                </button>
              </div>

              {notifications.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center" }}>
                  Không có thông báo mới
                </div>
              ) : (
                notifications.map((notification, index) => (
                  <div
                    key={index}
                    onClick={() => markAsRead(index)}
                    style={{
                      padding: "12px",
                      borderBottom: `1px solid ${
                        darkMode ? "#57606f" : "#f1f2f6"
                      }`,
                      backgroundColor: notification.read
                        ? "transparent"
                        : darkMode
                        ? notification.type === "temperature"
                          ? "rgba(255, 107, 107, 0.2)"
                          : notification.type === "humidity"
                          ? "rgba(46, 213, 115, 0.2)"
                          : notification.type === "brightness"
                          ? "rgba(255, 165, 2, 0.2)"
                          : "rgba(74, 144, 226, 0.2)"
                        : notification.type === "temperature"
                        ? "rgba(255, 107, 107, 0.1)"
                        : notification.type === "humidity"
                        ? "rgba(46, 213, 115, 0.1)"
                        : notification.type === "brightness"
                        ? "rgba(255, 165, 2, 0.1)"
                        : "rgba(74, 144, 226, 0.1)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      
                      {notification.type === "temperature" && (
                        <span
                          style={{
                            marginRight: "10px",
                            color:
                              notification.severity === "high"
                                ? "#ff4757"
                                : "#ffa502",
                          }}
                        >
                          🌡️
                        </span>
                      )}
                      {notification.type === "humidity" && (
                        <span
                          style={{
                            marginRight: "10px",
                            color:
                              notification.severity === "high"
                                ? "#ff4757"
                                : "#2ed573",
                          }}
                        >
                          💧
                        </span>
                      )}
                      {notification.type === "brightness" && (
                        <span
                          style={{
                            marginRight: "10px",
                            color:
                              notification.severity === "high"
                                ? "#ff4757"
                                : "#ffd700",
                          }}
                        >
                          💡
                        </span>
                      )}
                      
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: notification.read ? "normal" : "bold",
                            color: darkMode ? "white" : "#2f3542",
                          }}
                        >
                          {notification.message}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: darkMode ? "#a4b0be" : "#57606f",
                            marginTop: "4px",
                          }}
                        >
                          {format(
                            new Date(notification.timestamp),
                            "HH:mm dd/MM/yyyy"
                          )}
                        </div>
                      </div>
                      {!notification.read && (
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: "#ff4757",
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User Avatar with dropdown menu */}
        {currentUser && (
          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
              onClick={() => setUserMenuVisible(!userMenuVisible)}
            >
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt="User Avatar"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <FaUserCircle size={32} />
              )}
              <span
                style={{
                  fontWeight: 600,
                  fontSize: "14px",
                  color: darkMode ? "white" : "#2f3542",
                }}
              >
                {currentUser.fullName || currentUser.username}
              </span>
            </div>

            {userMenuVisible && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "40px",
                  width: "200px",
                  backgroundColor: darkMode ? "#2f3542" : "white",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  padding: "8px 0",
                  zIndex: 1001,
                  border: darkMode ? "1px solid #57606f" : "1px solid #f1f2f6",
                }}
              >
                <button
                  onClick={goToProfile}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                    padding: "8px 16px",
                    background: "none",
                    border: "none",
                    color: darkMode ? "white" : "#2f3542",
                    cursor: "pointer",
                    ":hover": {
                      backgroundColor: darkMode ? "#57606f" : "#f1f2f6",
                    },
                  }}
                >
                  <FaUserCircle />
                  <span>Thông tin cá nhân</span>
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                    padding: "8px 16px",
                    background: "none",
                    border: "none",
                    color: darkMode ? "white" : "#2f3542",
                    cursor: "pointer",
                    ":hover": {
                      backgroundColor: darkMode ? "#57606f" : "#f1f2f6",
                    },
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
