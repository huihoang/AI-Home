import React, { useState, useEffect } from "react";
import {
  FaUserShield,
  FaEdit,
  FaLock,
  FaSignOutAlt,
  FaUsers,
  FaUser,
  FaThermometerHalf,
  FaCog,
  FaPlus,
  FaTrash,
  FaArrowLeft,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../components/Infor.css";

const AdminInfor = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [newDevice, setNewDevice] = useState({
    name: "",
    type: "light",
    status: false,
    room: "living_room",
  });

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (savedUser) {
      setUser(savedUser);
      setFormData(savedUser);
    }

    // Load mock data for admin
    const mockUsers = [
      {
        id: 1,
        username: "user1",
        fullName: "Nguyễn Văn A",
        email: "user1@example.com",
        phone: "0123456789",
        role: "user",
        joinDate: "2023-01-15",
      },
      {
        id: 2,
        username: "user2",
        fullName: "Trần Thị B",
        email: "user2@example.com",
        phone: "0987654321",
        role: "user",
        joinDate: "2023-02-20",
      },
    ];
    setUsers(mockUsers);

    const mockDevices = [
      {
        id: 1,
        name: "Đèn phòng khách",
        type: "light",
        status: true,
        room: "living_room",
      },
      {
        id: 2,
        name: "Quạt phòng ngủ",
        type: "fan",
        status: false,
        room: "bedroom",
      },
    ];
    setDevices(mockDevices);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = () => {
    const updatedUser = { ...formData };
    setUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    // Update in users array
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const updatedUsers = users.map((u) =>
      u.username === updatedUser.username ? updatedUser : u
    );
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    setEditMode(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          avatar: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const handleNewDeviceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewDevice({
      ...newDevice,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const addDevice = () => {
    if (newDevice.name.trim() === "") return;

    const device = {
      id: devices.length + 1,
      ...newDevice,
    };

    setDevices([...devices, device]);
    setNewDevice({
      name: "",
      type: "light",
      status: false,
      room: "living_room",
    });
  };

  const removeDevice = (id) => {
    setDevices(devices.filter((device) => device.id !== id));
  };

  const removeUser = (id) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`account-page ${darkMode ? "dark-mode" : ""}`}>
      <div className="account-container">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Quay lại
        </button>

        <div className="account-header">
          <h2>Thông Tin Tài Khoản</h2>
          <div className="role-badge">
            <FaUserShield /> Quản trị viên
          </div>
        </div>

        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <FaUserShield /> Thông tin cá nhân
          </button>
          <button
            className={`admin-tab ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <FaUsers /> Quản lý người dùng
          </button>
          <button
            className={`admin-tab ${activeTab === "devices" ? "active" : ""}`}
            onClick={() => setActiveTab("devices")}
          >
            <FaThermometerHalf /> Quản lý thiết bị
          </button>
          <button
            className={`admin-tab ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <FaCog /> Cài đặt hệ thống
          </button>
        </div>

        {activeTab === "profile" && (
          <>
            <div className="account-profile">
              <div className="avatar-section">
                <div className="avatar-container">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt="Avatar"
                      className="avatar-image"
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      <FaUserShield size={40} />
                    </div>
                  )}
                  {editMode && (
                    <label className="avatar-upload">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                      <FaEdit /> Thay đổi
                    </label>
                  )}
                </div>
              </div>

              <div className="info-section">
                {editMode ? (
                  <>
                    <div className="form-group">
                      <label>Tên đăng nhập</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username || ""}
                        onChange={handleInputChange}
                        disabled
                      />
                    </div>
                    <div className="form-group">
                      <label>Họ và tên</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Số điện thoại</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <h3>{user.fullName || user.username}</h3>
                    <p>
                      <strong>Tên đăng nhập:</strong> {user.username}
                    </p>
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                      <strong>Số điện thoại:</strong> {user.phone}
                    </p>
                    <p>
                      <strong>Ngày tham gia:</strong>{" "}
                      {new Date(user.joinDate).toLocaleDateString()}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="account-actions">
              {editMode ? (
                <>
                  <button className="btn-save" onClick={handleSave}>
                    Lưu thay đổi
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => setEditMode(false)}
                  >
                    Hủy bỏ
                  </button>
                </>
              ) : (
                <button className="btn-edit" onClick={() => setEditMode(true)}>
                  <FaEdit /> Chỉnh sửa thông tin
                </button>
              )}

              <button className="btn-change-password">
                <FaLock /> Đổi mật khẩu
              </button>

              <button className="btn-logout" onClick={handleLogout}>
                <FaSignOutAlt /> Đăng xuất
              </button>
            </div>
          </>
        )}

        {activeTab === "users" && (
          <div className="admin-content">
            <h3>
              <FaUsers /> Danh sách người dùng
            </h3>

            <div className="user-list">
              {users.map((user) => (
                <div key={user.id} className="user-card">
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.avatar ? (
                        <img src={user.avatar} alt="User Avatar" />
                      ) : (
                        <FaUser />
                      )}
                    </div>
                    <div>
                      <h4>{user.fullName || user.username}</h4>
                      <p>{user.email}</p>
                      <p>
                        Tham gia: {new Date(user.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="user-actions">
                    <button className="btn-edit">
                      <FaEdit />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => removeUser(user.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="add-user-form">
              <h4>
                <FaPlus /> Thêm người dùng mới
              </h4>
              <div className="form-group">
                <input type="text" placeholder="Email người dùng" />
                <button className="btn-save">Gửi lời mời</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "devices" && (
          <div className="admin-content">
            <h3>
              <FaThermometerHalf /> Quản lý thiết bị
            </h3>

            <div className="device-list">
              {devices.map((device) => (
                <div key={device.id} className="device-card">
                  <div className="device-icon">
                    {device.type === "light" ? (
                      <FaThermometerHalf />
                    ) : (
                      <FaThermometerHalf />
                    )}
                  </div>
                  <div className="device-info">
                    <h4>{device.name}</h4>
                    <p>Loại: {device.type === "light" ? "Đèn" : "Quạt"}</p>
                    <p>
                      Phòng:{" "}
                      {device.room === "living_room"
                        ? "Phòng khách"
                        : "Phòng ngủ"}
                    </p>
                    <p>Trạng thái: {device.status ? "Đang bật" : "Đang tắt"}</p>
                  </div>
                  <div className="device-actions">
                    <button className="btn-edit">
                      <FaEdit />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => removeDevice(device.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="add-device-form">
              <h4>
                <FaPlus /> Thêm thiết bị mới
              </h4>
              <div className="form-group">
                <label>Tên thiết bị</label>
                <input
                  type="text"
                  name="name"
                  value={newDevice.name}
                  onChange={handleNewDeviceChange}
                  placeholder="Ví dụ: Đèn phòng khách"
                />
              </div>
              <div className="form-group">
                <label>Loại thiết bị</label>
                <select
                  name="type"
                  value={newDevice.type}
                  onChange={handleNewDeviceChange}
                >
                  <option value="light">Đèn</option>
                  <option value="fan">Quạt</option>
                  <option value="sensor">Cảm biến</option>
                </select>
              </div>
              <div className="form-group">
                <label>Phòng</label>
                <select
                  name="room"
                  value={newDevice.room}
                  onChange={handleNewDeviceChange}
                >
                  <option value="living_room">Phòng khách</option>
                  <option value="bedroom">Phòng ngủ</option>
                  <option value="kitchen">Nhà bếp</option>
                  <option value="bathroom">Phòng tắm</option>
                </select>
              </div>
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="deviceStatus"
                  name="status"
                  checked={newDevice.status}
                  onChange={handleNewDeviceChange}
                />
                <label htmlFor="deviceStatus">Trạng thái bật</label>
              </div>
              <button className="btn-save" onClick={addDevice}>
                <FaPlus /> Thêm thiết bị
              </button>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="admin-content">
            <h3>
              <FaCog /> Cài đặt hệ thống
            </h3>

            <div className="settings-section">
              <h4>Cài đặt chung</h4>
              <div className="form-group">
                <label>Tên ngôi nhà</label>
                <input type="text" defaultValue="Nhà thông minh" />
              </div>
              <div className="form-group">
                <label>Địa chỉ</label>
                <input type="text" defaultValue="123 Đường ABC, Quận XYZ" />
              </div>
            </div>

            <div className="settings-section">
              <h4>Cài đặt bảo mật</h4>
              <div className="form-group checkbox-group">
                <input type="checkbox" id="twoFactor" defaultChecked />
                <label htmlFor="twoFactor">Xác thực hai yếu tố</label>
              </div>
              <div className="form-group checkbox-group">
                <input type="checkbox" id="notifications" defaultChecked />
                <label htmlFor="notifications">Thông báo qua email</label>
              </div>
            </div>

            <div className="settings-section">
              <h4>Giao diện</h4>
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="darkMode"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                />
                <label htmlFor="darkMode">Chế độ tối</label>
              </div>
            </div>

            <button className="btn-save">Lưu cài đặt</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInfor;
