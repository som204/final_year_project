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
import "../pages/Super Admin/SuperAdmin.css"; // Reusing the Super Admin CSS

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
        fetch("http://localhost:8000/user/all", {
          credentials: "include",
          method: "GET",
        }),
        fetch("http://localhost:8000/institute/all", {
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
      const res = await fetch(`http://localhost:8000/user/${userId}`, {
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

      const resp = await fetch(`http://localhost:8000/user/${editingUser.id}`, {
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
    <div className="management-page">
      {" "}
      <h1>Global User Management</h1>{" "}
      <div className="list-view">
        {" "}
        <div className="list-controls">
          {" "}
          <div className="search-bar">
            {" "}
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />{" "}
          </div>
          ```
          <div className="filter-bar">
            <Building size={16} />
            <select
              value={filterInstitute}
              onChange={(e) => setFilterInstitute(e.target.value)}
            >
              <option value="all">All Institutes</option>
              {institutes.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-bar">
            <Users size={16} />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="FACULTY">Faculty</option>
              <option value="STUDENT">Student</option>
            </select>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Institute</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td>
                  <span
                    className={`status-badge role-${(
                      u.role || ""
                    ).toLowerCase()}`}
                  >
                    {u.role}
                  </span>
                </td>
                <td>{u.institute_name || "N/A"}</td>
                <td className="actions-cell">
                  <button
                    className="action-button edit"
                    onClick={() => openEditModal(u)}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="action-button delete"
                    onClick={() => handleDeleteUser(u.id)}
                  >
                    <Trash2 size={16} />
                  </button>
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
          onClick={(e) => {
            if (e.target === e.currentTarget) closeEditModal();
          }}
        >
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-label={`Edit user ${editingUser?.full_name || ""}`}
          >
            <div className="modal-toolbar">
              <div className="modal-title">
                <h3>Edit User</h3>
                <div className="subtitle modal-meta">
                  {editingUser?.full_name}
                </div>
              </div>
              <div className="toolbar-actions">
                <button className="modal-close-btn" onClick={closeEditModal}>
                  Close
                </button>
              </div>
            </div>

            <div className="modal-body">
              <form onSubmit={handleEditSave}>
                <label
                  style={{ fontSize: 13, color: "#334155", marginBottom: 6 }}
                >
                  Full name
                </label>
                <input
                  name="full_name"
                  value={editForm.full_name || ""}
                  onChange={handleEditChange}
                  required
                  style={{
                    width: "100%",
                    marginBottom: 10,
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid #e6eef6",
                  }}
                />

                <label
                  style={{ fontSize: 13, color: "#334155", marginBottom: 6 }}
                >
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={editForm.email || ""}
                  onChange={handleEditChange}
                  disabled
                  style={{
                    width: "100%",
                    marginBottom: 10,
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid #e6eef6",
                    background: "#f8fafc",
                  }}
                />

                <label
                  style={{ fontSize: 13, color: "#334155", marginBottom: 6 }}
                >
                  Role
                </label>
                <select
                  name="role"
                  value={editForm.role || ""}
                  onChange={handleEditChange}
                  required
                  style={{
                    width: "100%",
                    marginBottom: 10,
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid #e6eef6",
                    background: "#f8fafc",
                  }}
                >
                  <option value="" disabled>
                    Select role
                  </option>
                  <option value="ADMIN">Admin</option>
                  <option value="FACULTY">Faculty</option>
                  <option value="STUDENT">Student</option>
                </select>

                <label
                  style={{ fontSize: 13, color: "#334155", marginBottom: 6 }}
                >
                  Institute
                </label>
                <select
                  name="institute_id"
                  value={editForm.institute_id || ""}
                  onChange={handleEditChange}
                  required
                  style={{
                    width: "100%",
                    marginBottom: 10,
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid #e6eef6",
                  }}
                >
                  <option value="" disabled>
                    Select institute
                  </option>
                  {institutes.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>

                {editError && <p className="form-message error">{editError}</p>}
                {editSuccess && (
                  <p className="form-message success">{editSuccess}</p>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "flex-end",
                    marginTop: 12,
                  }}
                >
                  <button
                    type="button"
                    className="modal-close-btn"
                    onClick={closeEditModal}
                    disabled={editLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="button button-accent"
                    disabled={editLoading}
                  >
                    {editLoading ? "Saving..." : "Save Changes"}
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

export default UserManagementSuperAdmin;
