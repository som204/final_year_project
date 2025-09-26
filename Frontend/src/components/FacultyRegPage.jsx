import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Search, Edit, Trash2 } from 'lucide-react';
import '../pages/Admin/InstituteAdmin.css'; // Reusing the same CSS

const FacultyManagementPage = () => {
    // State for tabs, data, search, and the form
    const [activeTab, setActiveTab] = useState('list');
    const [facultyList, setFacultyList] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', department_id: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);


    // API call to fetch both faculty and departments for the admin's institute
    const fetchInitialData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [facultyRes, deptsRes] = await Promise.all([
                fetch('http://localhost:8000/user/all', { credentials: 'include', method: 'GET' }),
                fetch('http://localhost:8000/department/all', { credentials: 'include', method: 'GET' })
            ]);
            if (!facultyRes.ok || !deptsRes.ok) throw new Error('Failed to fetch initial page data.');
            let facultyData = await facultyRes.json();
            const deptsData = await deptsRes.json();

            facultyData = facultyData.filter((faculty)=>{
              return faculty.role=="FACULTY"
            })
            setFacultyList(facultyData);
            setDepartments(deptsData);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchInitialData();
    }, []);

    // Client-side search logic
    const filteredFaculty = useMemo(() => {
        return facultyList.filter(faculty =>
            faculty.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faculty.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [facultyList, searchTerm]);

    // Handler for create form inputs
    const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Handler for submitting the new faculty form
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError(null);
        setFormSuccess(null);

        // ⚠️ Security Warning: Generating predictable passwords is a high risk.
        const defaultPassword = formData.full_name.split(' ')[0].toLowerCase() + '123';
        const payload = {
            ...formData,
            role: 'FACULTY',
            username: formData.email,
            password: defaultPassword,
            institute_id: user.institute_id
        };

        try {
            const response = await fetch('http://localhost:8000/user/register', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Failed to register faculty.');

            setFormSuccess(`Faculty member "${formData.full_name}" registered successfully!`);
            setFormData({ full_name: '', email: '', phone: '', department_id: '' });
            fetchInitialData();
            setActiveTab('list');
        } catch (err) {
            setFormError(err.message);
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setFormSuccess(null), 5000);
        }
    };

    // Helper to get department name from ID for the list view
    const getDepartmentName = (deptId) => {
        const dept = departments.find(d => d.id === deptId);
        return dept ? dept.name : 'N/A';
    };

    return (
        <div className="management-page">
            <h1>Faculty Management</h1>
            <div className="tabs">
                <button onClick={() => setActiveTab('list')} className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}>Faculty List</button>
                <button onClick={() => setActiveTab('create')} className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}>Register New Faculty</button>
            </div>

            <div className="tab-content">
                {/* LIST VIEW */}
                {activeTab === 'list' && (
                    <div className="list-view">
                        <div className="list-controls">
                            <div className="search-bar">
                                <Search size={20} />
                                <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                        </div>
                        {isLoading && <p>Loading faculty...</p>}
                        {error && <p className="error-message">{error}</p>}
                        {!isLoading && !error && (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Full Name</th>
                                        <th>Email</th>
                                        <th>Department</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredFaculty.length > 0 ? (
                                        filteredFaculty.map(faculty => (
                                            <tr key={faculty.id}>
                                                <td>{faculty.full_name}</td>
                                                <td>{faculty.email}</td>
                                                <td>{getDepartmentName(faculty.department_id)}</td>
                                                <td className="actions-cell">
                                                    <button className="action-button edit"><Edit size={16} /></button>
                                                    <button className="action-button delete"><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4">No faculty members found.</td></tr>
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
                                <input type="text" name="full_name" placeholder="Full Name" value={formData.full_name} onChange={handleFormChange} required />
                                <select name="department_id" value={formData.department_id} onChange={handleFormChange} disabled={departments.length === 0} required>
                                    <option value="" disabled>{departments.length === 0 ? 'Loading Depts...' : 'Select Department'}</option>
                                    {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                                </select>
                            </div>
                            <div className="form-row">
                                <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleFormChange} required />
                                <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleFormChange} required />
                            </div>
                            {formError && <p className="form-message error">{formError}</p>}
                            {formSuccess && <p className="form-message success">{formSuccess}</p>}
                            <button type="submit" className="button button-accent" disabled={isSubmitting}>
                                {isSubmitting ? 'Registering...' : 'Register Faculty'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FacultyManagementPage;