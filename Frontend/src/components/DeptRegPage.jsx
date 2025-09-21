import React, { useState , useContext} from 'react';
import '../pages/Admin/InstituteAdmin.css'; // Reuse the same CSS for consistency
import { UserContext } from '../Context/user.context';

const DeptRegPage = () => {
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { user } = useContext(UserContext);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    console.log(user.institute_id);
    const payload = { ...formData,institute_id: user?.institute_id };
    console.log("Submitting department data:", JSON.stringify(payload, null, 2));

    try {
      const response = await fetch('http://localhost:8000/department/create', {
        credentials:"include",
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        console.log(data)
        throw new Error(data.message || 'Failed to register department.');}
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