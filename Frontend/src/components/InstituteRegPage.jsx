import React, { useState } from 'react';
import '../pages/Super Admin/SuperAdmin.css'; // CSS for the page

const InstituteRegPage = () => {
  const [formData, setFormData] = useState({
    institute_name: '',
    code: '',
    address: '',
    contact_email: '',
    contact_phone: '',
    admin_email: '',
    admin_full_name: '',
    admin_phone: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    // The data payload is already in the correct format
    const payload = { ...formData };
    console.log("Submitting institute data:", JSON.stringify(payload, null, 2));

    try {
      /*
      // --- REAL API CALL (Commented out) ---
      // const response = await fetch('/api/superadmin/register-institute', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });
      // const data = await response.json();
      // if (!response.ok) {
      //   throw new Error(data.message || 'Failed to register institute.');
      // }
      // --- END OF REAL API CALL ---
      */
      
      // Using dummy data logic for now
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      // Simulate a potential error for testing
      if (formData.institute_name.toLowerCase().includes('fail')) {
          throw new Error('This is a simulated registration failure.');
      }
      
      setSuccess(`Institute "${formData.institute_name}" registered successfully!`);
      setFormData({ // Clear form on success
        institute_name: '', code: '', address: '', contact_email: '',
        contact_phone: '', admin_email: '', admin_full_name: '', admin_phone: '',
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="institute-reg-page">
      <h1>Register New Institute</h1>
      <form onSubmit={handleSubmit} className="institute-reg-form">
        <div className="form-section">
          <h3>Institute Details</h3>
          <div className="form-row">
            <input type="text" name="institute_name" placeholder="Institute Name" value={formData.institute_name} onChange={handleChange} required />
            <input type="text" name="code" placeholder="Institute Code (e.g., GIT)" value={formData.code} onChange={handleChange} required />
          </div>
          <input type="text" name="address" placeholder="Full Address" value={formData.address} onChange={handleChange} required />
          <div className="form-row">
            <input type="email" name="contact_email" placeholder="Institute Contact Email" value={formData.contact_email} onChange={handleChange} required />
            <input type="tel" name="contact_phone" placeholder="Institute Contact Phone" value={formData.contact_phone} onChange={handleChange} required />
          </div>
        </div>
        
        <div className="form-section">
          <h3>Primary Admin Account</h3>
          <input type="text" name="admin_full_name" placeholder="Admin Full Name" value={formData.admin_full_name} onChange={handleChange} required />
          <div className="form-row">
            <input type="email" name="admin_email" placeholder="Admin Account Email" value={formData.admin_email} onChange={handleChange} required />
            <input type="tel" name="admin_phone" placeholder="Admin Phone" value={formData.admin_phone} onChange={handleChange} required />
          </div>
        </div>
        
        {error && <p className="form-message error">{error}</p>}
        {success && <p className="form-message success">{success}</p>}
        
        <button type="submit" className="button button-accent" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register Institute'}
        </button>
      </form>
    </div>
  );
};

export default InstituteRegPage;