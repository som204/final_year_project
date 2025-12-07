// src/pages/DepartmentManagementPage.jsx
import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Search, Edit, Trash2 } from 'lucide-react';
import '../pages/Admin/InstituteAdmin.css'; // Reusing the same CSS (make sure modal styles exist)
import { UserContext } from '../Context/user.context'; // Assuming you have a UserContext for auth

const DepartmentManagementPage = () => {
  // Basic list / form state
  const [activeTab, setActiveTab] = useState('list');
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const { user } = useContext(UserContext);

  // Delete state
  const [deleteError, setDeleteError] = useState(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(null);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null); // department object being edited
  const [editForm, setEditForm] = useState({ name: '', code: '', description: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(null);

  // API: fetch departments for institute
  const fetchDepartments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/department/institute/${user.institute_id}`, {
        credentials: 'include',
        method: 'GET',
      });
      if (!response.ok) throw new Error('Failed to fetch departments.');
      const data = await response.json();
      setDepartments(data);
    } catch (err) {
      setError(err.message || 'An error occurred while loading departments.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Client-side search filter
  const filteredDepartments = useMemo(() => {
    return departments.filter(dept =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dept.code || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [departments, searchTerm]);

  // CREATE: handle new department form submit
  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    const payload = { ...formData, institute_id: user.institute_id };

    try {
      const response = await fetch('http://localhost:8000/department/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || 'Failed to register department.');

      setFormSuccess(`Department "${formData.name}" registered successfully!`);
      setFormData({ name: '', code: '', description: '' });
      // refresh and switch to list
      await fetchDepartments();
      setActiveTab('list');
    } catch (err) {
      setFormError(err.message || 'Failed to register department.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFormSuccess(null), 5000);
    }
  };

  // DELETE
  const handleDeptDelete = async (deptId) => {
    if (!window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) return;

    setDeleteError(null);
    setDeleteSuccess(null);
    setDeleteLoadingId(deptId);

    try {
      const response = await fetch(`http://localhost:8000/department/${deptId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      let payload = {};
      try { payload = await response.json(); } catch (e) { /* ignore */ }
      if (!response.ok) throw new Error(payload.detail || 'Failed to delete department.');

      await fetchDepartments();
      setDeleteSuccess('Department deleted successfully.');
      setTimeout(() => setDeleteSuccess(null), 4000);
    } catch (err) {
      setDeleteError(err.message || 'An unknown error occurred.');
      // clear after some time
      setTimeout(() => setDeleteError(null), 5000);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  // EDIT modal helpers
  const openEditModal = (dept) => {
    setEditingDept(dept);
    setEditForm({
      name: dept.name ?? '',
      code: dept.code ?? '',
      description: dept.description ?? '',
    });
    setEditError(null);
    setEditSuccess(null);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingDept(null);
    setEditForm({ name: '', code: '', description: '' });
    setEditLoading(false);
    setEditError(null);
    setEditSuccess(null);
  };

  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editingDept || !editingDept.id) return;
    setEditLoading(true);
    setEditError(null);
    setEditSuccess(null);

    try {
      const response = await fetch(`http://localhost:8000/department/${editingDept.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          code: editForm.code,
          description: editForm.description,
          // server may expect institute_id or other fields — add if required
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || 'Failed to update department.');

      // Update local state optimistically or re-fetch
      await fetchDepartments();
      setEditSuccess('Department updated successfully.');
      // close after short delay
      setTimeout(() => {
        closeEditModal();
      }, 900);
    } catch (err) {
      setEditError(err.message || 'Failed to update department.');
    } finally {
      setEditLoading(false);
      setTimeout(() => setEditSuccess(null), 4000);
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
            {deleteError && <p className="form-message error">{deleteError}</p>}
            {deleteSuccess && <p className="form-message success">{deleteSuccess}</p>}

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
                          <button
                            className="action-button edit"
                            title="Edit department"
                            onClick={() => openEditModal(dept)}
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            className="action-button delete"
                            title="Delete department"
                            onClick={() => handleDeptDelete(dept.id)}
                            disabled={deleteLoadingId === dept.id}
                          >
                            <Trash2 size={16} />
                          </button>
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

      {/* ================= Edit Modal ================= */}
      {editModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeEditModal(); }}>
          <div className="modal-content" role="dialog" aria-modal="true" aria-label={`Edit ${editingDept?.name ?? 'department'}`}>
            <div className="modal-toolbar">
              <div className="modal-title">
                <h3>Edit Department</h3>
                <div className="subtitle modal-meta">{editingDept?.name ?? ''}</div>
              </div>

              <div className="toolbar-actions">
                <button className="modal-close-btn" onClick={closeEditModal}>Close</button>
              </div>
            </div>

            <div className="modal-body">
              <form onSubmit={handleEditSave}>
                <label style={{ fontSize: 13, color: '#334155', marginBottom: 6 }}>Name</label>
                <input
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  required
                  style={{ width: '100%', marginBottom: 10, padding: '8px 10px', borderRadius: 8, border: '1px solid #e6eef6' }}
                />

                <label style={{ fontSize: 13, color: '#334155', marginBottom: 6 }}>Code</label>
                <input
                  name="code"
                  value={editForm.code}
                  onChange={handleEditChange}
                  required
                  style={{ width: '100%', marginBottom: 10, padding: '8px 10px', borderRadius: 8, border: '1px solid #e6eef6' }}
                />

                <label style={{ fontSize: 13, color: '#334155', marginBottom: 6 }}>Description</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  rows={4}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e6eef6', marginBottom: 12 }}
                />

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
      {/* ================================================ */}
    </div>
  );
};

export default DepartmentManagementPage;
