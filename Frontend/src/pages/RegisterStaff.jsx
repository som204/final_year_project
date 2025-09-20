// src/pages/RegisterStaff.jsx
import React, { useState } from "react";
import { registerUser } from "../api/userApi";
import "./RegisterStaff.css";

const RegisterStaff = () => {
  const role = "STAFF";
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    phone: "",
    designation: "",
    department: "",
    joining_date: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [responseData, setResponseData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const response = await registerUser({ ...formData, role });
      setResponseData(response);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Register-container">
      <div className="Register-card">
        <h2 className="portal-title">Staff Registration</h2>
        <form onSubmit={handleSubmit} className="Register-form">
          {[
            { label: "Username", name: "username", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "Password", name: "password", type: "password" },
            { label: "Full Name", name: "full_name", type: "text" },
            { label: "Phone", name: "phone", type: "text" },
            { label: "Designation", name: "designation", type: "text" },
            { label: "Department", name: "department", type: "text" },
            { label: "Joining Date", name: "joining_date", type: "date" },
          ].map(({ label, name, type }) => (
            <div className="input-group" key={name}>
              <label>{label}</label>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                required
              />
            </div>
          ))}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Submitting..." : "Register"}
          </button>
        </form>
        {errorMsg && <p className="error">{errorMsg}</p>}
        {responseData && <pre>{JSON.stringify(responseData, null, 2)}</pre>}
      </div>
    </div>
  );
};

export default RegisterStaff;
