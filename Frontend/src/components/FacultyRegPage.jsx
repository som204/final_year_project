// src/pages/FacultyManagementPage.jsx
import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Search, Edit, Trash2 } from 'lucide-react';
import '../pages/Admin/InstituteAdmin.css'; // Reuse shared CSS (ensure modal styles exist)
import { UserContext } from '../Context/user.context';

const FacultyManagementPage = () => {
  // Tabs + data state
  const [activeTab, setActiveTab] = useState('list');
  const [facultyList, setFacultyList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Create form state
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', department_id: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // Delete state
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(null);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [editForm, setEditForm] = useState({ full_name: '', email: '', phone: '', department_id: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(null);

  const { user } = useContext(UserContext);

  // Fetch initial data: faculty + departments
  const fetchInitialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [facultyRes, deptsRes] = await Promise.all([
        fetch(`http://localhost:8000/user/institute/${user.institute_id}`, { credentials: 'include', method: 'GET' }),
        fetch(`http://localhost:8000/department/institute/${user.institute_id}`, { credentials: 'include', method: 'GET' })
      ]);

      if (!facultyRes.ok) throw new Error('Failed to fetch faculty.');
      if (!deptsRes.ok) throw new Error('Failed to fetch departments.');

      let facultyData = await facultyRes.json();
      const deptsData = await deptsRes.json();

      // filter to FACULTY role if server returns all users
      facultyData = (facultyData || []).filter(f => String(f.role || '').toUpperCase() === 'FACULTY');

      setFacultyList(facultyData);
      setDepartments(deptsData || []);
    } catch (err) {
      setError(err.message || 'Failed to load initial data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Client-side search
  const filteredFaculty = useMemo(() => {
    return (facultyList || []).filter(faculty =>
      (faculty.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (faculty.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [facultyList, searchTerm]);

  // Create form handlers
  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    // ⚠️ avoid predictable passwords in production
    const defaultPassword = (formData.full_name.split(' ')[0] || '').toLowerCase() + '123';
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
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || 'Failed to register faculty.');

      setFormSuccess(`Faculty member "${formData.full_name}" registered successfully!`);
      setFormData({ full_name: '', email: '', phone: '', department_id: '' });
      await fetchInitialData();
      setActiveTab('list');
    } catch (err) {
      setFormError(err.message || 'Failed to register faculty.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFormSuccess(null), 5000);
    }
  };

  // Delete handler
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setDeleteError(null);
    setDeleteSuccess(null);
    setDeleteLoadingId(userId);

    try {
      const res = await fetch(`http://localhost:8000/user/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      let payload = {};
      try { payload = await res.json(); } catch (e) { /* ignore */ }
      if (!res.ok) throw new Error(payload.detail || 'Failed to delete user.');

      // remove from local list
      setFacultyList(prev => prev.filter(u => u.id !== userId));
      setDeleteSuccess('User deleted.');
      setTimeout(() => setDeleteSuccess(null), 4000);
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete user.');
      setTimeout(() => setDeleteError(null), 4000);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  // Helper to get department name
  const getDepartmentName = (deptId) => {
    const d = departments.find(x => x.id === deptId);
    return d ? d.name : 'N/A';
  };

  // Edit modal helpers (open/close)
  const openEditModal = (faculty) => {
    setEditingFaculty(faculty);
    setEditForm({
      full_name: faculty.full_name ?? '',
      email: faculty.email ?? '',
      phone: faculty.phone ?? '',
      department_id: faculty.department_id ?? ''
    });
    setEditError(null);
    setEditSuccess(null);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingFaculty(null);
    setEditForm({ full_name: '', email: '', phone: '', department_id: '' });
    setEditLoading(false);
    setEditError(null);
    setEditSuccess(null);
  };

  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editingFaculty || !editingFaculty.id) return;
    setEditLoading(true);
    setEditError(null);
    setEditSuccess(null);

    try {
      const response = await fetch(`http://localhost:8000/user/${editingFaculty.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: editForm.full_name,
          phone: editForm.phone,
          department_id: parseInt(editForm.department_id, 10),
          // include other fields if backend expects them
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || 'Failed to update faculty.');

      // refresh list after update
      await fetchInitialData();
      setEditSuccess('Faculty updated successfully.');
      setTimeout(() => closeEditModal(), 800);
    } catch (err) {
      setEditError(err.message || 'Failed to update faculty.');
    } finally {
      setEditLoading(false);
      setTimeout(() => setEditSuccess(null), 4000);
    }
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
            {deleteError && <p className="form-message error">{deleteError}</p>}
            {deleteSuccess && <p className="form-message success">{deleteSuccess}</p>}

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
                          <button className="action-button edit" title="Edit" onClick={() => openEditModal(faculty)}><Edit size={16} /></button>
                          <button className="action-button delete" title="Delete" onClick={() => handleDeleteUser(faculty.id)} disabled={deleteLoadingId === faculty.id}><Trash2 size={16} /></button>
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

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeEditModal(); }}>
          <div className="modal-content" role="dialog" aria-modal="true" aria-label={`Edit ${editingFaculty?.full_name || 'faculty'}`}>
            <div className="modal-toolbar">
              <div className="modal-title">
                <h3>Edit Faculty</h3>
                <div className="subtitle modal-meta">{editingFaculty?.full_name}</div>
              </div>
              <div className="toolbar-actions">
                <button className="modal-close-btn" onClick={closeEditModal}>Close</button>
              </div>
            </div>

            <div className="modal-body">
              <form onSubmit={handleEditSave}>
                <label style={{ fontSize: 13, color: '#334155', marginBottom: 6 }}>Full name</label>
                <input
                  name="full_name"
                  value={editForm.full_name}
                  onChange={handleEditChange}
                  required
                  style={{ width: '100%', marginBottom: 10, padding: '8px 10px', borderRadius: 8, border: '1px solid #e6eef6' }}
                />

                <label style={{ fontSize: 13, color: '#334155', marginBottom: 6 }}>Email</label>
                <input
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  disabled
                  type="email"
                  style={{ width: '100%', marginBottom: 10, padding: '8px 10px', borderRadius: 8, border: '1px solid #e6eef6' }}
                />

                <label style={{ fontSize: 13, color: '#334155', marginBottom: 6 }}>Phone</label>
                <input
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  style={{ width: '100%', marginBottom: 10, padding: '8px 10px', borderRadius: 8, border: '1px solid #e6eef6' }}
                />

                <label style={{ fontSize: 13, color: '#334155', marginBottom: 6 }}>Department</label>
                <select
                  name="department_id"
                  value={editForm.department_id}
                  onChange={handleEditChange}
                  style={{ width: '100%', marginBottom: 12, padding: '8px 10px', borderRadius: 8, border: '1px solid #e6eef6' }}
                >
                  <option value="" disabled>Select department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>

                {editError && <p className="form-message error">{editError}</p>}
                {editSuccess && <p className="form-message success">{editSuccess}</p>}

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="button" className="modal-close-btn" onClick={closeEditModal} disabled={editLoading}>Cancel</button>
                  <button type="submit" className="btn-view" disabled={editLoading}>
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* End modal */}
    </div>
  );
};

export default FacultyManagementPage;
