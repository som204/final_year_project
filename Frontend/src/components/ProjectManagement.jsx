// src/pages/ProjectManagementPage.jsx
import React, { useState, useEffect, useMemo, useContext } from "react";
import { UserContext } from "../Context/user.context";
import { Search, Filter, Edit, Trash2, Folder, Plus, Eye, Loader, FileText, X } from "lucide-react";
import { API_BASE_URL } from "../config";

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
        `${API_BASE_URL}/projects/institute/${user.institute_id}`,
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
      const response = await fetch(`${API_BASE_URL}/projects/create`, {
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
        `${API_BASE_URL}/uploads/projects/${project.id}`,
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
        `${API_BASE_URL}/projects/${editingProject.id}`,
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
      const downloadUrl = `${API_BASE_URL}/uploads/file/${file.id}`;
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
      const resp = await fetch(`${API_BASE_URL}/uploads/${fileId}`, {
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
      const resp = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
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
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Project Management</h1>
          <p className="text-slate-500 mt-2 font-medium">Create and manage academic & research projects</p>
        </header>

        {/* TABS */}
        <div className="flex space-x-1 bg-slate-200/50 p-1.5 rounded-2xl w-fit mb-8 border border-slate-200/50">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === "list"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            <Folder size={18} /> All Projects
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === "create"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            <Plus size={18} /> Create New
          </button>
        </div>

        <div className="transition-all duration-300">
          {/* LIST VIEW */}
          {activeTab === "list" && (
            <div className="animate-in fade-in duration-300 slide-in-from-bottom-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by project name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium placeholder:font-normal placeholder:text-slate-400"
                  />
                </div>
                <div className="relative w-full md:w-64 group">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" size={20} />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium appearance-none cursor-pointer text-slate-700"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="ONGOING">Ongoing</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              {isLoading && (
                <div className="flex items-center justify-center p-12 text-slate-500">
                  <Loader className="animate-spin mr-3 text-indigo-600" size={24} /> 
                  <span className="font-medium">Loading projects...</span>
                </div>
              )}
              {error && <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl mb-6 font-medium">{error}</div>}
              
              {!isLoading && !error && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr>
                          <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100">Project Name</th>
                          <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100">Status</th>
                          <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100">Created On</th>
                          <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {filteredProjects.length > 0 ? (
                          filteredProjects.map((proj) => (
                            <tr key={proj.id} className="hover:bg-slate-50/80 transition-colors group">
                              <td className="py-4 px-6 border-b border-slate-50">
                                <button
                                  className="text-left font-bold text-slate-800 hover:text-indigo-600 transition-colors focus:outline-none"
                                  onClick={() => openProjectModal(proj)}
                                  title="View project files"
                                >
                                  {proj.name}
                                  <div className="text-xs font-normal text-slate-500 truncate max-w-xs mt-0.5">{proj.description}</div>
                                </button>
                              </td>
                              <td className="py-4 px-6 border-b border-slate-50">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                  proj.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  proj.status === 'ONGOING' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                  proj.status === 'ON_HOLD' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                  {(proj.status || "").replace("_", " ")}
                                </span>
                              </td>
                              <td className="py-4 px-6 border-b border-slate-50 text-slate-600 font-medium">
                                {proj.created_at ? new Date(proj.created_at).toLocaleDateString() : "-"}
                              </td>
                              <td className="py-4 px-6 border-b border-slate-50 text-right">
                                <button
                                  className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors mr-2 focus:ring-2 focus:ring-indigo-200 outline-none"
                                  title="Edit project"
                                  onClick={() => openEditModal(proj)}
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors focus:ring-2 focus:ring-rose-200 outline-none"
                                  title="Delete project"
                                  onClick={() => handleDeleteProject(proj.id)}
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
                                <Folder className="w-10 h-10 text-slate-200" />
                                <p>No projects found matching your criteria.</p>
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
          {activeTab === "create" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-10 animate-in fade-in duration-300 slide-in-from-bottom-2 max-w-3xl">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Create New Project</h2>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Project Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g., Annual Report 2025-2026"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                  <textarea
                    name="description"
                    placeholder="A brief description of the project's goals..."
                    value={formData.description}
                    onChange={handleFormChange}
                    required
                    rows="4"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Initial Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium appearance-none shadow-sm cursor-pointer"
                  >
                    <option value="ONGOING">Ongoing</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                {formError && <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium border border-rose-200">{formError}</div>}
                {formSuccess && <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-medium border border-emerald-200">{formSuccess}</div>}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    {isSubmitting ? "Creating Project..." : "Create Project"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Project files modal */}
      {projectModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeProjectModal();
          }}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100"
            role="dialog"
            aria-modal="true"
            aria-label={`Files for ${modalProject?.name || "project"}`}
          >
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/80">
              <div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">{modalProject?.name}</h3>
                {modalProject?.description && (
                  <p className="text-sm text-slate-500 mt-1 max-w-2xl">{modalProject.description}</p>
                )}
              </div>
              <button className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-2 rounded-xl transition-colors" onClick={closeProjectModal}>
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2"><Folder size={20} className="text-indigo-500" /> Project Files</h4>
                <div className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {modalFiles.length} file(s)
                </div>
              </div>

              {modalLoading && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Loader className="animate-spin mb-3 text-indigo-500" size={32} />
                  <p className="font-medium">Loading files...</p>
                </div>
              )}
              {modalError && (
                <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-200 text-center font-medium my-4">
                  {modalError}
                </div>
              )}

              {!modalLoading && !modalError && (
                <>
                  {modalFiles.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                      <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">No files have been uploaded to this project yet.</p>
                      <p className="text-sm text-slate-400 mt-1">Upload files from the respective departments.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                      <table className="w-full text-left border-collapse" aria-describedby="modal-files">
                        <thead>
                          <tr className="bg-slate-50/80">
                            <th className="py-3 px-5 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">File Name</th>
                            <th className="py-3 px-5 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">Uploaded At</th>
                            <th className="py-3 px-5 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200 text-right w-40">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                          {modalFiles.map((file) => (
                            <tr key={file.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-3 px-5">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg">
                                    <FileText size={16} />
                                  </div>
                                  <span className="font-medium text-slate-700 truncate max-w-sm" title={file.name}>
                                    {file.name}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-5 text-sm text-slate-500 font-medium whitespace-nowrap">
                                {file.upload_time ? new Date(file.upload_time).toLocaleString() : "-"}
                              </td>
                              <td className="py-3 px-5 text-right">
                                <button
                                  className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors mr-1 focus:ring-2 focus:ring-indigo-200 outline-none"
                                  onClick={() => handleViewFile(file)}
                                  aria-label={`View ${file.name}`}
                                  title="View File"
                                >
                                  <Eye size={18} />
                                </button>
                                <button
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors focus:ring-2 focus:ring-rose-200 outline-none"
                                  onClick={() => handleDeleteFile(file.id)}
                                  aria-label={`Delete ${file.name}`}
                                  title="Delete File"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm" onClick={closeProjectModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeEditModal();
          }}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100"
            role="dialog"
            aria-modal="true"
            aria-label={`Edit project ${editingProject?.name || ""}`}
          >
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Edit Project</h3>
                <div className="text-sm font-medium text-slate-500 mt-0.5">{editingProject?.name}</div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-2 rounded-xl transition-colors" onClick={closeEditModal}>
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleEditSave} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Project Name</label>
                  <input
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium appearance-none shadow-sm cursor-pointer"
                  >
                    <option value="ONGOING">Ongoing</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                {editError && <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium border border-rose-200">{editError}</div>}
                {editSuccess && <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-medium border border-emerald-200">{editSuccess}</div>}

                <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-100">
                  <button type="button" className="px-6 py-2.5 text-slate-600 font-medium rounded-xl hover:bg-slate-100 transition-colors" onClick={closeEditModal} disabled={editLoading}>
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0" disabled={editLoading}>
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
