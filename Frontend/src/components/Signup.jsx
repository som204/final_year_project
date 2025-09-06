import React, { useState } from "react";
import "./Signup.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    alert(`Account created for ${formData.name} as ${formData.role} 🎉`);
    // Later: integrate backend signup API
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2 className="portal-title">Annual Report Portal</h2>
        <p className="subtitle">Create your account</p>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="input-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

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
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
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

          <button type="submit" className="signup-btn">Sign Up</button>

          <div className="extra-links">
            <a href="#">Already have an account? Login</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
