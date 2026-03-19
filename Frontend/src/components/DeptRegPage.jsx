// src/pages/DepartmentManagementPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../config';
import { Search, Edit, Trash2 } from 'lucide-react';

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
      const response = await fetch(`${API_BASE_URL}/department/institute/${user.institute_id}`, {
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
  const filteredDepartments = React.useMemo(() => {
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
      const response = await fetch(`${API_BASE_URL}/department/create`, {
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
      const response = await fetch(`${API_BASE_URL}/department/${deptId}`, {
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
      const response = await fetch(`${API_BASE_URL}/department/${editingDept.id}`, {
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
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Department Management</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage and register institute departments</p>
        </header>

        <div className="flex gap-4 mb-8 border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('list')} 
            className={`pb-4 px-2 text-sm font-semibold transition-colors relative ${activeTab === 'list' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Department List
            {activeTab === 'list' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('create')} 
            className={`pb-4 px-2 text-sm font-semibold transition-colors relative ${activeTab === 'create' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Create New Department
            {activeTab === 'create' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
          </button>
        </div>

        <div className="tab-content relative min-h-[400px]">
          {/* LIST VIEW */}
          {activeTab === 'list' && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by name or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium placeholder:font-normal placeholder:text-slate-400"
                  />
                </div>
              </div>

              {isLoading && (
                <div className="flex items-center justify-center p-12 text-slate-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-indigo-600 mr-3"></div>
                  Loading departments...
                </div>
              )}
              {error && <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl mb-6">{error}</div>}
              {deleteError && <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl mb-6">{deleteError}</div>}
              {deleteSuccess && <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-xl mb-6">{deleteSuccess}</div>}

              {!isLoading && !error && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr>
                          <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100">Department Name</th>
                          <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100">Code</th>
                          <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {filteredDepartments.length > 0 ? (
                          filteredDepartments.map(dept => (
                            <tr key={dept.id} className="hover:bg-slate-50/80 transition-colors group">
                              <td className="py-4 px-6 border-b border-slate-50 font-medium text-slate-800">{dept.name}</td>
                              <td className="py-4 px-6 border-b border-slate-50 text-slate-600">
                                <span className="inline-flex py-1 px-3 rounded-full bg-slate-100 text-slate-600 font-medium text-xs">{dept.code}</span>
                              </td>
                              <td className="py-4 px-6 border-b border-slate-50 text-right">
                                <button
                                  className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors mr-2 focus:ring-2 focus:ring-indigo-200 outline-none"
                                  title="Edit department"
                                  onClick={() => openEditModal(dept)}
                                >
                                  <Edit size={18} />
                                </button>

                                <button
                                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 focus:ring-2 focus:ring-rose-200 outline-none"
                                  title="Delete department"
                                  onClick={() => handleDeptDelete(dept.id)}
                                  disabled={deleteLoadingId === dept.id}
                                >
                                  {deleteLoadingId === dept.id ? (
                                    <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <Trash2 size={18} />
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="py-12 text-center text-slate-500">
                              <div className="flex flex-col items-center justify-center gap-3">
                                <Search className="w-10 h-10 text-slate-200" />
                                <p>No departments found.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CREATE VIEW */}
          {activeTab === 'create' && (
            <div className="animate-in fade-in fill-mode-both duration-300">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 max-w-3xl">
                <h2 className="text-xl font-bold text-slate-800 mb-6">Department Details</h2>
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Department Name</label>
                      <input 
                        type="text" 
                        name="name" 
                        placeholder="e.g. Computer Science" 
                        value={formData.name} 
                        onChange={handleFormChange} 
                        required 
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:font-normal placeholder:text-slate-400 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Department Code</label>
                      <input 
                        type="text" 
                        name="code" 
                        placeholder="e.g. CSE" 
                        value={formData.code} 
                        onChange={handleFormChange} 
                        required 
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:font-normal placeholder:text-slate-400 shadow-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                    <textarea 
                      name="description" 
                      placeholder="A brief description of the department..." 
                      value={formData.description} 
                      onChange={handleFormChange} 
                      required 
                      rows="4" 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:font-normal placeholder:text-slate-400 shadow-sm resize-y"
                    />
                  </div>

                  {formError && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3">
                      <p className="text-sm text-rose-600 font-medium">{formError}</p>
                    </div>
                  )}
                  {formSuccess && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                      <p className="text-sm text-emerald-600 font-medium">{formSuccess}</p>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="px-8 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Registering...' : 'Register Department'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* ================= Edit Modal ================= */}
        {editModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => { if (e.target === e.currentTarget) closeEditModal(); }}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100" role="dialog" >
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">Edit Department</h3>
                  <p className="text-sm text-slate-500 mt-1 font-medium">{editingDept?.name ?? ''}</p>
                </div>
              </div>

              <div className="p-6">
                <form onSubmit={handleEditSave} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                    <input 
                      name="name" 
                      value={editForm.name} 
                      onChange={handleEditChange} 
                      required 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Code</label>
                    <input 
                      name="code" 
                      value={editForm.code} 
                      onChange={handleEditChange} 
                      required 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                    <textarea 
                      name="description" 
                      value={editForm.description} 
                      onChange={handleEditChange} 
                      rows={4} 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium resize-y"
                    />
                  </div>

                  {editError && <p className="text-sm text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100 font-medium">{editError}</p>}
                  {editSuccess && <p className="text-sm text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100 font-medium">{editSuccess}</p>}

                  <div className="flex gap-3 justify-end mt-8 pt-5 border-t border-slate-100">
                    <button type="button" className="px-5 py-2.5 text-slate-600 font-medium rounded-xl hover:bg-slate-100 transition-colors" onClick={closeEditModal} disabled={editLoading}>Cancel</button>
                    <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none" disabled={editLoading}>
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
    </div>
  );
};

export default DepartmentManagementPage;
