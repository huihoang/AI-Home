import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../components/LoginForm.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');  // Dùng email đúng với backend
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  setError('');

  try {
    const response = await axios.post('http://localhost:8080/users/login', {
      email,
      password
    });

    const {user, token} = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(user)); // Lưu thông tin user
    navigate('/dashboard');
  } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Lỗi kết nối đến server.');
      }
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h3>Đăng Nhập</h3>

        {error && <div className="error-message">{error}</div>}

        <label htmlFor="email">Email</label>
        <input
          type="email"
          placeholder="Nhập email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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

        <button type="submit" className="login-button">Đăng Nhập</button>

        <div className="register-link">
          Chưa có tài khoản? <span onClick={() => navigate('/register')}>Đăng ký ngay</span>
        </div>
        <div className="forgot-password-link">
          Quên mật khẩu? <span onClick={() => navigate('/forgot-password')}>Đặt lại mật khẩu</span>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
