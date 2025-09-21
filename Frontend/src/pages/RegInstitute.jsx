import React, { useState } from "react";
import "./Reginstitute.css"; // Import the CSS

export default function Reginstitute({ onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    shortName: "",
    type: "",
    affiliation: "",
    establishedYear: "",
    address: "",
    city: "",
    state: "",
    country: "",
    email: "",
    phone: "",
    website: "",
  });

  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Institute name is required.";
    if (!form.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      e.email = "Valid email required.";
    if (!form.phone.trim() || !/^\+?[0-9\- ]{7,15}$/.test(form.phone))
      e.phone = "Valid phone number required.";
    if (
      form.establishedYear &&
      !(Number(form.establishedYear) >= 1800 &&
        Number(form.establishedYear) <= new Date().getFullYear())
    )
      e.establishedYear = "Enter a valid year.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    if (onSubmit) onSubmit(form);
    else console.log("Submitting:", form);
  }

  function handleReset() {
    setForm({
      name: "",
      shortName: "",
      type: "",
      affiliation: "",
      establishedYear: "",
      address: "",
      city: "",
      state: "",
      country: "",
      email: "",
      phone: "",
      website: "",
    });
    setErrors({});
  }

  return (
    <div className="ir-wrapper">
      <form className="ir-card" onSubmit={handleSubmit} noValidate>
        <h2 className="ir-title">Institute Registration</h2>

        <div className="ir-row">
          <label>
            Reginstitute Name <span className="ir-required">*</span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full reginstitute name"
            />
            {errors.name && <div className="ir-error">{errors.name}</div>}
          </label>

          <label>
            Short Name / Code
            <input
              name="shortName"
              value={form.shortName}
              onChange={handleChange}
              placeholder="e.g., ABC College"
            />
          </label>
        </div>

        <div className="ir-row">
          <label>
            Type
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="">Select type</option>
              <option>University</option>
              <option>College</option>
              <option>Research Reginstitute</option>
              <option>School</option>
              <option>Other</option>
            </select>
          </label>

          <label>
            Affiliation
            <input
              name="affiliation"
              value={form.affiliation}
              onChange={handleChange}
              placeholder="Affiliated to..."
            />
          </label>
        </div>

        <div className="ir-row">
          <label>
            Established Year
            <input
              name="establishedYear"
              value={form.establishedYear}
              onChange={handleChange}
              placeholder="e.g., 1996"
            />
            {errors.establishedYear && (
              <div className="ir-error">{errors.establishedYear}</div>
            )}
          </label>

          <label>
            Website
            <input
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="https://"
            />
          </label>
        </div>

        <label>
          Address
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Street, building, etc."
            rows={3}
          />
        </label>

        <div className="ir-row">
          <label>
            City
            <input name="city" value={form.city} onChange={handleChange} />
          </label>

          <label>
            State / Province
            <input name="state" value={form.state} onChange={handleChange} />
          </label>

          <label>
            Country
            <input name="country" value={form.country} onChange={handleChange} />
          </label>
        </div>

        <div className="ir-row">
          <label>
            Contact Email <span className="ir-required">*</span>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="contact@reginstitute.edu"
            />
            {errors.email && <div className="ir-error">{errors.email}</div>}
          </label>

          <label>
            Phone <span className="ir-required">*</span>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
            />
            {errors.phone && <div className="ir-error">{errors.phone}</div>}
          </label>
        </div>

        <div className="ir-actions">
          <button
            type="button"
            className="ir-btn ghost"
            onClick={handleReset}
          >
            Reset
          </button>
          <button type="submit" className="ir-btn primary">
            Register Reginstitute
          </button>
        </div>
      </form>
    </div>
  );
}
