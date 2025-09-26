import React, { useState, useEffect, useMemo, useContext } from 'react';
import '../pages/Super Admin/SuperAdmin.css'; // Your existing CSS file
import { 
    Search, Filter, Building, Code, MapPin, Mail, 
    Phone, User, AtSign, AlertCircle, CheckCircle2 
} from 'lucide-react';

// Main page component that manages everything
const InstituteManagementPage = () => {
    // State for tabs, data, search, and filters
    const [activeTab, setActiveTab] = useState('list');
    const [institutes, setInstitutes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'approved', 'pending'

    // Form state is managed here but only used in the 'create' tab
    const [formData, setFormData] = useState({
        name: '', code: '', address: '', contact_email: '', contact_phone: '',
        admin_email: '', admin_name: '', admin_phone: '', is_approved: false
    });
    const [formIsLoading, setFormIsLoading] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);

    // Function to fetch data from the API
    const fetchInstitutes = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8000/institute/all', {
              credentials: 'include',
              method: 'GET',
            });
            if (!response.ok) throw new Error('Failed to fetch institutes.');
            const data = await response.json();
            setInstitutes(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch data when the component mounts
    useEffect(() => {
        fetchInstitutes();
    }, []);

    // Logic for filtering and searching the list
    const filteredInstitutes = useMemo(() => {
        return institutes
            .filter(inst => {
                if (filterStatus === 'approved') return inst.is_approved === true;
                if (filterStatus === 'pending') return inst.is_approved === false;
                return true;
            })
            .filter(inst =>
                inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inst.code.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [institutes, searchTerm, filterStatus]);

    // Handlers for the create form
    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormIsLoading(true);
        setFormError(null);
        setFormSuccess(null);

        try {
            const response = await fetch('http://localhost:8000/institute/create', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Failed to register institute.');

            setFormSuccess(`Institute "${formData.name}" registered successfully!`);
            setFormData({ name: '', code: '', address: '', contact_email: '', contact_phone: '', admin_email: '', admin_name: '', admin_phone: '', is_approved: false });
            
            // Refetch the list and switch back to the list view
            fetchInstitutes();
            setActiveTab('list');

        } catch (err) {
            setFormError(err.message);
        } finally {
            setFormIsLoading(false);
            setTimeout(() => setFormSuccess(null), 5000);
        }
    };

    return (
        <div className="management-page">
            <h1>Institute Management</h1>
            
            {/* Tab Navigation */}
            <div className="tabs">
                <button onClick={() => setActiveTab('list')} className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}>
                    Institute List
                </button>
                <button onClick={() => setActiveTab('create')} className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}>
                    Create New
                </button>
            </div>

            <div className="tab-content">
                {/* LIST VIEW */}
                {activeTab === 'list' && (
                    <div className="list-view">
                        <div className="list-controls">
                            <div className="search-bar">
                                <Search size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by name or code..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="filter-bar">
                                <Filter size={20} />
                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                    <option value="all">All Statuses</option>
                                    <option value="approved">Approved</option>
                                    <option value="pending">Pending Approval</option>
                                </select>
                            </div>
                        </div>
                        
                        {isLoading && <p>Loading institutes...</p>}
                        {error && <p className="error-message">{error}</p>}
                        {!isLoading && !error && (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Code</th>
                                        <th>Contact Email</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInstitutes.length > 0 ? (
                                        filteredInstitutes.map(inst => (
                                            <tr key={inst.id}>
                                                <td>{inst.name}</td>
                                                <td>{inst.code}</td>
                                                <td>{inst.contact_email}</td>
                                                <td>
                                                    <span className={`status-badge ${inst.is_approved ? 'approved' : 'pending'}`}>
                                                        {inst.is_approved ? 'Approved' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="actions-cell">
                                                    <button className="action-button edit">Edit</button>
                                                    <button className="action-button delete">Delete</button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5">No institutes found matching your criteria.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                    
                )}

                {/* CREATE VIEW */}
                {activeTab === 'create' && (
                    <form onSubmit={handleFormSubmit} className="institute-reg-form">
                        <div className="form-section">
                            <h3>Institute Details</h3>
                            <div className="form-row">
                                <div className="input-group">
                                    <label htmlFor="name">Institute Name</label>
                                    <Building size={18} className="input-icon" />
                                    <input type="text" id="name" name="name" placeholder="e.g., Global Institute" value={formData.name} onChange={handleFormChange} required />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="code">Institute Code</label>
                                    <Code size={18} className="input-icon" />
                                    <input type="text" id="code" name="code" placeholder="e.g., GIT" value={formData.code} onChange={handleFormChange} required />
                                </div>
                            </div>
                            <div className="input-group">
                                <label htmlFor="address">Full Address</label>
                                <MapPin size={18} className="input-icon" />
                                <input type="text" id="address" name="address" placeholder="123 University Lane, City, State" value={formData.address} onChange={handleFormChange} required />
                            </div>
                            <div className="form-row">
                                <div className="input-group">
                                    <label htmlFor="contact_email">Contact Email</label>
                                    <Mail size={18} className="input-icon" />
                                    <input type="email" id="contact_email" name="contact_email" placeholder="contact@institute.edu" value={formData.contact_email} onChange={handleFormChange} required />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="contact_phone">Contact Phone</label>
                                    <Phone size={18} className="input-icon" />
                                    <input type="tel" id="contact_phone" name="contact_phone" placeholder="+91 12345 67890" value={formData.contact_phone} onChange={handleFormChange} required />
                                </div>
                            </div>
                            <div className="toggle-group">
                                <label htmlFor="is_approved">Approve Institute Immediately</label>
                                <label className="toggle-switch">
                                    <input type="checkbox" id="is_approved" name="is_approved" checked={formData.is_approved} onChange={handleFormChange} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                        <div className="form-section">
                            <h3>Primary Admin Account</h3>
                            <div className="input-group">
                                <label htmlFor="admin_name">Admin Full Name</label>
                                <User size={18} className="input-icon" />
                                <input type="text" id="admin_name" name="admin_name" placeholder="e.g., Dr. Jane Smith" value={formData.admin_name} onChange={handleFormChange} required />
                            </div>
                            <div className="form-row">
                                <div className="input-group">
                                    <label htmlFor="admin_email">Admin Account Email</label>
                                    <AtSign size={18} className="input-icon" />
                                    <input type="email" id="admin_email" name="admin_email" placeholder="admin@institute.edu" value={formData.admin_email} onChange={handleFormChange} required />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="admin_phone">Admin Phone</label>
                                    <Phone size={18} className="input-icon" />
                                    <input type="tel" id="admin_phone" name="admin_phone" placeholder="+91 09876 54321" value={formData.admin_phone} onChange={handleFormChange} required />
                                </div>
                            </div>
                        </div>
                        
                        {formError && <p className="form-message error"><AlertCircle size={18} /> {formError}</p>}
                        {formSuccess && <p className="form-message success"><CheckCircle2 size={18} /> {formSuccess}</p>}
                        
                        <button type="submit" className="button button-accent" disabled={formIsLoading}>
                            {formIsLoading ? 'Registering...' : 'Register Institute'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default InstituteManagementPage;