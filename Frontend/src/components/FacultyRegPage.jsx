import React, { useState, useEffect } from 'react';
import '../pages/Admin/InstituteAdmin.css'; // Reuse the same CSS for consistency

const FacultyRegPage = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    department_id: '',
  });
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState({ departments: true, submitting: false });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch the list of departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('http://localhost:8000/department/all',{
          credentials:"include",
          method:"GET"
        });
        const data = await response.json();
        if (!response.ok) throw new Error('Failed to fetch departments.');
        // console.log(data)
        setDepartments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(prev => ({ ...prev, departments: false }));
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(prev => ({ ...prev, submitting: true }));
    setError(null);
    setSuccess(null);

    const payload = { ...formData, role: 'FACULTY', username: formData.email, password: formData.full_name.split(' ')[0] + '123' ,institute_id: user.institute_id};
    console.log("Submitting faculty data:", JSON.stringify(payload, null, 2));
    // "username": "som@cse.com",
    // "password": "Som123"
    try {
      const response = await fetch('http://localhost:8000/user/register', {
        credentials: "include",
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        console.log(data);
        throw new Error(data.message || 'Failed to register faculty.');}
      setSuccess(`Faculty member "${formData.full_name}" registered successfully!`);
      setFormData({ full_name: '', email: '', phone: '', department_id: '' }); // Clear form
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(prev => ({ ...prev, submitting: false }));
      setTimeout(() => {
        setSuccess(null);
      },5000);
    }
  };

  return (
    <div className="ia-page-content">
      <h1>Register New Faculty</h1>
      <form onSubmit={handleSubmit} className="ia-form">
        <div className="form-row">
          <input type="text" name="full_name" placeholder="Full Name" value={formData.full_name} onChange={handleChange} required />
          <select name="department_id" value={formData.department_id} onChange={handleChange} disabled={isLoading.departments} required>
            <option value="" disabled>{isLoading.departments ? 'Loading...' : 'Select Department'}</option>
            {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
          </select>
        </div>
        <div className="form-row">
          <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
          <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
        </div>
        
        {error && <p className="form-message error">{error}</p>}
        {success && <p className="form-message success">{success}</p>}
        
        <button type="submit" className="button button-accent" disabled={isLoading.submitting}>
          {isLoading.submitting ? 'Registering...' : 'Register Faculty'}
        </button>
      </form>
    </div>
  );
};

export default FacultyRegPage;