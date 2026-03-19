// src/pages/UserManagementSuperAdmin.jsx
import React, { useState, useEffect, useMemo, useContext } from "react";
import { UserContext } from "../Context/user.context";
import {
  Search,
  Filter,
  Building,
  Users,
  Edit,
  Trash2,
  Loader,
  AlertCircle,
} from "lucide-react";
import { API_BASE_URL } from "../config";


const UserManagementSuperAdmin = () => {
  // State for users, institutes, and UI controls
  const [users, setUsers] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterInstitute, setFilterInstitute] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const { token } = useContext(UserContext);

  // Edit modal state (same pattern as other pages)
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    role: "",
    institute_id: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(null);

  // Fetch initial data (users and institutes)
  const fetchData = async () => {
    if (!token) {
      setIsLoading(false);
      setError("Authentication required.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [usersRes, institutesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/user/all`, {
          credentials: "include",
          method: "GET",
        }),
        fetch(`${API_BASE_URL}/institute/all`, {
          credentials: "include",
          method: "GET",
        }),
      ]);
      if (!usersRes.ok || !institutesRes.ok) {
        const t1 = await usersRes.text().catch(() => null);
        const t2 = await institutesRes.text().catch(() => null);
        throw new Error(t1 || t2 || "Failed to fetch user or institute data.");
      }
      const usersData = await usersRes.json();
      const institutesData = await institutesRes.json();

      // remove SUPER_ADMIN accounts from the visible list
      const visibleUsers = (usersData || []).filter(
        (u) => u.role !== "SUPER_ADMIN"
      );
      setUsers(visibleUsers);
      setInstitutes(institutesData || []);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Memoized filtering for performance
  const filteredUsers = useMemo(() => {
    return users
      .filter(
        (u) =>
          filterInstitute === "all" ||
          String(u.institute_id) === String(filterInstitute)
      )
      .filter((u) => filterRole === "all" || u.role === filterRole)
      .filter(
        (u) =>
          (u.full_name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [users, searchTerm, filterInstitute, filterRole]);

  if (isLoading)
    return (
      <p>
        <Loader className="spinner" /> Loading data...
      </p>
    );
  if (error)
    return (
      <p className="form-message error">
        <AlertCircle /> {error}
      </p>
    );

  // Delete handler
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/user/${userId}`, {
        method: "DELETE",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.detail || "Failed to delete user.");
      }
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Open edit modal and populate form
  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      full_name: user.full_name ?? "",
      email: user.email ?? "",
      role: user.role ?? "",
      institute_id: user.institute_id ?? "",
    });
    setEditError(null);
    setEditSuccess(null);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingUser(null);
    setEditForm({ full_name: "", email: "", role: "", institute_id: "" });
    setEditError(null);
    setEditSuccess(null);
    setEditLoading(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Save edits via PUT
  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editingUser || !editingUser.id) return;
    setEditLoading(true);
    setEditError(null);
    setEditSuccess(null);

    try {
      // Prepare payload without mutating state object
      const payload = { ...editForm };
      // backend may not allow role or email changes here — remove if you don't want to send them
      delete payload.email;

      const resp = await fetch(`${API_BASE_URL}/user/${editingUser.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const responseBody = await resp.json().catch(() => ({}));
      if (!resp.ok)
        throw new Error(responseBody.detail || "Failed to update user.");

      setEditSuccess("User updated successfully.");

      // Update local users array (merge updated fields)
      setUsers((prev) =>
        prev.map((u) =>
          String(u.id) === String(editingUser.id) ? { ...u, ...payload } : u
        )
      );

      // close modal shortly after success
      setTimeout(() => closeEditModal(), 800);
    } catch (err) {
      setEditError(err.message || String(err));
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 md:mb-10">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Global User Management</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage user accounts and roles across all institutes</p>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Controls */}
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
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select 
                  value={filterInstitute} 
                  onChange={(e) => setFilterInstitute(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium appearance-none cursor-pointer text-slate-700 max-w-full"
                >
                  <option value="all">All Institutes</option>
                  {institutes.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>

              <div className="relative w-full sm:w-48">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select 
                  value={filterRole} 
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium appearance-none cursor-pointer text-slate-700"
                >
                  <option value="all">All Roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="FACULTY">Faculty</option>
                  <option value="STUDENT">Student</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100 whitespace-nowrap">Full Name</th>
                    <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100 whitespace-nowrap">Email</th>
                    <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100 whitespace-nowrap">Role</th>
                    <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100 whitespace-nowrap">Institute</th>
                    <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-4 px-6 border-b border-slate-50 font-bold text-slate-800 whitespace-nowrap">{u.full_name}</td>
                        <td className="py-4 px-6 border-b border-slate-50 text-slate-600 whitespace-nowrap">{u.email}</td>
                        <td className="py-4 px-6 border-b border-slate-50 whitespace-nowrap">
                          <span className={`inline-flex items-center py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wider
                            ${u.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : ''}
                            ${u.role === 'FACULTY' ? 'bg-purple-50 text-purple-600 border border-purple-200' : ''}
                            ${u.role === 'STUDENT' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : ''}
                            ${!['ADMIN', 'FACULTY', 'STUDENT'].includes(u.role) ? 'bg-slate-100 text-slate-600 border border-slate-200' : ''}
                          `}>
                            {u.role || "UNKNOWN"}
                          </span>
                        </td>
                        <td className="py-4 px-6 border-b border-slate-50 text-slate-600 font-medium max-w-xs truncate" title={u.institute_name}>
                          {u.institute_name || "N/A"}
                        </td>
                        <td className="py-4 px-6 border-b border-slate-50 text-right whitespace-nowrap">
                          <button 
                            className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors mr-2 focus:ring-2 focus:ring-indigo-200 outline-none font-medium text-sm" 
                            onClick={() => openEditModal(u)}
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors focus:ring-2 focus:ring-rose-200 outline-none font-medium text-sm disabled:opacity-50" 
                            onClick={() => handleDeleteUser(u.id)}
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Search className="w-10 h-10 text-slate-200" />
                          <p>No users found matching your criteria.</p>
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
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <div key={u.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4 relative">
                  <div className="flex flex-col gap-1 pr-12 border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{u.full_name}</h3>
                    <span className="text-sm font-medium text-slate-500 mt-0.5 break-all">{u.email}</span>
                  </div>
                  
                  <div className="flex flex-col gap-3 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                      <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">Role</span>
                      <span className={`inline-flex py-1 px-3 rounded-full text-[10px] font-bold uppercase tracking-widest
                        ${u.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : ''}
                        ${u.role === 'FACULTY' ? 'bg-purple-50 text-purple-600 border border-purple-200' : ''}
                        ${u.role === 'STUDENT' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : ''}
                        ${!['ADMIN', 'FACULTY', 'STUDENT'].includes(u.role) ? 'bg-slate-100 text-slate-600 border border-slate-200' : ''}
                      `}>
                        {u.role || "UNKNOWN"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 pt-1">
                      <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">Institute</span>
                      <span className="font-semibold text-slate-700">{u.institute_name || "N/A"}</span>
                    </div>
                  </div>
                  <div className="flex justify-between gap-3 pt-2 items-center border-t border-slate-100">
                      <button 
                        className="flex-1 flex justify-center items-center gap-2 py-2.5 text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 rounded-xl transition-colors font-medium text-sm" 
                        onClick={() => openEditModal(u)}
                      >
                        <Edit size={16} /> Edit
                      </button>
                      <button 
                        className="flex-1 flex justify-center items-center gap-2 py-2.5 text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded-xl transition-colors font-medium text-sm" 
                        onClick={() => handleDeleteUser(u.id)}
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-slate-500 bg-white rounded-2xl border border-slate-100">
                <Search className="mx-auto mb-3 text-slate-200 w-12 h-12" />
                <p className="font-medium">No users found.</p>
              </div>
            )}
          </div>
        </div>
      {/* Edit modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => closeEditModal()}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="px-5 md:px-6 py-4 md:py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Edit User</h3>
                <p className="text-sm font-medium text-slate-500 mt-0.5 max-w-xs break-all truncate">{editingUser?.full_name}</p>
              </div>
              <button className="text-slate-400 hover:text-slate-600 transition-colors p-1" onClick={closeEditModal}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="p-5 md:p-6 overflow-y-auto">
              <form onSubmit={handleEditSave} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                  <input
                    name="full_name"
                    value={editForm.full_name || ""}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 flex justify-between">
                    <span>Email Address</span>
                    <span className="text-xs text-slate-400 font-normal">Cannot be changed</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={editForm.email || ""}
                    onChange={handleEditChange}
                    disabled
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-500 bg-slate-100 cursor-not-allowed font-medium shadow-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
                  <select
                    name="role"
                    value={editForm.role || ""}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-sm appearance-none"
                  >
                    <option value="" disabled>Select role</option>
                    <option value="ADMIN">Admin</option>
                    <option value="FACULTY">Faculty</option>
                    <option value="STUDENT">Student</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Institute</label>
                  <select
                    name="institute_id"
                    value={editForm.institute_id || ""}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-sm appearance-none"
                  >
                    <option value="" disabled>Select institute</option>
                    {institutes.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name}
                      </option>
                    ))}
                  </select>
                </div>

                {editError && <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl font-medium mt-4">{editError}</div>}
                {editSuccess && <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-xl font-medium mt-4">{editSuccess}</div>}

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
    </div>
  );
};

export default UserManagementSuperAdmin;
