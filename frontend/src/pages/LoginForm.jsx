import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/LoginForm.css';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.username === username);
    
    if (!user) {
      setError('Tài khoản không tồn tại');
      return;
    }
    
    if (user.password !== password) {
      setError('Sai mật khẩu');
      return;
    }
    
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(user));
    navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h3>Đăng Nhập</h3>

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