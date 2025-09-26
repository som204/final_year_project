import React, { useState, useEffect } from "react";
import {
  BookOpenCheck,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Building,
  GraduationCap,
} from "lucide-react";
import "./Register.css"; // New CSS file
import { Link } from "react-router-dom";

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    phone: "",
    institute_name: "", // Will store the institute ID
    department_name: "",
  });

  const [institutes, setInstitutes] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState({
    institutes: true,
    departments: false,
    submitting: false,
  });
  const [error, setError] = useState({ page: null, form: null });

  // 1. Fetch all institutes on component mount
  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
      //   // Replace with your actual API endpoint
      //   const response = await fetch('http://localhost:8000/institute/all',{
      //     credentials:"include",
      //     method:"GET"
      //   });
      //   const data = await response.json();

        // Mocking API response for demonstration
        const mockData = [
          { id: 1, name: "Global Institute of Technology" },
          { id: 2, name: "National College of Arts" },
          { id: 3, name: "Metro Business School" },
        ];
        setInstitutes(mockData);
      } catch (err) {
        setError((prev) => ({
          ...prev,
          page: "Failed to load institutes. Please refresh the page.",
        }));
      } finally {
        setIsLoading((prev) => ({ ...prev, institutes: false }));
      }
    };
    fetchInstitutes();
  }, []);

  // 2. Fetch departments when institute changes
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!formData.institute_name || formData.institute_name === "other") {
        setDepartments([]);
        return;
      }
      setIsLoading((prev) => ({ ...prev, departments: true }));
      try {
        // Replace with your actual API endpoint
        // const response = await fetch(`/api/institutes/${formData.institute_name}/departments`);
        // const data = await response.json();

        // Mocking API response for demonstration
        const mockData = {
          1: [
            { id: 101, name: "Computer Science" },
            { id: 102, name: "Mechanical Engineering" },
          ],
          2: [
            { id: 201, name: "Fine Arts" },
            { id: 202, name: "History of Art" },
          ],
          3: [
            { id: 301, name: "Marketing" },
            { id: 302, name: "Finance" },
          ],
        }[formData.institute_name];
        setDepartments(mockData || []);
      } catch (err) {
        setError((prev) => ({ ...prev, form: "Failed to load departments." }));
      } finally {
        setIsLoading((prev) => ({ ...prev, departments: false }));
      }
    };
    fetchDepartments();
  }, [formData.institute_name]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInstituteChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      institute_name: value,
      department_name: "", // Reset department on institute change
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading((prev) => ({ ...prev, submitting: true }));
    setError((prev) => ({ ...prev, form: null }));

    // 3. Determine role and construct final payload
    const role =
      formData.institute_name !== "other" && formData.department_name
        ? "student"
        : "viewer";

    const payload = {
      ...formData,
      role,
      institute_name:
        formData.institute_name === "other"
          ? 0
          : parseInt(formData.institute_name, 10),
      department_name:
        formData.institute_name === "other" ? "" : formData.department_name,
    };

    console.log("Submitting to backend:", JSON.stringify(payload, null, 2));

    try {
      // Replace with your actual registration API endpoint
      // const response = await fetch('/api/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message || 'Registration failed.');

      // Mock success
      alert("Registration successful!");
      // Redirect or clear form here
    } catch (err) {
      setError((prev) => ({ ...prev, form: err.message }));
    } finally {
      setIsLoading((prev) => ({ ...prev, submitting: false }));
    }
  };

  if (isLoading.institutes)
    return <div className="loading-fullscreen">Loading...</div>;
  if (error.page)
    return <div className="loading-fullscreen error">{error.page}</div>;

  return (
    <div className="reg-page-container">
      <div className="reg-box">
        <div className="reg-branding">
          <a href="/" className="logo">
            <BookOpenCheck className="logo-icon" />
            Reportify
          </a>
          <p className="branding-quote">Transforming Data into Insight.</p>
        </div>
        <div className="reg-form-section">
          <h2>Create an Account</h2>
          <p className="form-intro">
            Join the platform to streamline your work.
          </p>
          <form onSubmit={handleSubmit}>
            {/* Form Fields */}
            <div className="form-row">
              <div className="input-group">
                <User className="input-icon" size={20} />
                <input
                  type="text"
                  name="full_name"
                  placeholder="Full Name"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <User className="input-icon" size={20} />
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="input-group">
              <Mail className="input-icon" size={20} />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <Phone className="input-icon" size={20} />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Dependent Dropdowns */}
            <div className="form-row">
              <div className="input-group">
                <Building className="input-icon" size={20} />
                <select
                  name="institute_name"
                  value={formData.institute_name}
                  onChange={handleInstituteChange}
                  required
                >
                  <option value="" disabled>
                    Select Institute
                  </option>
                  {institutes.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="input-group">
                <GraduationCap className="input-icon" size={20} />
                <select
                  name="department_name"
                  value={formData.department_name}
                  onChange={handleChange}
                  disabled={
                    !formData.institute_name ||
                    formData.institute_name === "other" ||
                    isLoading.departments
                  }
                >
                  <option value="" disabled>
                    {isLoading.departments ? "Loading..." : "Select Department"}
                  </option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error.form && <p className="error-message">{error.form}</p>}
            <button type="submit" className="button button-accent reg-button" disabled={isLoading.submitting}>
              {isLoading.submitting ? 'Registering...' : 'Create Account'}
            </button>
          </form>
          <div className="login-prompt">
            <p>
              Already have an account? <Link to="/login">Log In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
