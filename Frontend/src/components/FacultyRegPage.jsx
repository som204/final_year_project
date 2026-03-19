// src/pages/FacultyManagementPage.jsx
import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Search, Edit, Trash2 } from 'lucide-react';

import { UserContext } from '../Context/user.context';
import { API_BASE_URL } from '../config';

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
        fetch(`${API_BASE_URL}/user/institute/${user.institute_id}`, { credentials: 'include', method: 'GET' }),
        fetch(`${API_BASE_URL}/department/institute/${user.institute_id}`, { credentials: 'include', method: 'GET' })
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
      const response = await fetch(`${API_BASE_URL}/user/register`, {
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
      const res = await fetch(`${API_BASE_URL}/user/${userId}`, {
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
      const response = await fetch(`${API_BASE_URL}/user/${editingFaculty.id}`, {
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
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Faculty Management</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage faculty records and registrations</p>
        </header>

        {/* TABS */}
        <div className="flex space-x-1 mb-8 bg-slate-200/50 p-1.5 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('list')} 
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              activeTab === 'list' 
                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-900/5' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            Faculty List
          </button>
          <button 
            onClick={() => setActiveTab('create')} 
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              activeTab === 'create' 
                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-900/5' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            Register New Faculty
          </button>
        </div>

        <div className="tab-content transition-all duration-300">
          {/* LIST VIEW */}
          {activeTab === 'list' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium placeholder:font-normal placeholder:text-slate-400"
                  />
                </div>
              </div>

              {isLoading && (
                 <div className="flex items-center justify-center p-12 text-slate-500">
                   <div className="animate-spin mr-3 text-indigo-600 w-6 h-6 border-b-2 border-indigo-600 rounded-full"></div>
                   <span className="font-medium">Loading faculty data...</span>
                 </div>
              )}
              {error && <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl mb-6 font-medium">{error}</div>}
              {deleteError && <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl mb-6 font-medium">{deleteError}</div>}
              {deleteSuccess && <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-xl mb-6 font-medium">{deleteSuccess}</div>}

              {!isLoading && !error && (
                <>
                  {/* DESKTOP TABLE */}
                  <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr>
                            <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100 whitespace-nowrap">Full Name</th>
                            <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100 whitespace-nowrap">Email</th>
                            <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100 whitespace-nowrap">Department</th>
                            <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100 text-right whitespace-nowrap">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {filteredFaculty.length > 0 ? (
                            filteredFaculty.map(faculty => (
                              <tr key={faculty.id} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="py-4 px-6 border-b border-slate-50 font-bold text-slate-800 whitespace-nowrap">{faculty.full_name}</td>
                                <td className="py-4 px-6 border-b border-slate-50 text-slate-600 whitespace-nowrap">{faculty.email}</td>
                                <td className="py-4 px-6 border-b border-slate-50 text-slate-600 whitespace-nowrap">
                                  <span className="inline-flex py-1 px-3 rounded-full bg-slate-100 text-slate-600 font-medium text-xs">
                                     {getDepartmentName(faculty.department_id)}
                                  </span>
                                </td>
                                <td className="py-4 px-6 border-b border-slate-50 text-right whitespace-nowrap">
                                  <button 
                                    className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors mr-2 focus:ring-2 focus:ring-indigo-200 outline-none" 
                                    title="Edit" 
                                    onClick={() => openEditModal(faculty)}
                                  >
                                    <Edit size={18} />
                                  </button>
                                  <button 
                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors focus:ring-2 focus:ring-rose-200 outline-none disabled:opacity-50" 
                                    title="Delete" 
                                    onClick={() => handleDeleteUser(faculty.id)} 
                                    disabled={deleteLoadingId === faculty.id}
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="py-12 text-center text-slate-500">
                                <div className="flex flex-col items-center justify-center gap-3">
                                  <Search className="w-10 h-10 text-slate-200" />
                                  <p>No faculty members found.</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* MOBILE CARD VIEW */}
                  <div className="md:hidden flex flex-col gap-4">
                    {filteredFaculty.length > 0 ? (
                      filteredFaculty.map((faculty) => (
                        <div key={faculty.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4 relative">
                          <div className="flex flex-col gap-1 pr-16">
                            <h3 className="font-bold text-slate-800 text-lg leading-tight">{faculty.full_name}</h3>
                          </div>
                          <div className="flex flex-col gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 font-medium text-xs uppercase">Department</span>
                              <span className="font-medium text-slate-700">{getDepartmentName(faculty.department_id)}</span>
                            </div>
                            <div className="flex flex-col gap-0.5 mt-1 border-t border-slate-200 pt-2 break-all">
                              <span className="text-slate-400 font-medium text-xs uppercase">Email</span>
                              <span className="font-medium text-slate-700">{faculty.email}</span>
                            </div>
                          </div>
                          <div className="flex justify-between gap-3 pt-2">
                            <button 
                                className="flex-1 flex justify-center items-center gap-2 py-2.5 text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 rounded-xl transition-colors font-medium text-sm" 
                                onClick={() => openEditModal(faculty)}
                              >
                                <Edit size={16} /> Edit
                              </button>
                              <button 
                                className="flex-1 flex justify-center items-center gap-2 py-2.5 text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded-xl transition-colors font-medium text-sm disabled:opacity-50" 
                                onClick={() => handleDeleteUser(faculty.id)}
                                disabled={deleteLoadingId === faculty.id}
                              >
                                <Trash2 size={16} /> Delete
                              </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-10 text-center text-slate-500 bg-white rounded-2xl border border-slate-100">
                        <Search className="mx-auto mb-3 text-slate-200 w-12 h-12" />
                        <p className="font-medium">No faculty members found.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* CREATE VIEW */}
          {activeTab === 'create' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-10 max-w-4xl">
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-slate-800">Register New Faculty</h2>
                  <p className="text-slate-500 text-sm mt-1">Fill in the details below to add a new faculty member.</p>
                </div>
                
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                      <input 
                        type="text" 
                        name="full_name" 
                        placeholder="e.g. Dr. Jane Smith" 
                        value={formData.full_name} 
                        onChange={handleFormChange} 
                        required 
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
                      <select 
                        name="department_id" 
                        value={formData.department_id} 
                        onChange={handleFormChange} 
                        disabled={departments.length === 0} 
                        required
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium appearance-none shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        <option value="" disabled>{departments.length === 0 ? 'Loading Depts...' : 'Select Department'}</option>
                        {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                      <input 
                        type="email" 
                        name="email" 
                        placeholder="jane.smith@institute.edu" 
                        value={formData.email} 
                        onChange={handleFormChange} 
                        required 
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        placeholder="+1 (555) 000-0000" 
                        value={formData.phone} 
                        onChange={handleFormChange} 
                        required 
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-sm"
                      />
                    </div>
                  </div>

                  {formError && <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl font-medium">{formError}</div>}
                  {formSuccess && <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-xl font-medium">{formSuccess}</div>}

                  <div className="pt-4 border-t border-slate-100">
                    <button 
                      type="submit" 
                      className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Registering...' : 'Register Faculty'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => closeEditModal()}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="px-5 md:px-6 py-4 md:py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Edit Faculty</h3>
                <p className="text-sm font-medium text-slate-500 mt-0.5">{editingFaculty?.full_name}</p>
              </div>
              <button className="text-slate-400 hover:text-slate-600 transition-colors p-1" onClick={closeEditModal}>
                <X size={24} />
              </button>
            </div>

            <div className="p-5 md:p-6 overflow-y-auto">
              <form onSubmit={handleEditSave} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                    <input
                      name="full_name"
                      value={editForm.full_name}
                      onChange={handleEditChange}
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
                    <select
                      name="department_id"
                      value={editForm.department_id}
                      onChange={handleEditChange}
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium appearance-none shadow-sm cursor-pointer"
                    >
                      <option value="" disabled>Select department</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email (Username)</label>
                    <input
                      name="email"
                      value={editForm.email}
                      disabled
                      type="email"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-500 bg-slate-100 cursor-not-allowed font-medium shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                    <input
                      name="phone"
                      value={editForm.phone}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-sm"
                    />
                  </div>
                </div>

                {editError && <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl font-medium">{editError}</div>}
                {editSuccess && <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-xl font-medium">{editSuccess}</div>}

                <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-100">
                  <button type="button" className="px-5 md:px-6 py-2.5 text-slate-600 font-medium rounded-xl hover:bg-slate-100 transition-colors w-full md:w-auto" onClick={closeEditModal} disabled={editLoading}>Cancel</button>
                  <button type="submit" className="px-5 md:px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5 transition-all w-full md:w-auto disabled:opacity-70 disabled:hover:translate-y-0" disabled={editLoading}>
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

export default FacultyManagementPage;
