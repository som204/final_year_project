// src/pages/ProjectManagementPage.jsx
import React, { useState, useEffect, useMemo, useContext } from "react";
import { UserContext } from "../Context/user.context";
import { Search, Filter, Edit, Trash2 } from "lucide-react";
import "../pages/Admin/InstituteAdmin.css"; // Reusing the existing CSS
import * as XLSX from "xlsx";

const ProjectManagementPage = () => {
  // State for tabs, data, search, and form
  const [activeTab, setActiveTab] = useState("list");
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [listError, setListError] = useState(null);
  const [isViewing, setIsViewing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "ONGOING", // Default status for new projects
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const { user, token } = useContext(UserContext);

  // Modal state: shows files for selected project
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [modalProject, setModalProject] = useState(null); // project object
  const [modalFiles, setModalFiles] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalActionLoading, setModalActionLoading] = useState(false);

  // Edit project modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", status: "ONGOING" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(null);

  // Function to fetch projects for the admin's institute
  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:8000/projects/institute/${user.institute_id}`,
        {
          credentials: "include",
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );
      if (!response.ok) {
        const txt = await response.text().catch(() => null);
        throw new Error(txt || "Failed to fetch projects.");
      }
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // fetch only when user context is available
    if (user && user.institute_id) fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Memoized filtering and searching for performance
  const filteredProjects = useMemo(() => {
    return projects
      .filter((proj) => {
        if (filterStatus === "ALL") return true;
        return proj.status === filterStatus;
      })
      .filter((proj) =>
        (proj.name || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [projects, searchTerm, filterStatus]);

  // Handler for form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for submitting the new project form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    const payload = {
      ...formData,
      institute_id: user.institute_id,
    };

    try {
      const response = await fetch("http://localhost:8000/projects/create", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.detail || "Failed to create project.");

      setFormSuccess(`Project "${formData.name}" created successfully!`);
      setFormData({ name: "", description: "", status: "ONGOING" });

      // Refresh the project list and switch back to the list tab
      await fetchProjects();
      setActiveTab("list");
    } catch (err) {
      setFormError(err.message || String(err));
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFormSuccess(null), 5000);
    }
  };

  // ------ Modal helpers ------
  // Open project modal and fetch files for that project
  const openProjectModal = async (project) => {
    setModalProject(project);
    setProjectModalOpen(true);
    setModalFiles([]);
    setModalLoading(true);
    setModalError(null);

    try {
      // Adjust endpoint if yours differs. Expecting array of uploaded files for project.
      const resp = await fetch(
        `http://localhost:8000/uploads/projects/${project.id}`,
        {
          method: "GET",
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );
      if (!resp.ok) {
        const txt = await resp.text().catch(() => null);
        throw new Error(
          txt || `Failed to fetch files for project ${project.id}`
        );
      }
      const files = await resp.json();
      setModalFiles(files || []);
    } catch (err) {
      setModalError(err.message || String(err));
    } finally {
      setModalLoading(false);
    }
  };

  const closeProjectModal = () => {
    setProjectModalOpen(false);
    setModalProject(null);
    setModalFiles([]);
    setModalError(null);
  };

  // Edit modal helpers
  const openEditModal = (project) => {
    setEditingProject(project);
    setEditForm({
      name: project.name ?? "",
      description: project.description ?? "",
      status: project.status ?? "ONGOING",
    });
    setEditError(null);
    setEditSuccess(null);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingProject(null);
    setEditForm({ name: "", description: "", status: "ONGOING" });
    setEditLoading(false);
    setEditError(null);
    setEditSuccess(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editingProject || !editingProject.id) return;
    setEditLoading(true);
    setEditError(null);
    setEditSuccess(null);

    try {
      const response = await fetch(
        `http://localhost:8000/projects/${editingProject.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            name: editForm.name,
            description: editForm.description,
            status: editForm.status,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "Failed to update project.");

      // refresh list after update
      await fetchProjects();
      setEditSuccess("Project updated successfully.");
      // close modal shortly after success
      setTimeout(() => closeEditModal(), 700);
    } catch (err) {
      setEditError(err.message || "Failed to update project.");
    } finally {
      setEditLoading(false);
    }
  };

  // View file -> open FileViewer route in new tab (keeps SPA viewer approach)
  const getMimeTypeFromExtension = (filename) => {
    if (!filename) return "application/octet-stream";
    const ext = filename.split(".").pop().toLowerCase();
    const types = {
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      pdf: "application/pdf",
      txt: "text/plain",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
    return types[ext] || "application/octet-stream";
  };

  // --- 2. Main Handler ---
  const handleViewFile = async (file) => {
    if (!file || !file.id) return;
    setIsViewing(true);
    setListError(null);

    try {
      // A. Fetch the file
      const downloadUrl = `http://localhost:8000/uploads/file/${file.id}`;
      const resp = await fetch(downloadUrl, {
        method: "GET",
        credentials: "include",
        // headers: { Authorization: `Bearer ${token}` }, // Uncomment if needed
      });

      if (!resp.ok) {
        throw new Error(`Failed to fetch file: ${resp.status}`);
      }

      const blob = await resp.blob();
      const ext = file.name.split(".").pop().toLowerCase();

      // --- B. Handle Excel Files (The SheetJS Logic) ---
      if (ext === "xlsx" || ext === "xls" || ext === "csv") {
        // 1. Read the blob as an ArrayBuffer
        const buffer = await blob.arrayBuffer();

        // 2. Parse the buffer with SheetJS
        const workbook = XLSX.read(buffer, { type: "array" });

        // 3. Get the first worksheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // 4. Convert the sheet to an HTML Table string
        const htmlTable = XLSX.utils.sheet_to_html(worksheet);

        // 5. Open a new tab
        const newWin = window.open("", "_blank");

        // 6. Write the HTML + CSS to the new tab
        if (newWin) {
          newWin.document.write(`
                      <!DOCTYPE html>
                      <html>
                      <head>
                          <title>Preview: ${file.name}</title>
                          <style>
                              body { font-family: sans-serif; padding: 20px; background: #f4f4f4; }
                              h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
                              table { border-collapse: collapse; width: 100%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
                              th, td { border: 1px solid #ddd; padding: 8px; font-size: 14px; text-align: left; }
                              tr:nth-child(even) { background-color: #f9f9f9; }
                              tr:hover { background-color: #f1f1f1; }
                          </style>
                      </head>
                      <body>
                          <h2>${file.name}</h2>
                          ${htmlTable}
                      </body>
                      </html>
                  `);
          newWin.document.close(); // Important to finish loading
        }
        return; // Exit function, we are done with Excel
      }

      // --- C. Handle CSV (Force Text View) ---
      let mimeType = blob.type;
      if (ext === "csv") {
        mimeType = "text/plain;charset=utf-8"; // Force browser to render text instead of download
      } else if (!mimeType || mimeType === "application/octet-stream") {
        // Fallback for PDF/Images if backend didn't send type
        mimeType = getMimeTypeFromExtension(file.name);
      }

      // --- D. Handle Standard Files (PDF, Image, etc) ---
      const viewableBlob = new Blob([blob], { type: mimeType });
      const blobUrl = URL.createObjectURL(viewableBlob);

      const newTab = window.open(blobUrl, "_blank");

      if (!newTab) {
        window.location.href = blobUrl; // Fallback for popup blockers
      }

      // Clean up URL after a minute
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      console.error("Preview Error:", err);
      setListError(
        "Could not preview file. It may be corrupted or the type is unsupported."
      );
      setTimeout(() => setListError(null), 4000);
    } finally {
      setIsViewing(false);
    }
  };

  // Delete file from a project (API DELETE), update modal list on success
  const handleDeleteFile = async (fileId) => {
    if (!fileId) return;
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    setModalActionLoading(true);
    setModalError(null);
    try {
      const resp = await fetch(`http://localhost:8000/uploads/${fileId}`, {
        method: "DELETE",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => null);
        throw new Error(
          (data && data.detail) || `Failed to delete file ${fileId}`
        );
      }
      // remove from modalFiles state
      setModalFiles((prev) =>
        prev.filter((f) => String(f.id) !== String(fileId))
      );
    } catch (err) {
      setModalError(err.message || String(err));
    } finally {
      setModalActionLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!projectId) return;
    if (!window.confirm("Are you sure you want to delete this project and all its files?")) return;

    setListError(null);
    try {
      const resp = await fetch(`http://localhost:8000/projects/${projectId}`, {
        method: "DELETE",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => null);
        throw new Error((data && data.detail) || `Failed to delete project ${projectId}`);
      }

      // Remove the deleted project from state so UI updates immediately
      setProjects((prev) => prev.filter((p) => String(p.id) !== String(projectId)));

      // If the deleted project was open in the modal, close it
      if (modalProject && String(modalProject.id) === String(projectId)) {
        closeProjectModal();
      }
    } catch (err) {
      setListError(err.message || String(err));
      setTimeout(() => setListError(null), 5000);
    }
  };

  return (
    <div className="management-page">
      <h1>Project Management</h1>

      <div className="tabs">
        <button
          onClick={() => setActiveTab("list")}
          className={`tab-button ${activeTab === "list" ? "active" : ""}`}
        >
          All Projects
        </button>
        <button
          onClick={() => setActiveTab("create")}
          className={`tab-button ${activeTab === "create" ? "active" : ""}`}
        >
          Create New Project
        </button>
      </div>

      <div className="tab-content">
        {/* LIST VIEW */}
        {activeTab === "list" && (
          <div className="list-view">
            <div className="list-controls">
              <div className="search-bar">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Search by project name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-bar">
                <Filter size={20} />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            {isLoading && <p>Loading projects...</p>}
            {error && <p className="form-message error">{error}</p>}
            {!isLoading && !error && (
              <table className="data-table ia-data-table">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Status</th>
                    <th>Created On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((proj) => (
                      <tr key={proj.id}>
                        <td>
                          <button
                            className="link-button"
                            style={{
                              textDecoration: "underline",
                              cursor: "pointer",
                              background: "none",
                              border: "none",
                              padding: 0,
                            }}
                            onClick={() => openProjectModal(proj)}
                            title="View project files"
                          >
                            {proj.name}
                          </button>
                        </td>
                        <td>
                          <span
                            className={`status-badge status-${(
                              proj.status || ""
                            ).toLowerCase()}`}
                          >
                            {(proj.status || "").replace("_", " ")}
                          </span>
                        </td>
                        <td>
                          {proj.created_at
                            ? new Date(proj.created_at).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="actions-cell">
                          <button
                            className="action-button edit"
                            title="Edit project"
                            onClick={() => openEditModal(proj)}
                          >
                            <Edit size={16} />
                          </button>
                          {/* Additional actions can go here (edit/delete project) */}
                          <button
                            className="action-button delete"
                            title="Delete project"
                            onClick={() => handleDeleteProject(proj.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No projects found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* CREATE VIEW */}
        {activeTab === "create" && (
          <div className="ia-page-content">
            <form onSubmit={handleFormSubmit} className="ia-form">
              <label>Project Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g., Annual Report 2025-2026"
                value={formData.name}
                onChange={handleFormChange}
                required
              />

              <label>Description</label>
              <textarea
                name="description"
                placeholder="A brief description of the project's goals..."
                value={formData.description}
                onChange={handleFormChange}
                required
              />

              <label>Initial Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                required
              >
                <option value="ONGOING">Ongoing</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
              </select>

              {formError && <p className="form-message error">{formError}</p>}
              {formSuccess && (
                <p className="form-message success">{formSuccess}</p>
              )}

              <button
                type="submit"
                className="button button-accent"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Project..." : "Create Project"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Project files modal */}
      {projectModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeProjectModal();
          }}
        >
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-label={`Files for ${modalProject?.name || "project"}`}
          >
            <div className="modal-toolbar">
              <div className="modal-title">
                <h3>{modalProject?.name}</h3>
                {modalProject?.description && (
                  <div className="subtitle modal-meta">
                    {modalProject.description}
                  </div>
                )}
              </div>

              <div className="toolbar-actions">
                <button className="modal-close-btn" onClick={closeProjectModal}>
                  Close
                </button>
              </div>
            </div>

            <div className="modal-body">
              <div
                style={{
                  marginBottom: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ fontSize: 14, color: "#334155", fontWeight: 600 }}>
                  Files
                </div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  {modalFiles.length} file(s)
                </div>
              </div>

              {modalLoading && (
                <div className="modal-empty">Loading files…</div>
              )}
              {modalError && (
                <div className="modal-empty" style={{ color: "#ef4444" }}>
                  {modalError}
                </div>
              )}

              {!modalLoading && !modalError && (
                <>
                  {modalFiles.length === 0 ? (
                    <div className="modal-empty">
                      No files uploaded for this project yet.
                    </div>
                  ) : (
                    <table
                      className="modal-file-table"
                      aria-describedby="modal-files"
                    >
                      <thead>
                        <tr>
                          <th>File Name</th>
                          <th>Uploaded At</th>
                          <th style={{ width: 200 }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modalFiles.map((file) => (
                          <tr key={file.id}>
                            <td>
                              <div className="file-name" title={file.name}>
                                {file.name}
                              </div>
                            </td>
                            <td>
                              {file.upload_time
                                ? new Date(file.upload_time).toLocaleString()
                                : "-"}
                            </td>
                            <td>
                              <div className="modal-actions">
                                <button
                                  className="btn-view"
                                  onClick={() => handleViewFile(file)}
                                  aria-label={`View ${file.name}`}
                                >
                                  View
                                </button>
                                <button
                                  className="btn-delete"
                                  onClick={() => handleDeleteFile(file.id)}
                                  aria-label={`Delete ${file.name}`}
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
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
            aria-label={`Edit project ${editingProject?.name || ""}`}
          >
            <div className="modal-toolbar">
              <div className="modal-title">
                <h3>Edit Project</h3>
                <div className="subtitle modal-meta">{editingProject?.name}</div>
              </div>
              <div className="toolbar-actions">
                <button className="modal-close-btn" onClick={closeEditModal}>Close</button>
              </div>
            </div>

            <div className="modal-body">
              <form onSubmit={handleEditSave}>
                <label style={{ fontSize: 13, color: "#334155", marginBottom: 6 }}>Project name</label>
                <input
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  required
                  style={{ width: "100%", marginBottom: 10, padding: "8px 10px", borderRadius: 8, border: "1px solid #e6eef6" }}
                />

                <label style={{ fontSize: 13, color: "#334155", marginBottom: 6 }}>Description</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  style={{ width: "100%", minHeight: 100, marginBottom: 10, padding: "8px 10px", borderRadius: 8, border: "1px solid #e6eef6" }}
                />

                <label style={{ fontSize: 13, color: "#334155", marginBottom: 6 }}>Status</label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditChange}
                  style={{ width: "100%", marginBottom: 12, padding: "8px 10px", borderRadius: 8, border: "1px solid #e6eef6" }}
                >
                  <option value="ONGOING">Ongoing</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="COMPLETED">Completed</option>
                </select>

                {editError && <p className="form-message error">{editError}</p>}
                {editSuccess && <p className="form-message success">{editSuccess}</p>}

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                  <button type="button" className="modal-close-btn" onClick={closeEditModal} disabled={editLoading}>Cancel</button>
                  <button type="submit" className="btn-view" disabled={editLoading}>
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

export default ProjectManagementPage;
