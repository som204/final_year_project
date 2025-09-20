// src/pages/RegisterStudent.jsx
import React, { useState } from "react";
import { registerUser } from "../api/userApi";
import "./RegisterStudent.css";

const RegisterStudent = () => {
  const role = "STUDENT";
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    phone: "",
    roll_no: "",
    course: "",
    year: "",
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
        <h2 className="portal-title">Student Registration</h2>
        <form onSubmit={handleSubmit} className="Register-form">
          {[
            { label: "Username", name: "username", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "Password", name: "password", type: "password" },
            { label: "Full Name", name: "full_name", type: "text" },
            { label: "Phone", name: "phone", type: "text" },
            { label: "Roll No", name: "roll_no", type: "text" },
            { label: "Course", name: "course", type: "text" },
            { label: "Year", name: "year", type: "number" },
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

export default RegisterStudent;
