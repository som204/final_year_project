// src/pages/RegisterStaff.jsx
import React, { useState } from "react";
import { registerUser } from "../../api/userApi";
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
    <div className="min-h-screen flex justify-center items-center bg-blue-50 p-5 font-sans">
      <div className="bg-white px-8 py-10 rounded-xl shadow-lg w-full max-w-lg">
        <h2 className="text-center text-3xl mb-8 text-blue-900 font-bold">Staff Registration</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <div className="flex flex-col" key={name}>
              <label className="mb-1.5 font-medium text-slate-700">{label}</label>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="px-3 py-2.5 rounded-md border border-slate-300 text-base transition-all focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/20"
                required
              />
            </div>
          ))}

          <button 
            type="submit" 
            className="w-full mt-4 py-3 bg-blue-900 text-white font-medium text-lg rounded-lg transition-colors hover:bg-slate-900 disabled:bg-slate-400 disabled:cursor-not-allowed" 
            disabled={loading}
          >
            {loading ? "Submitting..." : "Register"}
          </button>
        </form>
        {errorMsg && <p className="text-rose-500 mt-4 text-center font-medium">{errorMsg}</p>}
        {responseData && <pre className="mt-4 p-4 bg-slate-100 rounded text-sm overflow-x-auto">{JSON.stringify(responseData, null, 2)}</pre>}
      </div>
    </div>
  );
};

export default RegisterStaff;
