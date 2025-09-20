import React, { useState } from "react";
import "./SuperAdmin.css";
import Navbar from "../components/Navbar";

function SuperAdmin() {
  const [institutes, setInstitutes] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddInstitute = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.contact) {
      alert("Please fill all fields");
      return;
    }
    setInstitutes([...institutes, { ...formData, id: Date.now() }]);
    setFormData({ name: "", email: "", contact: "" });
  };

  const handleDelete = (id) => {
    setInstitutes(institutes.filter((inst) => inst.id !== id));
  };

  return (
    <>
      <Navbar />
      <div className="superadmin-container">
        <h1>Super Admin Dashboard</h1>
        <p>Manage institutions that register on the portal.</p>

        {/* Add Institute Form */}
        <form className="institute-form" onSubmit={handleAddInstitute}>
          <input
            type="text"
            name="name"
            placeholder="Institute Name"
            value={formData.name}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Institute Email"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="text"
            name="contact"
            placeholder="Contact Number"
            value={formData.contact}
            onChange={handleChange}
          />
          <button type="submit" className="add-btn">Add Institute</button>
        </form>

        {/* List of Institutes */}
        <div className="institutes-list">
          <h2>Registered Institutes</h2>
          {institutes.length === 0 ? (
            <p>No institutes registered yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {institutes.map((inst) => (
                  <tr key={inst.id}>
                    <td>{inst.name}</td>
                    <td>{inst.email}</td>
                    <td>{inst.contact}</td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(inst.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

export default SuperAdmin;