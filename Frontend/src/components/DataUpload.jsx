import React, { useState, useEffect, useMemo, useContext } from "react";
import "../pages/Faculty/InstituteFaculty.css"; // Main CSS file for this section
import { UserContext } from "../Context/user.context";
import {
  Book,
  Upload,
  FileClock,
  Search,
  Filter,
  Trash2,
  Eye,
} from "lucide-react";
import * as XLSX from "xlsx";

const DataManagementPage = () => {
  // State for managing the active tab
  const [activeTab, setActiveTab] = useState("list");

  // State for the "My Uploads" list and its controls
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isListLoading, setIsListLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProject, setFilterProject] = useState("all");

  // State for the "Upload New File" form
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // View-specific state
  const [isViewing, setIsViewing] = useState(false);

  const { user, token } = useContext(UserContext);

  // API call to fetch initial data (uploads and projects)
  const fetchInitialData = async () => {
    setIsListLoading(true);
    setIsProjectsLoading(true);
    setListError(null);
    try {
      // Use Promise.all to fetch both sets of data concurrently
      const [filesResponse, projectsResponse] = await Promise.all([
        fetch(`http://localhost:8000/uploads/${user.id}`, {
          credentials: "include",
          method: "GET",
        }),
        fetch(`http://localhost:8000/projects/institute/${user.institute_id}`, {
          credentials: "include",
          method: "GET",
        }),
      ]);

      if (!filesResponse.ok) {
        const txt = await filesResponse.text().catch(() => null);
        throw new Error(txt || "Failed to fetch your uploaded files.");
      }
      if (!projectsResponse.ok) {
        const txt = await projectsResponse.text().catch(() => null);
        throw new Error(txt || "Failed to fetch projects.");
      }

      const filesData = await filesResponse.json();
      const projectsData = await projectsResponse.json();

      setUploadedFiles(filesData);
      setProjects(projectsData);
    } catch (err) {
      setListError(err.message || String(err));
    } finally {
      setIsListLoading(false);
      setIsProjectsLoading(false);
    }
  };

  // Fetch data when the component loads or the user changes
  useEffect(() => {
    if (user && token) {
      fetchInitialData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  // Memoized, client-side filtering and searching for a fast UI
  const filteredFiles = useMemo(() => {
    return uploadedFiles
      .filter((file) => {
        if (filterProject === "all") return true;
        return file.project_id === parseInt(filterProject);
      })
      .filter((file) =>
        (file.name || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [uploadedFiles, searchTerm, filterProject]);

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  // Handler for the upload form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    const formData = new FormData();
    formData.append("project_id", selectedProject);
    formData.append("description", description);
    formData.append("faculty_id", parseInt(user.id)); // Dummy Faculty ID
    formData.append("department_id", parseInt(user.department_id)); // Dummy Department ID
    formData.append("institute_id", parseInt(user.institute_id));
    if (files) {
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
    }

    try {
      const response = await fetch("http://localhost:8000/uploads/", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "File upload failed.");

      setSubmitSuccess(`${files?.length ?? 1} file(s) uploaded successfully!`);
      // Reset form
      setDescription("");
      setSelectedProject("");
      setFiles(null);
      e.target.reset();

      // Refresh the data and switch to the list tab for immediate feedback
      fetchInitialData();
      setActiveTab("list");
    } catch (err) {
      setSubmitError(err.message || String(err));
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitSuccess(null), 5000);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      const response = await fetch(`http://localhost:8000/uploads/${fileId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to delete file.");
      }
      setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
    } catch (err) {
      setListError(err.message || String(err));
      setTimeout(() => setListError(null), 4000);
    }
  };

  // --- 1. Helper: Determine MIME Types ---
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

  

  return (
    <div className="faculty-page-content">
      <h1>Data Management</h1>
      {/* Tab Navigation */}
      <div className="tabs">
        <button
          onClick={() => setActiveTab("list")}
          className={`tab-button ${activeTab === "list" ? "active" : ""}`}
        >
          <FileClock size={16} /> My Uploads
        </button>
        <button
          onClick={() => setActiveTab("upload")}
          className={`tab-button ${activeTab === "upload" ? "active" : ""}`}
        >
          <Upload size={16} /> Upload New File
        </button>
      </div>

      <div className="tab-content">
        {/* MY UPLOADS LIST VIEW */}
        {activeTab === "list" && (
          <div className="list-view">
            <div className="list-controls">
              <div className="search-bar">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Search by file name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-bar">
                <Filter size={20} />
                <select
                  value={filterProject}
                  onChange={(e) => setFilterProject(e.target.value)}
                  disabled={isProjectsLoading}
                >
                  <option value="all">All Projects</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isListLoading && <p>Loading your uploads...</p>}
            {listError && <p className="form-message error">{listError}</p>}
            {!isListLoading && !listError && (
              <table className="ia-data-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Project</th>
                    <th>Upload Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.length > 0 ? (
                    filteredFiles.map((file) => (
                      <tr key={file.id}>
                        <td>{file.name}</td>
                        <td>{file.project_name || "N/A"}</td>
                        <td>
                          {file.upload_time
                            ? new Date(file.upload_time).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="actions-cell">
                          <button
                            className="action-button view"
                            onClick={() => handleViewFile(file)}
                            title="View file"
                            disabled={isViewing}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="action-button delete"
                            onClick={() => handleDeleteFile(file.id)}
                            title="Delete file"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">
                        No files found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* UPLOAD NEW FILE VIEW */}
        {activeTab === "upload" && (
          <form onSubmit={handleSubmit} className="faculty-form">
            <div className="input-group">
              <label htmlFor="project-select">Select Project</label>
              <Book size={18} className="input-icon" />
              <select
                id="project-select"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                disabled={isProjectsLoading}
                required
              >
                <option value="" disabled>
                  {isProjectsLoading
                    ? "Loading projects..."
                    : "Choose a project"}
                </option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                placeholder="Provide a detailed description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="file-input-container">
              <label htmlFor="file-upload">
                <Upload size={24} /> Choose Files
              </label>
              <input
                id="file-upload"
                type="file"
                name="files"
                onChange={handleFileChange}
                multiple
                required
              />
              <span className="file-input-label">
                {files?.length > 0
                  ? `${files.length} file(s) selected`
                  : "No files chosen"}
              </span>
            </div>
            {submitError && <p className="form-message error">{submitError}</p>}
            {submitSuccess && (
              <p className="form-message success">{submitSuccess}</p>
            )}
            <button
              type="submit"
              className="button button-accent"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Uploading..." : "Upload Files"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default DataManagementPage;
