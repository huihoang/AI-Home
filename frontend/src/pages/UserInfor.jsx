import React, { useState, useEffect } from 'react';
import { FaUser, FaEdit, FaLock, FaSignOutAlt, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../components/Infor.css';

const UserInfor = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (savedUser) {
      setUser(savedUser);
      setFormData(savedUser);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSave = () => {
    const updatedUser = { ...formData };
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // Update in users array
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const updatedUsers = users.map(u => 
      u.username === updatedUser.username ? updatedUser : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    setEditMode(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          avatar: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`account-page ${darkMode ? 'dark-mode' : ''}`}>
      <div className="account-container">
        <button 
          className="btn-back"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft /> Quay lại
        </button>

        <div className="account-header">
          <h2>Thông Tin Tài Khoản</h2>
          <div className="role-badge">
            <FaUser /> {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
          </div>
        </div>

        <div className="account-profile">
          <div className="avatar-section">
            <div className="avatar-container">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar" className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">
                  <FaUser size={40} />
                </div>
              )}
              {editMode && (
                <label className="avatar-upload">
                  <input type="file" accept="image/*" onChange={handleAvatarChange} />
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
                    value={formData.username || ''}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Họ và tên</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            ) : (
              <>
                <h3>{user.fullName || user.username}</h3>
                <p><strong>Tên đăng nhập:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Số điện thoại:</strong> {user.phone}</p>
                <p><strong>Ngày tham gia:</strong> {new Date(user.joinDate).toLocaleDateString()}</p>
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
              <button className="btn-cancel" onClick={() => setEditMode(false)}>
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
      </div>
    </div>
  );
};

export default UserInfor;