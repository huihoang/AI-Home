import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LoginForm from './pages/LoginForm';
import RegisterForm from './pages/RegisterForm';
import UserInfor from './pages/UserInfor';
import AdminInfor from './pages/AdminInfor';
const App = () => {
  return (
      <Routes>
        <Route exact path="/" element={<LoginForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/user-infor" element={<UserInfor />} />
        <Route path="/admin-infor" element={<AdminInfor />} />
      </Routes>
  );
};

export default App;
