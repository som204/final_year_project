import React, { useState, useEffect, useMemo, useContext } from 'react';
import { UserContext } from '../Context/user.context';
import { Search, Filter, Building, Users, Edit, Trash2, Loader, AlertCircle } from 'lucide-react';
import '../pages/Super Admin/SuperAdmin.css'; // Reusing the Super Admin CSS

const UserManagementSuperAdmin = () => {
    // State for users, institutes, and UI controls
    const [users, setUsers] = useState([]);
    const [institutes, setInstitutes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterInstitute, setFilterInstitute] = useState('all');
    const [filterRole, setFilterRole] = useState('all');
    const { token } = useContext(UserContext);

    // Fetch initial data (users and institutes)
    useEffect(() => {
        const fetchData = async () => {
            if (!token) {
                setIsLoading(false);
                setError("Authentication required.");
                return;
            }
            setIsLoading(true);
            try {
                const [usersRes, institutesRes] = await Promise.all([
                    fetch('http://localhost:8000/user/all', { credentials: 'include', method: 'GET' }),
                    fetch('http://localhost:8000/institute/all', { credentials: 'include', method: 'GET' })
                ]);
                if (!usersRes.ok || !institutesRes.ok) throw new Error('Failed to fetch user data.');
                
                const usersData = await usersRes.json();
                const institutesData = await institutesRes.json();

                setUsers(usersData);
                setInstitutes(institutesData);
                setUsers(usersData.filter(user => user.role !== 'SUPER_ADMIN'));
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [token]);

    // Memoized filtering for performance
    const filteredUsers = useMemo(() => {
        return users
            .filter(user => filterInstitute === 'all' || user.institute_id === parseInt(filterInstitute))
            .filter(user => filterRole === 'all' || user.role === filterRole)
            .filter(user => 
                user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [users, searchTerm, filterInstitute, filterRole]);
    
    if (isLoading) return <p><Loader className="spinner" /> Loading data...</p>;
    if (error) return <p className="form-message error"><AlertCircle /> {error}</p>;

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            setIsLoading(true);
            setError(null);
            const res = await fetch(`http://localhost:8000/user/${userId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to delete user.');
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="management-page">
            <h1>Global User Management</h1>
            <div className="list-view">
                <div className="list-controls">
                    <div className="search-bar">
                        <Search size={20} />
                        <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="filter-bar">
                        <Building size={16} />
                        <select value={filterInstitute} onChange={(e) => setFilterInstitute(e.target.value)}>
                            <option value="all">All Institutes</option>
                            {institutes.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
                        </select>
                    </div>
                    <div className="filter-bar">
                        <Users size={16} />
                        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                            <option value="all">All Roles</option>
                            <option value="ADMIN">Admin</option>
                            <option value="FACULTY">Faculty</option>
                            <option value="STUDENT">Student</option>
                        </select>
                    </div>
                </div>
                <table className="data-table">
                    <thead>
                        <tr><th>Full Name</th><th>Email</th><th>Role</th><th>Institute</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(u => (
                            <tr key={u.id}>
                                <td>{u.full_name}</td>
                                <td>{u.email}</td>
                                <td><span className={`status-badge role-${u.role.toLowerCase()}`}>{u.role}</span></td>
                                <td>{u.institute_name || 'N/A'}</td>
                                <td className="actions-cell">
                                    <button className="action-button edit"><Edit size={16} /></button>
                                    <button className="action-button delete" onClick={() => handleDeleteUser(u.id)}><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagementSuperAdmin;

