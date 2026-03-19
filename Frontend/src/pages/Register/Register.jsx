import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config";
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
        const response = await fetch(`${API_BASE_URL}/institute/all`, {
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
          `${API_BASE_URL}/department/institute/${formData.institute_id}`,
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

    // console.log("Submitting to backend:", JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(`${API_BASE_URL}/user/register`, {
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
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading...</div>;
  if (error.page)
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-rose-500">{error.page}</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-sans relative overflow-hidden py-4 lg:py-8">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-slate-50">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-3xl mix-blend-multiply animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-200/40 rounded-full blur-3xl mix-blend-multiply animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-5xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white flex flex-col md:flex-row overflow-hidden transform transition-all relative z-10">
        
        {/* Branding Section */}
        <div className="hidden md:flex flex-col justify-center text-center bg-linear-to-br from-indigo-900 via-indigo-800 to-violet-900 text-white p-12 w-full md:w-5/12 relative overflow-hidden">
          {/* Abstract glows inside the left panel */}
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div className="absolute top-10 right-10 w-32 h-32 bg-indigo-500 rounded-full blur-2xl mix-blend-screen"></div>
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-violet-500 rounded-full blur-3xl mix-blend-screen"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <a href="/" className="flex flex-col items-center justify-center gap-4 text-4xl font-bold text-white no-underline mb-8 group">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md group-hover:scale-110 transition-transform duration-500 border border-white/20 shadow-xl">
                <BookOpenCheck className="text-indigo-300 w-12 h-12" />
              </div>
              <span className="tracking-tight">Reportify</span>
            </a>
            <p className="text-lg font-light leading-relaxed text-indigo-100 max-w-xs mx-auto">
              Transforming raw institute data into beautiful, actionable insights across your entire organization.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-6 md:p-10 w-full md:w-7/12 flex flex-col justify-center relative bg-white">
          <div className="max-w-xl mx-auto w-full">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Create an Account</h2>
            <p className="text-slate-500 mb-5 font-light">Join the platform to streamline your work.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name and Username */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" size={20} />
                  <input
                    type="text"
                    name="full_name"
                    placeholder="Full Name"
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-12 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:font-normal placeholder:text-slate-400 shadow-sm"
                    required
                  />
                </div>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" size={20} />
                  <input
                    type="text"
                    name="username"
                    placeholder="Roll Number / ID"
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-12 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:font-normal placeholder:text-slate-400 shadow-sm"
                    required
                  />
                </div>
              </div>

              {/* Email and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" size={20} />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-12 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:font-normal placeholder:text-slate-400 shadow-sm"
                    required
                  />
                </div>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" size={20} />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-12 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:font-normal placeholder:text-slate-400 shadow-sm"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                  className="w-full px-4 py-3 pl-12 pr-12 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:font-normal placeholder:text-slate-400 shadow-sm"
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors focus:outline-none p-1 border-none bg-transparent cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="border-t border-slate-100 my-4 pt-4"></div>

              {/* Institute and Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" size={20} />
                  <select
                    name="institute_id"
                    value={formData.institute_id}
                    onChange={handleInstituteChange}
                    className="w-full px-4 py-3 pl-12 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer font-medium shadow-sm"
                    required
                  >
                    <option value="" disabled>Select Institute</option>
                    {institutes.map((inst) => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                    <option value="0">Other (Testing/Viewer)</option>
                  </select>
                </div>

                <div className="relative group">
                  <GraduationCap className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${(!formData.institute_id || formData.institute_id === "0" || isLoading.departments) ? 'text-slate-300' : 'text-slate-400 group-focus-within:text-indigo-500'}`} size={20} />
                  <select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleChange}
                    disabled={!formData.institute_id || formData.institute_id === "0" || isLoading.departments}
                    required={formData.institute_id && formData.institute_id !== "0"}
                    className="w-full px-4 py-3 pl-12 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer font-medium disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed shadow-sm"
                  >
                    <option value="" disabled>{isLoading.departments ? "Loading..." : "Select Department"}</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error.form && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3 animate-pulse mt-4">
                  <div className="w-1 h-full bg-rose-500 rounded-full absolute left-0 top-0 bottom-0"></div>
                  <p className="text-sm text-rose-600 font-medium relative">{error.form}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 mt-4 bg-linear-to-r from-indigo-500 to-violet-600 text-white font-bold text-lg rounded-xl hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center"
                disabled={isLoading.submitting}
              >
                {isLoading.submitting ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500 border-t border-slate-100 pt-5">
              <p>
                Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-800 hover:underline ml-1">Log In</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
