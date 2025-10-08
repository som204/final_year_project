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
import "./Register.css";
import { Link } from "react-router-dom";

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    phone: "",
    institute_id: "",
    department_id: "",
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

  // Fetch all institutes
  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const response = await fetch("http://localhost:8000/institute/all", {
          credentials: "include",
          method: "GET",
        });
        const data = await response.json();
        setInstitutes(data);
      } catch (err) {
        console.log(err);
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

  // Fetch departments when institute changes
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!formData.institute_id || formData.institute_id === "other") {
        setDepartments([]);
        return;
      }

      setIsLoading((prev) => ({ ...prev, departments: true }));
      try {
        const response = await fetch(
          `http://localhost:8000/department/institute/${formData.institute_id}`,
          {
            credentials: "include",
            method: "GET",
          }
        );
        const data = await response.json();
        setDepartments(
          data.filter((dept) => dept.name.toLowerCase() !== "administration")
        );
      } catch (err) {
        console.log(err);
        setError((prev) => ({ ...prev, form: "Failed to load departments." }));
      } finally {
        setIsLoading((prev) => ({ ...prev, departments: false }));
      }
    };

    fetchDepartments();
  }, [formData.institute_id]);

  // Handle change for normal inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle institute selection
  const handleInstituteChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      institute_id: value,
      department_id: "", // Reset department when institute changes
    }));
  };

  // Submit registration form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading((prev) => ({ ...prev, submitting: true }));
    setError((prev) => ({ ...prev, form: null }));

    const role =
      formData.institute_id !== "0" && formData.department_id
        ? "STUDENT"
        : "VIEWER";

    const payload = {
      ...formData,
      role,
      institute_id:
        formData.institute_id === "0"
          ? null
          : parseInt(formData.institute_id, 10),
      department_id:
        formData.institute_id === "0"
          ? null
          : parseInt(formData.department_id, 10),
    };

    console.log("Submitting to backend:", JSON.stringify(payload, null, 2));

    try {
      const response = await fetch("http://localhost:8000/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed.");

      alert("Registration successful!");
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
          <p className="form-intro">Join the platform to streamline your work.</p>

          <form onSubmit={handleSubmit}>
            {/* Name and Username */}
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

            {/* Email */}
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

            {/* Phone */}
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

            {/* Password */}
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

            {/* Institute and Department */}
            <div className="form-row">
              <div className="input-group">
                <Building className="input-icon" size={20} />
                <select
                  name="institute_id"
                  value={formData.institute_id}
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
                  <option value="0">Other</option>
                </select>
              </div>

              <div className="input-group">
                <GraduationCap className="input-icon" size={20} />
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  disabled={
                    !formData.institute_id ||
                    formData.institute_id === "0" ||
                    isLoading.departments
                  }
                  required={
                    formData.institute_id && formData.institute_id !== "0"
                  }
                >
                  <option value="" disabled>
                    {isLoading.departments ? "Loading..." : "Select Department"}
                  </option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error.form && <p className="error-message">{error.form}</p>}
            <button
              type="submit"
              className="button button-accent reg-button"
              disabled={isLoading.submitting}
            >
              {isLoading.submitting ? "Registering..." : "Create Account"}
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
