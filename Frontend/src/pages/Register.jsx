import React, { useState } from "react";
import "./Register.css"; 
import { registerUser } from "../api/userApi"; // ✅ correct path


const Register = () => {
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
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setResponseData(null);

    try {
      const response = await registerUser({
        ...formData,
        institute_id: Number(formData.institute_id),
        department_id: Number(formData.department_id),
      });

      setResponseData(response);
      console.log("✅ Registered User:", response);
    } catch (error) {
      console.error("Registration Error:", error);
      setErrorMsg(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Register-container">
      <div className="Register-card">
        <h2 className="portal-title">Annual Report Portal</h2>
        <p className="subtitle">Enter your details</p>

        <form onSubmit={handleSubmit} className="Register-form">
          {[
            { label: "Username", name: "username", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "Password", name: "password", type: "password" },
            { label: "Full Name", name: "full_name", type: "text" },
            { label: "Phone", name: "phone", type: "text" },
            { label: "Institute ID", name: "institute_id", type: "number" },
            { label: "Department ID", name: "department_id", type: "number" },
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

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>

        {errorMsg && <p className="error">{errorMsg}</p>}

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

export default Register;
