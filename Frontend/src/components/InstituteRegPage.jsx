import React, { useState , useContext} from 'react';
import '../pages/Super Admin/SuperAdmin.css'; // CSS for the page
import { UserContext } from '../Context/user.context';

const InstituteRegPage = () => {
  const { user } = useContext(UserContext);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    contact_email: '',
    contact_phone: '',
    admin_email: '',
    admin_name: '',
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
    const payload = { ...formData};
    console.log("Submitting institute data:", JSON.stringify(payload));
    const token = user?.access_token; // Assuming user object has a token property
    console.log(token)
    try {
      const response = await fetch('http://localhost:8000/institute/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        console.log('Error response data:', data);
        throw new Error(data.message || 'Failed to register institute.');
      }
      
      console.log('Institute registered successfully:', data);
      setSuccess(`Institute "${formData.name}" registered successfully!`);
      setFormData({ // Clear form on success
        name: '', code: '', address: '', contact_email: '',
        contact_phone: '', admin_email: '', admin_name: '', admin_phone: '',
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setSuccess(null);
      }, 5000); // Clear success message after 5 seconds
    }
  };

  return (
    <div className="institute-reg-page">
      <h1>Register New Institute</h1>
      <form onSubmit={handleSubmit} className="institute-reg-form">
        <div className="form-section">
          <h3>Institute Details</h3>
          <div className="form-row">
            <input type="text" name="name" placeholder="Institute Name" value={formData.name} onChange={handleChange} required />
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
          <input type="text" name="admin_name" placeholder="Admin Name" value={formData.admin_name} onChange={handleChange} required />
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