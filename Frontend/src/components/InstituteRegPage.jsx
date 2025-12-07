// src/pages/InstituteManagementPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import '../pages/Super Admin/SuperAdmin.css'; // Your existing CSS file
import {
  Search, Filter, Building, Code, MapPin, Mail,
  Phone, User, AtSign, AlertCircle, CheckCircle2
} from 'lucide-react';

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

  // Edit modal state (for "do the same" behavior: open modal on edit & save via PUT)
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingInstitute, setEditingInstitute] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '', code: '', address: '', contact_email: '', contact_phone: '',
     is_approved: false
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(null);

  // Function to fetch data from the API
  const fetchInstitutes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/institute/all', {
        credentials: 'include',
        method: 'GET',
      });
      if (!response.ok) {
        const txt = await response.text().catch(() => null);
        throw new Error(txt || 'Failed to fetch institutes.');
      }
      const data = await response.json();
      setInstitutes(data || []);
    } catch (err) {
      setError(err.message || String(err));
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
        (inst.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inst.code || '').toLowerCase().includes(searchTerm.toLowerCase())
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || 'Failed to register institute.');

      setFormSuccess(`Institute "${formData.name}" registered successfully!`);
      setFormData({
        name: '', code: '', address: '', contact_email: '', contact_phone: '',
        admin_email: '', admin_name: '', admin_phone: '', is_approved: false
      });

      // Refetch the list and switch back to the list view
      await fetchInstitutes();
      setActiveTab('list');
    } catch (err) {
      setFormError(err.message || String(err));
    } finally {
      setFormIsLoading(false);
      setTimeout(() => setFormSuccess(null), 5000);
    }
  };

  // Open edit modal and initialise edit form
  const openEditModal = (inst) => {
    setEditingInstitute(inst);
    setEditForm({
      name: inst.name ?? '',
      code: inst.code ?? '',
      address: inst.address ?? '',
      contact_email: inst.contact_email ?? '',
      contact_phone: inst.contact_phone ?? '',
    //   admin_email: inst.admin_email ?? '',
    //   admin_name: inst.admin_name ?? '',
    //   admin_phone: inst.admin_phone ?? '',
      is_approved: !!inst.is_approved
    });
    setEditError(null);
    setEditSuccess(null);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingInstitute(null);
    setEditForm({
      name: '', code: '', address: '', contact_email: '', contact_phone: '',
       is_approved: false
    });
    setEditError(null);
    setEditSuccess(null);
    setEditLoading(false);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Save edits (PUT)
  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editingInstitute || !editingInstitute.id) return;
    setEditLoading(true);
    setEditError(null);
    setEditSuccess(null);
    console.log(editForm)
    try {
      const response = await fetch(`http://localhost:8000/institute/update/${editingInstitute.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || 'Failed to update institute.');

      setEditSuccess('Institute updated successfully.');
      // refresh list
      await fetchInstitutes();
      // close modal shortly after success
      setTimeout(() => closeEditModal(), 800);
    } catch (err) {
      setEditError(err.message || String(err));
    } finally {
      setEditLoading(false);
    }
  };

  // Delete institute
  const handleDeleteInstitute = async (instId) => {
    if (!instId) return;
    if (!window.confirm('Are you sure you want to delete this institute? This action cannot be undone.')) return;

    try {
      const resp = await fetch(`http://localhost:8000/institute/${instId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!resp.ok) {
        const payload = await resp.json().catch(() => ({}));
        throw new Error(payload.detail || 'Failed to delete institute.');
      }
      // refresh
      await fetchInstitutes();
    } catch (err) {
      setError(err.message || String(err));
      setTimeout(() => setError(null), 4000);
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
                          <button className="action-button edit" onClick={() => openEditModal(inst)}>Edit</button>
                          <button className="action-button delete" onClick={() => handleDeleteInstitute(inst.id)}>Delete</button>
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

      {/* Edit Institute Modal (same modal behavior as other pages) */}
      {editModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeEditModal();
          }}
        >
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-label={`Edit institute ${editingInstitute?.name || ''}`}
          >
            <div className="modal-toolbar">
              <div className="modal-title">
                <h3>Edit Institute</h3>
                <div className="subtitle modal-meta">{editingInstitute?.name}</div>
              </div>
              <div className="toolbar-actions">
                <button className="modal-close-btn" onClick={closeEditModal}>Close</button>
              </div>
            </div>

            <div className="modal-body">
              <form onSubmit={handleEditSave}>
                <label style={{ fontSize: 13, color: "#334155", marginBottom: 6 }}>Institute Name</label>
                <input
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  required
                  style={{ width: "100%", marginBottom: 10, padding: "8px 10px", borderRadius: 8, border: "1px solid #e6eef6" }}
                />

                <label style={{ fontSize: 13, color: "#334155", marginBottom: 6 }}>Institute Code</label>
                <input
                  name="code"
                  value={editForm.code}
                  onChange={handleEditChange}
                  style={{ width: "100%", marginBottom: 10, padding: "8px 10px", borderRadius: 8, border: "1px solid #e6eef6" }}
                />

                <label style={{ fontSize: 13, color: "#334155", marginBottom: 6 }}>Address</label>
                <input
                  name="address"
                  value={editForm.address}
                  onChange={handleEditChange}
                  style={{ width: "100%", marginBottom: 10, padding: "8px 10px", borderRadius: 8, border: "1px solid #e6eef6" }}
                />

                <label style={{ fontSize: 13, color: "#334155", marginBottom: 6 }}>Contact Email</label>
                <input
                  name="contact_email"
                  value={editForm.contact_email}
                  onChange={handleEditChange}
                  style={{ width: "100%", marginBottom: 10, padding: "8px 10px", borderRadius: 8, border: "1px solid #e6eef6" }}
                />

                <label style={{ fontSize: 13, color: "#334155", marginBottom: 6 }}>Contact Phone</label>
                <input
                  name="contact_phone"
                  value={editForm.contact_phone}
                  onChange={handleEditChange}
                  style={{ width: "100%", marginBottom: 10, padding: "8px 10px", borderRadius: 8, border: "1px solid #e6eef6" }}
                />

                {/* <h4 style={{ marginTop: 8 }}>Primary Admin</h4>
                <label style={{ fontSize: 13, color: "#334155", marginBottom: 6 }}>Admin Name</label>
                <input
                  name="admin_name"
                  value={editForm.admin_name}
                  onChange={handleEditChange}
                  style={{ width: "100%", marginBottom: 10, padding: "8px 10px", borderRadius: 8, border: "1px solid #e6eef6" }}
                />

                <label style={{ fontSize: 13, color: "#334155", marginBottom: 6 }}>Admin Email</label>
                <input
                  name="admin_email"
                  value={editForm.admin_email}
                  onChange={handleEditChange}
                  style={{ width: "100%", marginBottom: 10, padding: "8px 10px", borderRadius: 8, border: "1px solid #e6eef6" }}
                />

                <label style={{ fontSize: 13, color: "#334155", marginBottom: 6 }}>Admin Phone</label>
                <input
                  name="admin_phone"
                  value={editForm.admin_phone}
                  onChange={handleEditChange}
                  style={{ width: "100%", marginBottom: 10, padding: "8px 10px", borderRadius: 8, border: "1px solid #e6eef6" }}
                /> */}

                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
                  <label style={{ marginBottom: 0 }}>Approved</label>
                  <label className="toggle-switch" style={{ marginBottom: 0 }}>
                    <input type="checkbox" name="is_approved" checked={!!editForm.is_approved} onChange={handleEditChange} />
                    <span className="slider"></span>
                  </label>
                </div>

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

export default InstituteManagementPage;
