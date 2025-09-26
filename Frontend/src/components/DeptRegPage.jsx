import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Search, Edit, Trash2 } from 'lucide-react';
import '../pages/Admin/InstituteAdmin.css'; // Reusing the same CSS

const DepartmentManagementPage = () => {
    // State for tabs, data, search, and the form
    const [activeTab, setActiveTab] = useState('list');
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({ name: '', code: '', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);


    // API call to fetch departments for the admin's specific institute
    const fetchDepartments = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // This endpoint should be protected and return departments only for the logged-in admin's institute
            const response = await fetch('http://localhost:8000/department/all', {
                credentials: 'include',
                method: 'GET',
            });
            if (!response.ok) throw new Error('Failed to fetch departments.');
            const data = await response.json();
            setDepartments(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch data when the component first loads
    useEffect(() => {
        fetchDepartments();
    }, []);

    // Logic to filter the departments based on the search term (client-side)
    const filteredDepartments = useMemo(() => {
        return departments.filter(dept =>
            dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [departments, searchTerm]);

    // Handler for the create form inputs
    const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Handler for submitting the new department form
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError(null);
        setFormSuccess(null);
        
        // The institute_id is automatically handled by the backend based on the logged-in admin
        const payload = { ...formData };

        try {
            const response = await fetch('http://localhost:8000/department/create', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Failed to register department.');
            
            setFormSuccess(`Department "${formData.name}" registered successfully!`);
            setFormData({ name: '', code: '', description: '' }); // Clear form
            
            // After successful creation, refetch the list and switch back to the list tab
            fetchDepartments();
            setActiveTab('list');
        } catch (err) {
            setFormError(err.message);
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setFormSuccess(null), 5000);
        }
    };

    return (
        <div className="management-page">
            <h1>Department Management</h1>
            
            <div className="tabs">
                <button onClick={() => setActiveTab('list')} className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}>
                    Department List
                </button>
                <button onClick={() => setActiveTab('create')} className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}>
                    Create New Department
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
                        </div>
                        
                        {isLoading && <p>Loading departments...</p>}
                        {error && <p className="error-message">{error}</p>}
                        {!isLoading && !error && (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Department Name</th>
                                        <th>Code</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDepartments.length > 0 ? (
                                        filteredDepartments.map(dept => (
                                            <tr key={dept.id}>
                                                <td>{dept.name}</td>
                                                <td>{dept.code}</td>
                                                <td className="actions-cell">
                                                    <button className="action-button edit"><Edit size={16} /></button>
                                                    <button className="action-button delete"><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3">No departments found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* CREATE VIEW */}
                {activeTab === 'create' && (
                    <div className="ia-page-content">
                        <form onSubmit={handleFormSubmit} className="ia-form">
                            <div className="form-row">
                                <input type="text" name="name" placeholder="Department Name" value={formData.name} onChange={handleFormChange} required />
                                <input type="text" name="code" placeholder="Department Code (e.g., CSE)" value={formData.code} onChange={handleFormChange} required />
                            </div>
                            <textarea name="description" placeholder="A brief description of the department..." value={formData.description} onChange={handleFormChange} required />
                            
                            {formError && <p className="form-message error">{formError}</p>}
                            {formSuccess && <p className="form-message success">{formSuccess}</p>}
                            
                            <button type="submit" className="button button-accent" disabled={isSubmitting}>
                                {isSubmitting ? 'Registering...' : 'Register Department'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DepartmentManagementPage;