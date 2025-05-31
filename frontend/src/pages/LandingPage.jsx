import React from "react";
// import logo from "../assets/logo.png";

const LandingPage = () => {
  return (
    <div className="bg-gray-100 flex items-center justify-center h-screen">
      <div className="text-center">
        {/* <img
          src={logo}
          alt="AI-Home Logo"
          className="w-32 h-32 mx-auto mb-6 rounded-full shadow-lg"
        /> */}
        <h1 className="text-4xl font-bold text-gray-800">Welcome back</h1>
        <a
          href="/dashboard"
          className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Bắt đầu
        </a>
      </div>
    </div>
  );
};

export default LandingPage;
