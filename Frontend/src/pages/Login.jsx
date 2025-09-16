import React, { useState } from "react";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "SUPER_ADMIN",
    full_name: "",
    phone: "",
    institute_id: "",
    department_id: "",
  });

  const [responseData, setResponseData] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Generate response object
    const response = {
      id: Math.floor(Math.random() * 1000), // random ID
      username: formData.username,
      email: formData.email,
      role: formData.role,
      full_name: formData.full_name,
      phone: formData.phone,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      institute_id: Number(formData.institute_id),
      department_id: Number(formData.department_id),
    };

    setResponseData(response);
    console.log("Response Object:", response);
    alert("Form submitted! Check console for response.");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="portal-title">Annual Report Portal</h2>
        <p className="subtitle">Enter your details</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
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
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              <option value="ADMIN">ADMIN</option>
              <option value="FACULTY">FACULTY</option>
              <option value="STUDENT">STUDENT</option>
              <option value="GUEST">GUEST</option>
            </select>
          </div>

          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Institute ID</label>
            <input
              type="number"
              name="institute_id"
              value={formData.institute_id}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Department ID</label>
            <input
              type="number"
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="login-btn">Submit</button>
        </form>

        {responseData && (
          <div className="response-box">
            <h3>Response:</h3>
            <pre>{JSON.stringify(responseData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
