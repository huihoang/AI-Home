import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/LoginForm.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: '',
    phone: '',
    avatar: null
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          avatar: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = users.some(user => user.username === formData.username);
    
    if (userExists) {
      setError('Tài khoản đã tồn tại');
      return;
    }

    const newUser = {
      username: formData.username,
      password: formData.password,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      avatar: formData.avatar,
      joinDate: new Date().toISOString(),
      role: 'user'
    };
    
    localStorage.setItem('users', JSON.stringify([...users, newUser]));
    alert('Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.');
    navigate('/login');
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleRegister}>
        <h3>Đăng Ký Tài Khoản</h3>

        {error && <div className="error-message">{error}</div>}

        <label htmlFor="username">Tên đăng nhập</label>
        <input 
          type="text" 
          placeholder="Nhập tên đăng nhập" 
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">Mật khẩu</label>
        <input 
          type="password" 
          placeholder="Nhập mật khẩu" 
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <label htmlFor="confirmPassword">Nhập lại mật khẩu</label>
        <input 
          type="password" 
          placeholder="Nhập lại mật khẩu" 
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <label htmlFor="fullName">Họ và tên</label>
        <input 
          type="text" 
          placeholder="Nhập họ và tên" 
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Email</label>
        <input 
          type="email" 
          placeholder="Nhập email" 
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="phone">Số điện thoại</label>
        <input 
          type="tel" 
          placeholder="Nhập số điện thoại" 
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />

        <label htmlFor="avatar">Ảnh đại diện (tùy chọn)</label>
        <input 
          type="file" 
          id="avatar"
          accept="image/*"
          onChange={handleAvatarChange}
        />

        <button type="submit" className="login-button">Đăng Ký</button>
        
        <div className="register-link">
          Đã có tài khoản? <span onClick={() => navigate('/login')}>Đăng nhập ngay</span>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;