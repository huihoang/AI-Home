import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/LoginForm.css';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:8080/users/forgot-password', {
        email: email
      });
      
      if (response.data.success) {
        setSuccess(true);
      } else {
        setError(response.data.message || 'Có lỗi xảy ra khi gửi yêu cầu');
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
        <h3>Quên Mật Khẩu</h3>

        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            Yêu cầu đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra email của bạn.
          </div>
        )}

        {!success && (
          <>
            <label htmlFor="email">Email đăng ký</label>
            <input 
              type="email" 
              placeholder="Nhập email đăng ký tài khoản" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
            </button>
          </>
        )}
        
        <div className="register-link">
          <span onClick={() => navigate('/login')}>Quay lại đăng nhập</span>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;