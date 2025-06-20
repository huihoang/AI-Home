import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../components/LoginForm.css";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    user_name: "",
    password: "",
    confirmPassword: "",
    full_Name: "",
    email: "",
    phoneNum: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu nhập lại không khớp");
      return;
    }

    try {
      await axios.post("http://localhost:8080/users/register", {
        user_name: formData.user_name,
        password: formData.password,
        email: formData.email,
        full_name: formData.full_Name,
        phoneNum: formData.phoneNum,
        identification: "",
        address: "",
        role: "user",
      });

      alert("Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.");
      navigate("/login");
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Lỗi kết nối đến server.");
      }
    }
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
          name="user_name"
          value={formData.user_name}
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
          name="full_Name"
          value={formData.full_Name}
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
          name="phoneNum"
          value={formData.phone}
          onChange={handleChange}
          required
        />

        <button type="submit" className="login-button">
          Đăng Ký
        </button>

        <div className="register-link">
          Đã có tài khoản?{" "}
          <span onClick={() => navigate("/login")}>Đăng nhập ngay</span>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
