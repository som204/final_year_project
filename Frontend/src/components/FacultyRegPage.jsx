import React, { useState, useEffect } from 'react';
import '../pages/Admin/InstituteAdmin.css'; // Reuse the same CSS for consistency

const FacultyRegPage = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    department_name: '',
  });
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState({ departments: true, submitting: false });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch the list of departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        /*
        // --- REAL API CALL (Commented out) ---
        // const response = await fetch('/api/institute/departments');
        // const data = await response.json();
        // if (!response.ok) throw new Error('Failed to fetch departments.');
        // setDepartments(data);
        */

        // Using dummy data for now
        const mockData = [
          { id: 101, name: "Computer Science" },
          { id: 102, name: "Mechanical Engineering" },
          { id: 103, name: "Civil Engineering" },
        ];
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        setDepartments(mockData);
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

    const payload = { ...formData, role: 'Faculty' };
    console.log("Submitting faculty data:", JSON.stringify(payload, null, 2));

    try {
      /*
      // --- REAL API CALL (Commented out) ---
      // const response = await fetch('/api/institute/faculty', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message || 'Failed to register faculty.');
      */
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(`Faculty member "${formData.full_name}" registered successfully!`);
      setFormData({ full_name: '', email: '', phone: '', department_name: '' }); // Clear form
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  return (
    <div className="ia-page-content">
      <h1>Register New Faculty</h1>
      <form onSubmit={handleSubmit} className="ia-form">
        <div className="form-row">
          <input type="text" name="full_name" placeholder="Full Name" value={formData.full_name} onChange={handleChange} required />
          <select name="department_name" value={formData.department_name} onChange={handleChange} disabled={isLoading.departments} required>
            <option value="" disabled>{isLoading.departments ? 'Loading...' : 'Select Department'}</option>
            {departments.map(dept => <option key={dept.id} value={dept.name}>{dept.name}</option>)}
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