import React, { useState, useEffect, useMemo, useContext } from "react";
import { UserContext } from "../Context/user.context";
import {
  Search,
  Filter,
  Edit,
  Trash2,
  FileText,
  PlusCircle,
  Loader,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../pages/Admin/InstituteAdmin.css"; // Reusing the Institute Admin CSS
import result from "../Data/data1";
import axios from "axios";
import html2pdf from "html2pdf.js"; // ✅ NEW IMPORT

const ReportManagement = () => {
  // --- State Management ---
  const [activeTab, setActiveTab] = useState("list");
  const { user, token } = useContext(UserContext);

  // State for "All Reports" tab
  const [reports, setReports] = useState([]);
  const [isReportsLoading, setIsReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState(null);
  const [reportSearchTerm, setReportSearchTerm] = useState("");
  const navigate = useNavigate();

  // State for "Create Report" tab
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFileIds, setSelectedFileIds] = useState(new Set());
  const [isFilesLoading, setIsFilesLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMessage, setGenerationMessage] = useState("");
  const [fileSearchTerm, setFileSearchTerm] = useState("");
  const [fileFilterDept, setFileFilterDept] = useState("all");

  // NEW: Report name & description
  const [reportName, setReportName] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  // View / download states
  const [isViewingReportId, setIsViewingReportId] = useState(null);
  const [isDownloadingReportId, setIsDownloadingReportId] = useState(null); // ✅ NEW
  const [viewError, setViewError] = useState(null);

  // --- Data Fetching ---
  const fetchInitialData = async () => {
    setIsReportsLoading(true);
    try {
      const [reportsRes, projectsRes] = await Promise.all([
        fetch(`http://localhost:8000/reports/institute/${user.institute_id}`, {
          credentials: "include",
          method: "GET",
        }),
        fetch(`http://localhost:8000/projects/institute/${user.institute_id}`, {
          credentials: "include",
          method: "GET",
        }),
      ]);
      if (!reportsRes.ok) throw new Error("Failed to fetch reports.");
      if (!projectsRes.ok) throw new Error("Failed to fetch projects.");
      const reportsData = await reportsRes.json();
      const projectsData = await projectsRes.json();
      setReports(reportsData);
      setProjects(projectsData);
    } catch (err) {
      setReportsError(err.message);
    } finally {
      setIsReportsLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchInitialData();
    }
  }, [user, token]);

  // Fetch uploaded files when a project is selected
  useEffect(() => {
    const fetchUploadedFiles = async () => {
      if (!selectedProject) {
        setUploadedFiles([]);
        return;
      }
      setIsFilesLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8000/uploads/projects/${selectedProject}`,
          {
            credentials: "include",
            method: "GET",
          }
        );
        if (!response.ok)
          throw new Error("Failed to fetch uploaded files for this project.");
        const data = await response.json();
        setUploadedFiles(data);
      } catch (err) {
        setReportsError(err.message); // Reuse error state
      } finally {
        setIsFilesLoading(false);
      }
    };
    fetchUploadedFiles();
  }, [selectedProject, token]);

  // --- Memoized Filtering for UI performance ---
  const filteredReports = useMemo(() => {
    return reports.filter((report) =>
      report.file_name.toLowerCase().includes(reportSearchTerm.toLowerCase())
    );
  }, [reports, reportSearchTerm]);

  const filteredAndSearchedFiles = useMemo(() => {
    return uploadedFiles
      .filter((file) => {
        // Filter by department
        if (fileFilterDept === "all") return true;
        return file.department_id === parseInt(fileFilterDept);
      })
      .filter((file) => {
        // Filter by search term
        const searchLower = fileSearchTerm.toLowerCase();
        return (
          file.name.toLowerCase().includes(searchLower) ||
          (file.faculty_name || "").toLowerCase().includes(searchLower) ||
          (file.department_name || "").toLowerCase().includes(searchLower)
        );
      });
  }, [uploadedFiles, fileSearchTerm, fileFilterDept]);

  const uniqueDepartments = useMemo(() => {
    const depts = new Map();
    uploadedFiles.forEach((file) => {
      if (file) {
        depts.set(file.department_id, file.department_name);
      }
    });
    return Array.from(depts, ([id, name]) => ({ id, name }));
  }, [uploadedFiles]);

  // --- Event Handlers ---
  const handleFileSelection = (fileId) => {
    setSelectedFileIds((prevSelectedIds) => {
      const newSelectedIds = new Set(prevSelectedIds); // Create a new copy to avoid state mutation
      if (newSelectedIds.has(fileId)) {
        newSelectedIds.delete(fileId);
      } else {
        newSelectedIds.add(fileId);
      }
      return newSelectedIds;
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allVisibleIds = new Set(filteredAndSearchedFiles.map((f) => f.id));
      setSelectedFileIds(allVisibleIds);
    } else {
      setSelectedFileIds(new Set());
    }
  };

  const handleGenerateReport = async () => {
    // Validation: require report name and at least one file
    if (!reportName || reportName.trim() === "") {
      setGenerationMessage({
        type: "error",
        text: "Please provide a name for the report.",
      });
      return;
    }
    if (selectedFileIds.size === 0) {
      setGenerationMessage({
        type: "error",
        text: "Please select at least one file to generate the report.",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationMessage({
      type: "loading",
      text: "Generating Report... This may take a moment.",
    });

    const sourceFileIds = Array.from(selectedFileIds);

    try {
      let response;
      try {
        const axiosRes = await axios.post(
          "http://localhost:8000/reports/create",
          {
            project_id: selectedProject,
            source_file_ids: sourceFileIds,
            report_name: reportName,
            report_desc: reportDescription,
          },
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );

        response = {
          ok: axiosRes.status >= 200 && axiosRes.status < 300,
          status: axiosRes.status,
          json: async () => axiosRes.data,
        };
      } catch (err) {
        if (err.response) {
          response = {
            ok: false,
            status: err.response.status,
            json: async () => err.response.data,
          };
        } else {
          throw err;
        }
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Report generation failed.");
      }
      const res = await response.json();
      const blob = new Blob([res.html_report], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");

      setGenerationMessage({
        type: "success",
        text: "Report generated successfully! Refreshing list...",
      });
      // Refresh the reports list and switch back to the list tab
      fetchInitialData();
      setActiveTab("list");
      // Reset the form (optional)
      setReportName("");
      setReportDescription("");
      setSelectedFileIds(new Set());
    } catch (err) {
      setGenerationMessage({ type: "error", text: err.message });
    } finally {
      setIsGenerating(false);

      setTimeout(() => setGenerationMessage(""), 7000);
    }
  };

  const handleViewReport = async (reportId) => {
    setIsViewingReportId(reportId);
    setViewError(null);

    try {
      const res = await axios.get(`http://localhost:8000/reports/${reportId}`, {
        withCredentials: true,
        headers: { Accept: "application/json" },
      });

      const data = res.data;
      const html = data.html_report;

      // If backend returns HTML content
      if (html) {
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        return;
      }
      throw new Error("No viewable report content returned from server.");
    } catch (err) {
      setViewError(
        err.response?.data?.detail || err.message || "Failed to load report."
      );
    } finally {
      setIsViewingReportId(null);
      setTimeout(() => setViewError(null), 5000);
    }
  };

  // ✅ NEW: Download report as PDF by converting HTML → PDF on client
  const handleDownloadReport = async (report) => {
    setIsDownloadingReportId(report.id);
    setViewError(null);

    try {
      const res = await axios.get(`http://localhost:8000/reports/${report.id}`, {
        withCredentials: true,
        headers: { Accept: "application/json" },
      });

      const data = res.data;
      const html = data.html_report;

      if (!html) {
        throw new Error("No downloadable report content returned from server.");
      }

      const fileNameBase =
        (report.file_name || `report-${report.id}`).replace(/\s+/g, "_") ||
        `report-${report.id}`;

      const options = {
        margin: 10,
        filename: `${fileNameBase}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      // html2pdf accepts an HTML string as source
      await html2pdf().from(html).set(options).save();
    } catch (err) {
      setViewError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to download report."
      );
      setTimeout(() => setViewError(null), 5000);
    } finally {
      setIsDownloadingReportId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;

    try {
      const res = await axios.delete(
        `http://localhost:8000/reports/delete/${id}`,
        {
          withCredentials: true,
          headers: { Accept: "application/json" },
        }
      );

      if (res.status >= 200 && res.status < 300) {
        // remove from local state to update UI immediately
        setReports((prev) => prev.filter((r) => r.id !== id));
      } else {
        throw new Error(res.data?.detail || "Failed to delete report.");
      }
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        "Failed to delete report.";
      setReportsError(msg);
      // attempt to refresh list to keep UI consistent
      try {
        await fetchInitialData();
      } catch {
        // ignore
      }
      setTimeout(() => setReportsError(null), 5000);
    }
  };

  return (
    <div className="management-page">
      <h1>Report Management</h1>

      <div className="tabs">
        <button
          onClick={() => setActiveTab("list")}
          className={`tab-button ${activeTab === "list" ? "active" : ""}`}
        >
          <FileText size={16} /> All Reports
        </button>
        <button
          onClick={() => setActiveTab("create")}
          className={`tab-button ${activeTab === "create" ? "active" : ""}`}
        >
          <PlusCircle size={16} /> Create New Report
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
                  placeholder="Search by report title..."
                  value={reportSearchTerm}
                  onChange={(e) => setReportSearchTerm(e.target.value)}
                />
              </div>
            </div>
            {isReportsLoading && <p>Loading reports...</p>}
            {reportsError && (
              <p className="form-message error">{reportsError}</p>
            )}
            {viewError && (
              <p className="form-message error" style={{ marginTop: 8 }}>
                {viewError}
              </p>
            )}
            {!isReportsLoading && !reportsError && (
              <table className="data-table ia-data-table">
                <thead>
                  <tr>
                    <th>Report Title</th>
                    <th>Project</th>
                    <th>Date Generated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                      <tr key={report.id}>
                        <td>{report.file_name}</td>
                        <td>
                          {projects.find((p) => p.id === report.project_id)
                            ?.name || "N/A"}
                        </td>
                        <td>
                          {new Date(report.created_at).toLocaleString()}
                        </td>
                        <td className="actions-cell">
                          {/* View button */}
                          <button
                            className="action-button view"
                            onClick={() => handleViewReport(report.id)}
                            disabled={isViewingReportId === report.id}
                          >
                            {isViewingReportId === report.id
                              ? "Viewing..."
                              : "View"}
                          </button>

                          {/* ✅ New Download button (beside View) */}
                          <button
                            className="action-button view"
                            onClick={() => handleDownloadReport(report)}
                            disabled={isDownloadingReportId === report.id}
                          >
                            {isDownloadingReportId === report.id
                              ? "Downloading..."
                              : "Download"}
                          </button>

                          {/* Delete button */}
                          <button
                            className="action-button delete"
                            onClick={() => handleDelete(report.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">No reports found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* CREATE VIEW */}
        {activeTab === "create" && (
          <div className="create-report-view">
            <div className="ia-form">
              <label>1. Select a Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                disabled={isReportsLoading}
              >
                <option value="" disabled>
                  Choose a project to begin...
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* NEW: Report name & description inputs */}
            <div className="ia-form">
              <label>
                Report Name <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Enter a descriptive report name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
              />
            </div>
            <div className="ia-form">
              <label>Report Description (optional)</label>
              <textarea
                placeholder="Describe the purpose and scope of this report (optional)"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                rows={3}
              />
            </div>

            {selectedProject && (
              <div className="file-selection-panel">
                <label className="panel-label">
                  2. Select Source Files for the Report
                </label>

                <div className="list-controls">
                  <div className="search-bar">
                    <Search size={20} />
                    <input
                      type="text"
                      placeholder="Search files by name, uploader, or department..."
                      value={fileSearchTerm}
                      onChange={(e) => setFileSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="filter-bar">
                    <Filter size={20} />
                    <select
                      value={fileFilterDept}
                      onChange={(e) => setFileFilterDept(e.target.value)}
                    >
                      <option value="all">All Departments</option>
                      {uniqueDepartments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {isFilesLoading && (
                  <p>
                    <Loader size={18} className="spinner" /> Loading files for
                    this project...
                  </p>
                )}

                {!isFilesLoading && (
                  <div className="file-selection-list">
                    <div className="file-selection-header">
                      <input
                        type="checkbox"
                        id="select-all"
                        onChange={handleSelectAll}
                        checked={
                          filteredAndSearchedFiles.length > 0 &&
                          selectedFileIds.size ===
                            filteredAndSearchedFiles.length
                        }
                      />
                      <label htmlFor="select-all">Select All Visible</label>
                    </div>
                    {filteredAndSearchedFiles.length > 0 ? (
                      filteredAndSearchedFiles.map((file) => (
                        <div key={file.id} className="file-selection-item">
                          <input
                            type="checkbox"
                            id={`file-${file.id}`}
                            checked={selectedFileIds.has(file.id)}
                            onChange={() => handleFileSelection(file.id)}
                          />
                          <label
                            htmlFor={`file-${file.id}`}
                            className="file-details"
                          >
                            <span className="file-name">{file.name}</span>
                            <span className="file-meta">
                              <span>
                                By:{" "}
                                <strong>{file.faculty_name || "N/A"}</strong>
                              </span>
                              <span>
                                Dept:{" "}
                                <strong>{file.department_name || "N/A"}</strong>
                              </span>
                              <span>
                                On:{" "}
                                <strong>
                                  {new Date(
                                    file.upload_time
                                  ).toLocaleDateString()}
                                </strong>
                              </span>
                            </span>
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="no-files-message">
                        No files found matching your criteria.
                      </p>
                    )}
                  </div>
                )}

                {generationMessage && (
                  <p className={`form-message ${generationMessage.type}`}>
                    {generationMessage.type === "loading" && (
                      <Loader size={18} className="spinner" />
                    )}
                    {generationMessage.type === "error" && (
                      <AlertCircle size={18} />
                    )}
                    {generationMessage.text}
                  </p>
                )}

                <button
                  onClick={handleGenerateReport}
                  className="button button-accent generate-button"
                  disabled={isGenerating || selectedFileIds.size === 0}
                >
                  {isGenerating
                    ? "Generating Report..."
                    : `Generate Report from ${selectedFileIds.size} Selected File(s)`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportManagement;
