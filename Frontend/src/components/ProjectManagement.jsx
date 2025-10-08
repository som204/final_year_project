import React, { useState, useEffect, useMemo, useContext } from 'react';
import { UserContext } from '../Context/user.context';
import { Search, Filter, Edit, Trash2 } from 'lucide-react';
import '../pages/Admin/InstituteAdmin.css'; // Reusing the existing CSS

const ProjectManagementPage = () => {
    // State for tabs, data, search, and form
    const [activeTab, setActiveTab] = useState('list');
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'ONGOING', // Default status for new projects
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);
    const { user, token } = useContext(UserContext);

    // Function to fetch projects for the admin's institute
    const fetchProjects = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // The backend should automatically filter projects by the admin's institute_id based on their token
            const response = await fetch(`http://localhost:8000/projects/institute/${user.institute_id}`, {
                credentials: 'include',
                method: 'GET',
            });
            if (!response.ok) throw new Error('Failed to fetch projects.');
            const data = await response.json();
            setProjects(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);
    // Memoized filtering and searching for performance
    const filteredProjects = useMemo(() => {
        return projects
            .filter(proj => {
                if (filterStatus === 'ALL') return true;
                return proj.status === filterStatus;
            })
            .filter(proj =>
                proj.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [projects, searchTerm, filterStatus]);

    // Handler for form input changes
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handler for submitting the new project form
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError(null);
        setFormSuccess(null);

        const payload = {
            ...formData,
            institute_id: user.institute_id,
        };

        try {
            const response = await fetch('http://localhost:8000/projects/create', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Failed to create project.');
            
            setFormSuccess(`Project "${formData.name}" created successfully!`);
            setFormData({ name: '', description: '', status: 'ONGOING' });
            
            // Refresh the project list and switch back to the list tab
            fetchProjects();
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
            <h1>Project Management</h1>
            
            <div className="tabs">
                <button onClick={() => setActiveTab('list')} className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}>
                    All Projects
                </button>
                <button onClick={() => setActiveTab('create')} className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}>
                    Create New Project
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
                                    placeholder="Search by project name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="filter-bar">
                                <Filter size={20} />
                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                    <option value="ALL">All Statuses</option>
                                    <option value="ONGOING">Ongoing</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="ON_HOLD">On Hold</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>
                        </div>
                        
                        {isLoading && <p>Loading projects...</p>}
                        {error && <p className="form-message error">{error}</p>}
                        {!isLoading && !error && (
                            <table className="data-table ia-data-table">
                                <thead>
                                    <tr>
                                        <th>Project Name</th>
                                        <th>Status</th>
                                        <th>Created On</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProjects.length > 0 ? (
                                        filteredProjects.map(proj => (
                                            <tr key={proj.id}>
                                                <td>{proj.name}</td>
                                                <td>
                                                    <span className={`status-badge status-${proj.status.toLowerCase()}`}>
                                                        {proj.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td>{new Date(proj.created_at).toLocaleDateString()}</td>
                                                <td className="actions-cell">
                                                    <button className="action-button delete"><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4">No projects found.</td>
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
                            <label>Project Name</label>
                            <input type="text" name="name" placeholder="e.g., Annual Report 2025-2026" value={formData.name} onChange={handleFormChange} required />
                            
                            <label>Description</label>
                            <textarea name="description" placeholder="A brief description of the project's goals..." value={formData.description} onChange={handleFormChange} required />
                            
                            <label>Initial Status</label>
                            <select name="status" value={formData.status} onChange={handleFormChange} required>
                                <option value="ONGOING">Ongoing</option>
                                <option value="ON_HOLD">On Hold</option>
                            </select>
                            
                            {formError && <p className="form-message error">{formError}</p>}
                            {formSuccess && <p className="form-message success">{formSuccess}</p>}
                            
                            <button type="submit" className="button button-accent" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating Project...' : 'Create Project'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectManagementPage;
