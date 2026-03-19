// src/pages/InstituteManagementPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../config';

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
      const response = await fetch(`${API_BASE_URL}/institute/all`, {
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
      const response = await fetch(`${API_BASE_URL}/institute/create`, {
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
      const response = await fetch(`${API_BASE_URL}/institute/update/${editingInstitute.id}`, {
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
      const resp = await fetch(`${API_BASE_URL}/institute/${instId}`, {
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
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 md:mb-10">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Institute Management</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage and register educational institutes</p>
        </header>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-slate-200/50 p-1.5 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('list')} 
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              activeTab === 'list' 
                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-900/5' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            Institute List
          </button>
          <button 
            onClick={() => setActiveTab('create')} 
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              activeTab === 'create' 
                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-900/5' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            Create New
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
                    placeholder="Search by name or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium placeholder:font-normal placeholder:text-slate-400"
                  />
                </div>
                <div className="relative w-full md:w-64">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium appearance-none cursor-pointer text-slate-700"
                  >
                    <option value="all">All Statuses</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending Approval</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              {isLoading && (
                 <div className="flex items-center justify-center p-12 text-slate-500">
                   <div className="animate-spin mr-3 text-indigo-600 w-6 h-6 border-b-2 border-indigo-600 rounded-full"></div>
                   <span className="font-medium">Loading institutes...</span>
                 </div>
              )}
              {error && <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl mb-6 font-medium flex items-center gap-3"><AlertCircle size={18}/> {error}</div>}
              
              {!isLoading && !error && (
                <>
                  {/* DESKTOP TABLE */}
                  <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr>
                            <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100 whitespace-nowrap">Name</th>
                            <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100 whitespace-nowrap">Code</th>
                            <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100 whitespace-nowrap">Contact Email</th>
                            <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100 whitespace-nowrap">Status</th>
                            <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100 text-right whitespace-nowrap">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {filteredInstitutes.length > 0 ? (
                            filteredInstitutes.map(inst => (
                              <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="py-4 px-6 border-b border-slate-50 font-bold text-slate-800 whitespace-nowrap">{inst.name}</td>
                                <td className="py-4 px-6 border-b border-slate-50 text-slate-600 font-medium whitespace-nowrap">
                                  <span className="inline-flex py-1 px-3 rounded-lg bg-slate-100 text-slate-600 text-xs tracking-widest">{inst.code}</span>
                                </td>
                                <td className="py-4 px-6 border-b border-slate-50 text-slate-600 whitespace-nowrap">{inst.contact_email}</td>
                                <td className="py-4 px-6 border-b border-slate-50 whitespace-nowrap">
                                  <span className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wider ${inst.is_approved ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                                    {inst.is_approved ? 'Approved' : 'Pending'}
                                  </span>
                                </td>
                                <td className="py-4 px-6 border-b border-slate-50 text-right whitespace-nowrap">
                                  <button 
                                    className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors mr-2 focus:ring-2 focus:ring-indigo-200 outline-none font-medium text-sm" 
                                    onClick={() => openEditModal(inst)}
                                    title="Edit"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                  </button>
                                  <button 
                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors focus:ring-2 focus:ring-rose-200 outline-none font-medium text-sm disabled:opacity-50" 
                                    onClick={() => handleDeleteInstitute(inst.id)}
                                    title="Delete"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="py-12 text-center text-slate-500">
                                <div className="flex flex-col items-center justify-center gap-3">
                                  <Search className="w-10 h-10 text-slate-200" />
                                  <p>No institutes found matching your criteria.</p>
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
                    {filteredInstitutes.length > 0 ? (
                      filteredInstitutes.map((inst) => (
                        <div key={inst.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4 relative">
                          <div className="flex flex-col gap-1 pr-16 border-b border-slate-100 pb-3">
                            <h3 className="font-bold text-slate-800 text-lg leading-tight">{inst.name}</h3>
                            <span className="text-xs font-medium text-slate-400 mt-1 tracking-widest uppercase">{inst.code}</span>
                            <div className="absolute top-5 right-5">
                               <span className={`inline-block w-3 h-3 rounded-full ${inst.is_approved ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'}`}></span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="flex flex-col gap-0.5 break-all">
                              <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">Contact Email</span>
                              <span className="font-medium text-slate-700">{inst.contact_email}</span>
                            </div>
                            <div className="flex justify-between items-center mt-2 border-t border-slate-200 pt-3">
                               <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">Status</span>
                               <span className={`font-bold text-xs uppercase tracking-wider ${inst.is_approved ? 'text-emerald-600' : 'text-amber-600'}`}>
                                 {inst.is_approved ? 'Approved' : 'Pending'}
                               </span>
                            </div>
                          </div>
                          <div className="flex justify-between gap-3 pt-2">
                              <button 
                                className="flex-1 flex justify-center items-center gap-2 py-2.5 text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 rounded-xl transition-colors font-medium text-sm" 
                                onClick={() => openEditModal(inst)}
                              >
                                Edit
                              </button>
                              <button 
                                className="flex-1 flex justify-center items-center gap-2 py-2.5 text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded-xl transition-colors font-medium text-sm" 
                                onClick={() => handleDeleteInstitute(inst.id)}
                              >
                                Delete
                              </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-10 text-center text-slate-500 bg-white rounded-2xl border border-slate-100">
                        <Search className="mx-auto mb-3 text-slate-200 w-12 h-12" />
                        <p className="font-medium">No institutes found.</p>
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
            <form onSubmit={handleFormSubmit} className="space-y-8 max-w-4xl">
              
              {/* Institute Details Section */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Building size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Institute Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="name">Institute Name</label>
                    <div className="relative">
                      <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" id="name" name="name" placeholder="e.g., Global Institute" value={formData.name} onChange={handleFormChange} required className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="code">Institute Code</label>
                    <div className="relative">
                      <Code size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" id="code" name="code" placeholder="e.g., GIT" value={formData.code} onChange={handleFormChange} required className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-sm uppercase placeholder:normal-case" />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="address">Full Address</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" id="address" name="address" placeholder="123 University Lane, City, State" value={formData.address} onChange={handleFormChange} required className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="contact_email">Contact Email</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="email" id="contact_email" name="contact_email" placeholder="contact@institute.edu" value={formData.contact_email} onChange={handleFormChange} required className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="contact_phone">Contact Phone</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="tel" id="contact_phone" name="contact_phone" placeholder="+91 12345 67890" value={formData.contact_phone} onChange={handleFormChange} required className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-sm" />
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Approve Immediately</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Allow login access instantly without manual approval</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="is_approved" name="is_approved" checked={formData.is_approved} onChange={handleFormChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>

              {/* Primary Admin Account Section */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Primary Admin Account</h3>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="admin_name">Admin Full Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" id="admin_name" name="admin_name" placeholder="e.g., Dr. Jane Smith" value={formData.admin_name} onChange={handleFormChange} required className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium shadow-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="admin_email">Admin Account Email</label>
                    <div className="relative">
                      <AtSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="email" id="admin_email" name="admin_email" placeholder="admin@institute.edu" value={formData.admin_email} onChange={handleFormChange} required className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium shadow-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="admin_phone">Admin Phone</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="tel" id="admin_phone" name="admin_phone" placeholder="+91 09876 54321" value={formData.admin_phone} onChange={handleFormChange} required className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium shadow-sm" />
                    </div>
                  </div>
                </div>
              </div>

              {formError && <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl font-medium flex items-center gap-3"><AlertCircle size={18} /> {formError}</div>}
              {formSuccess && <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-xl font-medium flex items-center gap-3"><CheckCircle2 size={18} /> {formSuccess}</div>}

              <div className="pt-2">
                <button type="submit" className="w-full md:w-auto px-10 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 text-lg" disabled={formIsLoading}>
                  {formIsLoading ? 'Registering...' : 'Complete Institute Registration'}
                </button>
              </div>
            </form>
          </div>
        )}
        </div> {/* End tab-content */}

      </div> {/* End max-w-7xl mx-auto */}

      {/* Edit Institute Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => closeEditModal()}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="px-5 md:px-6 py-4 md:py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Edit Institute</h3>
                <p className="text-sm font-medium text-slate-500 mt-0.5">{editingInstitute?.name}</p>
              </div>
              <button className="text-slate-400 hover:text-slate-600 transition-colors p-1" onClick={closeEditModal}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="p-5 md:p-6 overflow-y-auto">
              <form onSubmit={handleEditSave} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Institute Name</label>
                    <input
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Institute Code</label>
                    <input
                      name="code"
                      value={editForm.code}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
                  <input
                    name="address"
                    value={editForm.address}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Email</label>
                    <input
                      name="contact_email"
                      value={editForm.contact_email}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Phone</label>
                    <input
                      name="contact_phone"
                      value={editForm.contact_phone}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 mt-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Approved Status</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Toggle approval state of the institute</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="is_approved" checked={!!editForm.is_approved} onChange={handleEditChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
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

export default InstituteManagementPage;
