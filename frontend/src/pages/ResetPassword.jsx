import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../components/LoginForm.css';
import axios from 'axios';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
        console.log("TOKEN gửi từ URL:", token);
console.log("MẬT KHẨU gửi:", password);

      const response = await axios.post('http://localhost:8080/users/reset-password', {
  token,
  new_password: password
});



      if (response.data.success) {
        setSuccess(true);
      } else {
        setError(response.data.message || 'Có lỗi xảy ra khi đặt lại mật khẩu');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể kết nối đến server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h3>Đặt Lại Mật Khẩu</h3>

        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.
          </div>
        )}

        {!success && (
          <>
            <label htmlFor="password">Mật khẩu mới</label>
            <input 
              type="password" 
              placeholder="Nhập mật khẩu mới" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
            />

            <label htmlFor="confirmPassword">Nhập lại mật khẩu mới</label>
            <input 
              type="password" 
              placeholder="Nhập lại mật khẩu mới" 
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
            />

            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>
          </>
        )}
        
        {success && (
          <div className="register-link">
            <span onClick={() => navigate('/login')}>Đăng nhập ngay</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default ResetPassword;