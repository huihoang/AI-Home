import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/LoginForm.css';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    
    // Kiểm tra mật khẩu nhập lại
    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp');
      return;
    }

    // Kiểm tra tài khoản đã tồn tại chưa
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = users.some(user => user.username === username);
    
    if (userExists) {
      setError('Tài khoản đã tồn tại');
      return;
    }

    // Lưu thông tin người dùng mới
    const newUser = { username, password };
    localStorage.setItem('users', JSON.stringify([...users, newUser]));
    
    // Thông báo và chuyển hướng
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
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label htmlFor="password">Mật khẩu</label>
        <input 
          type="password" 
          placeholder="Nhập mật khẩu" 
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label htmlFor="confirmPassword">Nhập lại mật khẩu</label>
        <input 
          type="password" 
          placeholder="Nhập lại mật khẩu" 
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
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