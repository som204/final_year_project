import React, { useState, useEffect, useMemo, useContext } from 'react';
import { UserContext } from '../Context/user.context';
import { Search, Filter, Edit, Trash2, Loader, AlertCircle } from 'lucide-react';
import '../pages/Super Admin/SuperAdmin.css'; // Reusing the Super Admin CSS

const DepartmentManagementSuperAdmin = () => {
    // State for departments, institutes, and UI controls
    const [departments, setDepartments] = useState([]);
    const [institutes, setInstitutes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterInstitute, setFilterInstitute] = useState('all');
    const { token } = useContext(UserContext);

    // Fetch initial data (departments and institutes)
    useEffect(() => {
        const fetchData = async () => {
            if (!token) {
                setIsLoading(false);
                setError("Authentication required.");
                return;
            }
            setIsLoading(true);
            try {
                const [deptsRes, institutesRes] = await Promise.all([
                    fetch('http://localhost:8000/department/all', { credentials: 'include', method: 'GET'  }),
                    fetch('http://localhost:8000/institute/all', { credentials: 'include', method: 'GET' })
                ]);

                if (!deptsRes.ok || !institutesRes.ok) throw new Error('Failed to fetch department data.');
                
                const deptsData = await deptsRes.json();
                const institutesData = await institutesRes.json();

                setDepartments(deptsData);
                setInstitutes(institutesData);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [token]);

    // Memoized filtering for performance
    const filteredDepartments = useMemo(() => {
        return departments
            .filter(dept => filterInstitute === 'all' || dept.institute_id === parseInt(filterInstitute))
            .filter(dept => 
                dept.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                dept.code.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [departments, searchTerm, filterInstitute]);

    if (isLoading) return <p><Loader className="spinner" /> Loading data...</p>;
    if (error) return <p className="form-message error"><AlertCircle /> {error}</p>;

    return (
        <div className="management-page">
            <h1>Global Department Management</h1>
            <div className="list-view">
                <div className="list-controls">
                    <div className="search-bar">
                        <Search size={20} />
                        <input type="text" placeholder="Search by name or code..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="filter-bar">
                        <Filter size={20} />
                        <select value={filterInstitute} onChange={(e) => setFilterInstitute(e.target.value)}>
                            <option value="all">All Institutes</option>
                            {institutes.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
                        </select>
                    </div>
                </div>
                <table className="data-table">
                    <thead>
                        <tr><th>Department Name</th><th>Code</th><th>Institute</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {filteredDepartments.map(dept => (
                            <tr key={dept.id}>
                                <td>{dept.name}</td>
                                <td>{dept.code}</td>
                                <td>{dept.institute_name || 'N/A'}</td>
                                <td className="actions-cell">
                                    <button className="action-button edit"><Edit size={16} /></button>
                                    <button className="action-button delete"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DepartmentManagementSuperAdmin;
