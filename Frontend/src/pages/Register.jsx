import React, { useState } from "react";
import "./Register.css";

function Register() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      setMessage("❌ Please fill in all fields.");
      return;
    }

    setMessage(`✅ ${formData.name}, you have registered successfully!`);
    setFormData({ name: "", email: "", password: "" });
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Registration</h2>
        <form onSubmit={handleSubmit} className="register-form">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Register</button>
        </form>

        {message && (
          <p className={message.startsWith("✅") ? "success" : "error"}>{message}</p>
        )}

        <a href="/login" className="login-link">
          Already have an account? Login
        </a>
      </div>
    </div>
  );
}

export default Register;
