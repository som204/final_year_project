// src/pages/DepartmentManagementSuperAdmin.jsx
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

  // Edit modal state (same "do the same" behaviour as other pages)
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    code: '',
    institute_id: '',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(null);

  // Fetch departments + institutes
  const fetchDepartmentsAndInstitutes = async () => {
    if (!token) {
      setIsLoading(false);
      setError('Authentication required.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [deptsRes, institutesRes] = await Promise.all([
        fetch('http://localhost:8000/department/all', { credentials: 'include', method: 'GET' }),
        fetch('http://localhost:8000/institute/all', { credentials: 'include', method: 'GET' })
      ]);

      if (!deptsRes.ok || !institutesRes.ok) {
        const t1 = await deptsRes.text().catch(() => null);
        const t2 = await institutesRes.text().catch(() => null);
        throw new Error(t1 || t2 || 'Failed to fetch department data.');
      }

      const deptsData = await deptsRes.json();
      const institutesData = await institutesRes.json();

      setDepartments(deptsData || []);
      setInstitutes(institutesData || []);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentsAndInstitutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Memoized filtering for performance
  const filteredDepartments = useMemo(() => {
    return departments
      .filter(dept => filterInstitute === 'all' || String(dept.institute_id) === String(filterInstitute))
      .filter(dept =>
        (dept.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dept.code || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [departments, searchTerm, filterInstitute]);

  // Delete handler (unchanged)
  const handleDeptDelete = async (deptId) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      const response = await fetch(`http://localhost:8000/department/${deptId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to delete department.');
      }
      setDepartments(prev => prev.filter(dept => dept.id !== deptId));
    } catch (err) {
      setError(err.message || String(err));
      setTimeout(() => setError(null), 4000);
    }
  };

  // Open edit modal and populate form
  const openEditModal = (dept) => {
    setEditingDept(dept);
    setEditForm({
      name: dept.name ?? '',
      code: dept.code ?? '',
      institute_id: dept.institute_id ?? '',
    });
    setEditError(null);
    setEditSuccess(null);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingDept(null);
    setEditForm({ name: '', code: '', institute_id: '' });
    setEditError(null);
    setEditSuccess(null);
    setEditLoading(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Save edits via PUT
  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editingDept || !editingDept.id) return;
    setEditLoading(true);
    setEditError(null);
    setEditSuccess(null);

    try {
      const resp = await fetch(`http://localhost:8000/department/${editingDept.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(editForm),
      });

      const payload = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(payload.detail || 'Failed to update department.');

      setEditSuccess('Department updated successfully.');
      // Refresh lists to reflect changes (keeps data consistent)
      await fetchDepartmentsAndInstitutes();

      // close modal shortly after success
      setTimeout(() => closeEditModal(), 800);
    } catch (err) {
      setEditError(err.message || String(err));
    } finally {
      setEditLoading(false);
    }
  };

  if (isLoading) return <p><Loader className="spinner" /> Loading data...</p>;
  if (error) return <p className="form-message error"><AlertCircle /> {error}</p>;

  return (
    <div className="management-page">
      <h1>Global Department Management</h1>

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
                  <button className="action-button edit" onClick={() => openEditModal(dept)}><Edit size={16} /></button>
                  <button className="action-button delete" onClick={() => handleDeptDelete(dept.id)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      {editModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) closeEditModal(); }}
        >
          <div className="modal-content" role="dialog" aria-modal="true" aria-label={`Edit department ${editingDept?.name || ''}`}>
            <div className="modal-toolbar">
              <div className="modal-title">
                <h3>Edit Department</h3>
                <div className="subtitle modal-meta">{editingDept?.name}</div>
              </div>
              <div className="toolbar-actions">
                <button className="modal-close-btn" onClick={closeEditModal}>Close</button>
              </div>
            </div>

            <div className="modal-body">
              <form onSubmit={handleEditSave}>
                <label style={{ fontSize: 13, color: "#334155", marginBottom: 6 }}>Department Name</label>
                <input
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  required
                  style={{ width: "100%", marginBottom: 10, padding: "8px 10px", borderRadius: 8, border: "1px solid #e6eef6" }}
                />

                <label style={{ fontSize: 13, color: "#334155", marginBottom: 6 }}>Department Code</label>
                <input
                  name="code"
                  value={editForm.code}
                  onChange={handleEditChange}
                  style={{ width: "100%", marginBottom: 10, padding: "8px 10px", borderRadius: 8, border: "1px solid #e6eef6" }}
                />

                <label style={{ fontSize: 13, color: "#334155", marginBottom: 6 }}>Institute</label>
                <select
                  name="institute_id"
                  value={editForm.institute_id}
                  onChange={handleEditChange}
                  required
                  style={{ width: "100%", marginBottom: 10, padding: "8px 10px", borderRadius: 8, border: "1px solid #e6eef6" }}
                >
                  <option value="" disabled>Select institute</option>
                  {institutes.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
                </select>

                {editError && <p className="form-message error">{editError}</p>}
                {editSuccess && <p className="form-message success">{editSuccess}</p>}

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                  <button type="button" className="modal-close-btn" onClick={closeEditModal} disabled={editLoading}>Cancel</button>
                  <button type="submit" className="button button-accent" disabled={editLoading}>
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagementSuperAdmin;
