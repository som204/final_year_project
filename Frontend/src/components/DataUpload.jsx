import React, { useState, useEffect, useMemo, useContext } from "react";
import { API_BASE_URL } from '../config';

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
        fetch(`${API_BASE_URL}/uploads/${user.id}`, {
          credentials: "include",
          method: "GET",
        }),
        fetch(`${API_BASE_URL}/projects/institute/${user.institute_id}`, {
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
      const response = await fetch(`${API_BASE_URL}/uploads/`, {
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
      const response = await fetch(`${API_BASE_URL}/uploads/${fileId}`, {
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
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 md:mb-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Data Management</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage and upload your project files</p>
        </header>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 md:gap-4 mb-8 border-b border-slate-200 pb-px animate-in fade-in slide-in-from-bottom-3 duration-500 delay-75 fill-mode-both">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-t-xl transition-all duration-200 border-b-2 ${
              activeTab === "list"
                ? "bg-white text-indigo-600 border-indigo-600 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
                : "text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <FileClock size={18} /> My Uploads
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-t-xl transition-all duration-200 border-b-2 ${
              activeTab === "upload"
                ? "bg-white text-indigo-600 border-indigo-600 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
                : "text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <Upload size={18} /> Upload New File
          </button>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
          {/* MY UPLOADS LIST VIEW */}
          {activeTab === "list" && (
            <div className="space-y-6">
              
              {/* Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by file name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium placeholder:font-normal placeholder:text-slate-400"
                  />
                </div>
                
                <div className="relative w-full md:w-64">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    value={filterProject}
                    onChange={(e) => setFilterProject(e.target.value)}
                    disabled={isProjectsLoading}
                    className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium appearance-none cursor-pointer text-slate-700 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <option value="all">All Projects</option>
                    {projects.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              {isListLoading && (
                 <div className="flex justify-center items-center h-48 bg-white rounded-3xl border border-slate-100 shadow-sm">
                   <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                 </div>
              )}
              
              {listError && (
                 <div className="bg-rose-50 border border-rose-200 text-rose-600 px-6 py-4 rounded-xl font-medium shadow-sm">
                   {listError}
                 </div>
              )}

              {!isListLoading && !listError && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  
                  {/* DESKTOP TABLE */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr>
                          <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100 whitespace-nowrap">File Name</th>
                          <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100 whitespace-nowrap">Project</th>
                          <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100 whitespace-nowrap">Upload Date</th>
                          <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100 text-right whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {filteredFiles.length > 0 ? (
                          filteredFiles.map((file) => (
                            <tr key={file.id} className="hover:bg-slate-50/80 transition-colors group">
                              <td className="py-4 px-6 border-b border-slate-50 font-bold text-slate-800 break-all min-w-[200px]">{file.name}</td>
                              <td className="py-4 px-6 border-b border-slate-50 text-slate-600 font-medium max-w-[250px] truncate" title={file.project_name || "N/A"}>
                                {file.project_name || "N/A"}
                              </td>
                              <td className="py-4 px-6 border-b border-slate-50 text-slate-500 whitespace-nowrap">
                                {file.upload_time
                                  ? new Date(file.upload_time).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                                  : "-"}
                              </td>
                              <td className="py-4 px-6 border-b border-slate-50 text-right whitespace-nowrap">
                                <button
                                  className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors mr-2 focus:ring-2 focus:ring-indigo-200 outline-none font-medium text-sm disabled:opacity-50"
                                  onClick={() => handleViewFile(file)}
                                  title="View file"
                                  disabled={isViewing}
                                >
                                  <Eye size={18} />
                                </button>
                                <button
                                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors focus:ring-2 focus:ring-rose-200 outline-none font-medium text-sm disabled:opacity-50"
                                  onClick={() => handleDeleteFile(file.id)}
                                  title="Delete file"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="py-16 text-center text-slate-500">
                              <div className="flex flex-col items-center justify-center gap-3">
                                <FileClock className="w-12 h-12 text-slate-200" />
                                <p className="font-medium text-lg text-slate-400">No files found matching your criteria.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE LIST */}
                  <div className="md:hidden flex flex-col divide-y divide-slate-100">
                    {filteredFiles.length > 0 ? (
                      filteredFiles.map((file) => (
                        <div key={file.id} className="p-5 flex flex-col gap-4">
                          <div className="flex flex-col gap-1 pr-10">
                            <h3 className="font-bold text-slate-800 text-lg leading-tight break-all">{file.name}</h3>
                            <span className="text-sm font-medium text-slate-500">
                              {file.project_name || "N/A"}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-sm font-medium text-slate-500">
                              {file.upload_time ? new Date(file.upload_time).toLocaleDateString() : "-"}
                            </span>
                            <div className="flex gap-2">
                              <button
                                className="p-2 text-indigo-500 hover:bg-indigo-100 bg-indigo-50 border border-indigo-100 rounded-lg transition-colors disabled:opacity-50"
                                onClick={() => handleViewFile(file)}
                                disabled={isViewing}
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                className="p-2 text-rose-500 hover:bg-rose-100 bg-rose-50 border border-rose-100 rounded-lg transition-colors"
                                onClick={() => handleDeleteFile(file.id)}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-slate-500">
                        <FileClock className="mx-auto mb-3 text-slate-200 w-12 h-12" />
                        <p className="font-medium">No files found.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* UPLOAD NEW FILE VIEW */}
          {activeTab === "upload" && (
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div>
                    <label htmlFor="project-select" className="block text-sm font-medium text-slate-700 mb-2">Select Project</label>
                    <div className="relative">
                      <Book size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select
                        id="project-select"
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        disabled={isProjectsLoading}
                        required
                        className="w-full pl-11 pr-10 py-3.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all font-medium appearance-none cursor-pointer text-slate-800 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        <option value="" disabled>
                          {isProjectsLoading ? "Loading projects..." : "Choose a project"}
                        </option>
                        {projects.map((proj) => (
                          <option key={proj.id} value={proj.id}>{proj.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      placeholder="Provide a detailed description of the file contents..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows="4"
                      className="w-full px-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-800 placeholder:font-normal placeholder:text-slate-400 resize-y"
                    />
                  </div>

                  <div>
                    <span className="block text-sm font-medium text-slate-700 mb-2">Upload Files</span>
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-200 group relative text-center">
                      <input
                        id="file-upload"
                        type="file"
                        name="files"
                        onChange={handleFileChange}
                        multiple
                        required
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Upload size={24} />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-slate-700 mb-1">
                            {files?.length > 0 ? <span className="text-indigo-600">{files.length} file(s) selected</span> : "Click to browse or drag and drop"}
                          </p>
                          <p className="text-sm text-slate-500 font-medium">Supports PDF, XLSX, DOCX, Images, etc.</p>
                        </div>
                        {files?.length > 0 && (
                          <div className="mt-2 text-left w-full max-w-sm">
                            <ul className="text-sm text-slate-600 space-y-1">
                              {Array.from(files).slice(0,3).map((f, i) => (
                                <li key={i} className="truncate flex items-center gap-2">
                                  <FileClock size={12} className="text-slate-400 shrink-0"/> {f.name}
                                </li>
                              ))}
                              {files.length > 3 && <li className="text-slate-400 pl-5 text-xs font-semibold">...and {files.length - 3} more</li>}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {submitError && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-600 px-5 py-4 rounded-xl font-medium flex items-start gap-3">
                      <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      {submitError}
                    </div>
                  )}
                  {submitSuccess && (
                     <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-5 py-4 rounded-xl font-medium flex items-start gap-3">
                      <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      {submitSuccess}
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full md:w-auto px-8 py-3.5 bg-indigo-600 text-white font-semibold flex items-center justify-center gap-2 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5 transition-all text-lg disabled:opacity-70 disabled:hover:translate-y-0 disabled:shadow-none"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Uploading...
                        </>
                      ) : (
                        <>Upload Files</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataManagementPage;
