import React, { useState } from "react";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student", // default role
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Logging in as ${formData.role} with email: ${formData.email}`);
    // Later: integrate backend login API
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="portal-title">Annual Report Portal</h2>
        <p className="subtitle">Login to your account</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Role Selection */}
          <div className="input-group">
            <label>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="guest">Guest</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="login-btn">Login</button>

          <div className="extra-links">
            <a href="#">Don’t have an account? Sign Up</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
