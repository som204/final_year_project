import React, { useState } from "react";
import { loginUser } from "../api/express";
import "./Login.css";

function Login() {
  const [formData, setFormData] = useState({
    email: "",      // 👈 email instead of username
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setMessage("❌ Please fill in email and password.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      // Call API
      const { status, data, error } = await loginUser(formData);

      console.log("🔍 Backend Response:", data); // Debug print

      if (status) {
        setMessage("✅ Login successful!");
        if (data.access_token) {
          localStorage.setItem("token", data.access_token);
        }
        setFormData({ email: "", password: "" });
      } else {
        setMessage(`❌ ${data?.detail || error || "Login failed."}`);
      }
    } catch (err) {
      console.error("Unexpected Error:", err);
      setMessage("❌ Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit} className="login-form">
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
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && (
          <p className={message.startsWith("✅") ? "success" : "error"}>
            {message}
          </p>
        )}

        <a href="/register" className="register-link">
          Don’t have an account? Register
        </a>
      </div>
    </div>
  );
}

export default Login;
