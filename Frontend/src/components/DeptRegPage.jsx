import React, { useState } from 'react';
import '../pages/Admin/InstituteAdmin.css'; // Reuse the same CSS for consistency

const DeptRegPage = () => {
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    const payload = { ...formData };
    console.log("Submitting department data:", JSON.stringify(payload, null, 2));

    try {
      /*
      // --- REAL API CALL (Commented out) ---
      // const response = await fetch('/api/institute/departments', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message || 'Failed to register department.');
      */
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      setSuccess(`Department "${formData.name}" registered successfully!`);
      setFormData({ name: '', code: '', description: '' }); // Clear form
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ia-page-content">
      <h1>Register New Department</h1>
      <form onSubmit={handleSubmit} className="ia-form">
        <div className="form-row">
          <input type="text" name="name" placeholder="Department Name" value={formData.name} onChange={handleChange} required />
          <input type="text" name="code" placeholder="Department Code (e.g., CSE)" value={formData.code} onChange={handleChange} required />
        </div>
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />
        
        {error && <p className="form-message error">{error}</p>}
        {success && <p className="form-message success">{success}</p>}
        
        <button type="submit" className="button button-accent" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register Department'}
        </button>
      </form>
    </div>
  );
};

export default DeptRegPage;