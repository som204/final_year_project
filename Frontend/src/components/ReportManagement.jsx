import React, { useState, useEffect, useMemo, useContext } from "react";
import { UserContext } from "../Context/user.context";
import {
  Search,
  Filter,
  Trash2,
  FileText,
  PlusCircle,
  Download,
  Loader2,
  Layout,
  Eye,
  Edit,
  CheckCircle,
  Share2, // Icon for Publish
  MessageSquare, // Icon for Comments
  Globe, // Icon for Global
  Users, // Icon for Stakeholders
  X, // Icon for Close
} from "lucide-react";
import { useNavigate} from "react-router-dom";
import "../pages/Admin/InstituteAdmin.css";
import axios from "axios";
import html2pdf from "html2pdf.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// --- MOCK TEMPLATE DATA ---
const REPORT_TEMPLATES = [
  {
    id: 1,
    name: "Standard Academic",
    description: "Formal layout with abstract and full citations.",
  },
  {
    id: 2,
    name: "Executive Summary",
    description: "Concise layout focusing on key findings.",
  },
  {
    id: 3,
    name: "Data Analysis",
    description: "Heavy focus on charts, graphs, and raw data.",
  },
  {
    id: 4,
    name: "Project Showcase",
    description: "Visual layout ideal for presenting project outcomes.",
  }
];

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

  const [reportName, setReportName] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");

  // View / Publish / Comment states
  const [isViewingReportId, setIsViewingReportId] = useState(null);
  const [viewError, setViewError] = useState(null);

  // -- NEW MODAL STATES --
  const [publishModalReport, setPublishModalReport] = useState(null); // Report being published
  const [commentsModalReport, setCommentsModalReport] = useState(null); // Report whose comments are viewed
  const [reportComments, setReportComments] = useState([]); // Comments for the active report

  const [isDownloadingReportId, setIsDownloadingReportId] = useState(null);

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
          },
        );
        if (!response.ok)
          throw new Error("Failed to fetch uploaded files for this project.");
        const data = await response.json();
        setUploadedFiles(data);
      } catch (err) {
        setReportsError(err.message);
      } finally {
        setIsFilesLoading(false);
      }
    };
    fetchUploadedFiles();
  }, [selectedProject, token]);

  // --- Memoized Filtering ---
  const filteredReports = useMemo(() => {
    return reports.filter((report) =>
      report.file_name.toLowerCase().includes(reportSearchTerm.toLowerCase()),
    );
  }, [reports, reportSearchTerm]);

  const filteredAndSearchedFiles = useMemo(() => {
    return uploadedFiles
      .filter((file) => {
        if (fileFilterDept === "all") return true;
        return file.department_id === parseInt(fileFilterDept);
      })
      .filter((file) => {
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
      const newSelectedIds = new Set(prevSelectedIds);
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

  const handleTemplateView = async (e, template) => {
    e.stopPropagation();
    try {
      const res = await axios.get(
        `http://localhost:8000/reports/template/${template.id}`,
        {
          withCredentials: true,
          headers: { Accept: "application/json" },
        }
      );
      const html = res.data;
      if (html) {
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      } else {
        alert("No template content available.");
      }
    } catch (error) {
      alert(
        "Failed to load template: " +
          (error.response?.data?.detail || error.message)
      );
    }
  };

  const handleGenerateReport = async () => {
    if (!reportName || reportName.trim() === "") {
      setGenerationMessage({
        type: "error",
        text: "Please provide a name for the report.",
      });
      return;
    }
    if (!selectedTemplate) {
      setGenerationMessage({
        type: "error",
        text: "Please select a report template.",
      });
      return;
    }
    if (selectedFileIds.size === 0) {
      setGenerationMessage({
        type: "error",
        text: "Please select at least one file.",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationMessage({ type: "loading", text: "Generating Report..." });

    const sourceFileIds = Array.from(selectedFileIds);

    try {
      const axiosRes = await axios.post(
        "http://localhost:8000/reports/create",
        {
          project_id: selectedProject,
          source_file_ids: sourceFileIds,
          report_name: reportName,
          report_desc: reportDescription,
          report_template: selectedTemplate,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      );

      setGenerationMessage({
        type: "success",
        text: "Report generated successfully!",
      });
      fetchInitialData();
      setActiveTab("list");
      setReportName("");
      setReportDescription("");
      setSelectedTemplate("");
      setSelectedFileIds(new Set());
    } catch (err) {
      setGenerationMessage({
        type: "error",
        text: err.response?.data?.detail || err.message,
      });
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

    const A4_PX_WIDTH = 794;
    const A4_WIDTH_MM = 210;
    const A4_HEIGHT_MM = 297;

    // Create iframe at A4 width but auto height — let content breathe
    const iframe = document.createElement("iframe");
    iframe.style.cssText = `
      position: fixed;
      top: 0;
      left: -9999px;
      width: ${A4_PX_WIDTH}px;
      height: 1px;
      border: none;
      visibility: hidden;
      overflow: visible;
    `;
    document.body.appendChild(iframe);

    // Inject styles that fix WIDTH only, never constrain HEIGHT
    const styledHtml = html.replace(
      "</head>",
      `<style>
        * { box-sizing: border-box !important; }
        html, body {
          width: ${A4_PX_WIDTH}px !important;
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
          overflow: visible !important;
        }
        .pages, .container {
          width: ${A4_PX_WIDTH}px !important;
          margin: 0 !important;
          padding: 0 !important;
          gap: 0 !important;
          background: white !important;
        }
        /* Remove any height constraints — let .page be as tall as its content */
        .page {
          width: ${A4_PX_WIDTH}px !important;
          min-height: unset !important;
          max-height: unset !important;
          height: auto !important;
          overflow: visible !important;
          margin: 0 !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          page-break-after: always !important;
          display: flex !important;
          flex-direction: column !important;
        }
      </style>
      </head>`,
    );

    iframe.contentDocument.open();
    iframe.contentDocument.write(styledHtml);
    iframe.contentDocument.close();

    await new Promise((resolve) => {
      iframe.onload = resolve;
      if (iframe.contentDocument.readyState === "complete") resolve();
    });

    // Wait for fonts and layout to fully paint
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    // Expand iframe to match full rendered content height
    const totalHeight = iframeDoc.documentElement.scrollHeight;
    iframe.style.height = `${totalHeight}px`;

    // Wait a tick for reflow after resize
    await new Promise((resolve) => setTimeout(resolve, 200));

    let pageElements = Array.from(iframeDoc.querySelectorAll(".page"));
    if (pageElements.length === 0) {
      pageElements = [iframeDoc.body];
    }

    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });

    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];

      // Measure the natural rendered height of this page element
      const elHeight = pageEl.scrollHeight;
      const elWidth = A4_PX_WIDTH;

      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: elWidth,
        height: elHeight,        // full natural height — no cropping
        windowWidth: A4_PX_WIDTH,
        windowHeight: elHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.97);

      // Convert canvas px → mm (scale:2 means canvas is 2x, so divide by 2)
      const imgHeightMm = (elHeight / 96) * 25.4;  // natural height in mm
      const imgWidthMm = A4_WIDTH_MM;               // always full A4 width

      if (i > 0) pdf.addPage();

      if (imgHeightMm <= A4_HEIGHT_MM) {
        // Content fits within one A4 page — place at top, no cropping
        pdf.addImage(imgData, "JPEG", 0, 0, imgWidthMm, imgHeightMm);
      } else {
        // Content taller than A4 — slice it into multiple PDF pages
        const pageHeightPx = (A4_HEIGHT_MM / 25.4) * 96; // A4 height in px
        const totalPages = Math.ceil(elHeight / pageHeightPx);

        for (let p = 0; p < totalPages; p++) {
          if (p > 0) pdf.addPage();

          // Create a slice canvas for each A4-height chunk
          const sliceCanvas = document.createElement("canvas");
          const sliceHeight = Math.min(
            pageHeightPx,
            elHeight - p * pageHeightPx,
          );
          sliceCanvas.width = canvas.width;                          // full width at scale:2
          sliceCanvas.height = sliceHeight * 2;                     // scale:2

          const ctx = sliceCanvas.getContext("2d");
          ctx.drawImage(
            canvas,
            0, p * pageHeightPx * 2,                               // source x, y (scale:2)
            canvas.width, sliceHeight * 2,                          // source width, height
            0, 0,                                                    // dest x, y
            sliceCanvas.width, sliceCanvas.height,                  // dest width, height
          );

          const sliceData = sliceCanvas.toDataURL("image/jpeg", 0.97);
          const sliceHeightMm = (sliceHeight / 96) * 25.4;
          pdf.addImage(sliceData, "JPEG", 0, 0, imgWidthMm, sliceHeightMm);
        }
      }
    }

    pdf.save(`${fileNameBase}.pdf`);
    document.body.removeChild(iframe);

  } catch (err) {
    const existingIframe = document.querySelector('iframe[style*="-9999px"]');
    if (existingIframe) document.body.removeChild(existingIframe);

    setViewError(
      err.response?.data?.detail ||
        err.message ||
        "Failed to download report.",
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
        { withCredentials: true },
      );
      if (res.status >= 200 && res.status < 300) {
        setReports((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      setReportsError("Failed to delete report.");
      setTimeout(() => setReportsError(null), 5000);
    }
  };

  // --- NEW HANDLERS FOR PUBLISH & COMMENTS ---

  // 1. Open Publish Options Modal
  const handleOpenPublishModal = (report) => {
    setPublishModalReport(report);
  };

  // 2. Execute Publish Action (UPDATED WITH API CALL)
  const handlePublishAction = async (visibilityType) => {
    try {
      // Assuming your backend expects a POST to a /share endpoint with report_id and visibility
      // console.log("Publishing report", publishModalReport.id, "as", visibilityType);
      await axios.post(
        `http://localhost:8000/reports/share`,
        { 
          report_id: publishModalReport.id, 
          share_level: visibilityType, 
        },
        { withCredentials: true }
      );

      // Update the local state so the UI badge updates immediately
      setReports((prev) => 
        prev.map((r) => 
          r.id === publishModalReport.id ? { ...r, share: visibilityType } : r
        )
      );

      alert(`Report visibility successfully updated to ${visibilityType}.`);
    } catch (error) {
      alert("Failed to update report visibility: " + (error.response?.data?.detail || error.message));
    } finally {
      setPublishModalReport(null); // Close modal
    }
  };

  // 3. Open Comments Modal (UPDATED TO EXTRACT ALL COMMENTS)
  const handleOpenComments = (report) => {
    setCommentsModalReport(report);
    
    // Extract comments from the report object
    // Mapping the data to match our UI rendering needs
    const extractedComments = (report.comments || []).map(comment => ({
      id: comment.id,
      user: comment.user?.full_name || comment.user_name || "Unknown User",
      dept: comment.user?.department?.name || comment.department_name || "N/A",
      text: comment.comment || comment.comment_text || comment.text,
      date: comment.created_at ? new Date(comment.created_at).toLocaleString() : "Just now"
    }));

    setReportComments(extractedComments);
  };

  // Helper function to get badge styling based on visibility
  const getVisibilityBadgeStyle = (visibility) => {
    switch (visibility) {
      case 'public':
        return { backgroundColor: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' };
      case 'shared':
        return { backgroundColor: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd' };
      case 'private':
      default:
        return { backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' };
    }
  };

  const handleOpenEdit = (report) => {
    // Navigates to the route created in Step 2
    window.open(`/institute-admin/report/edit/${report.id}`, '_blank');
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
            {viewError && <p className="form-message error">{viewError}</p>}

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
                        {/* CLICKABLE TITLE & VISIBILITY BADGE */}
                        <td className="report-title-cell">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <span
                              className="clickable-title"
                              onClick={() => handleOpenComments(report)}
                              title="Click to view comments"
                            >
                              <MessageSquare size={14} className="title-icon" />
                              {report.file_name}
                            </span>
                            <span 
                              style={{
                                fontSize: '0.7rem',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                ...getVisibilityBadgeStyle(report.share)
                              }}
                            >
                              {report.share || 'Private'}
                            </span>
                          </div>
                        </td>
                        <td>
                          {projects.find((p) => p.id === report.project_id)
                            ?.name || "N/A"}
                        </td>
                        <td>{new Date(report.created_at).toLocaleString()}</td>
                        <td className="actions-cell">
                          {/* View Button */}
                          <button
                            className="action-button view"
                            onClick={() => handleViewReport(report.id)}
                            disabled={isViewingReportId === report.id}
                            title="View PDF"
                          >
                            <Eye size={16} />
                          </button>
                          <button className="action-button view" onClick={() => handleOpenEdit(report)} title="Live Edit Report">
                            <Edit size={16} />
                          </button>

                          {/* Publish Button */}
                          <button
                            className="action-button publish"
                            onClick={() => handleOpenPublishModal(report)}
                            title="Publish Report"
                          >
                            <Share2 size={16} />
                          </button>

                          {/* Download Button */}
                          <button
                            className="action-button view"
                            onClick={() => handleDownloadReport(report)}
                            disabled={isDownloadingReportId === report.id}
                            title="Download Report"
                          >
                            {isDownloadingReportId === report.id ? (
                              <Loader2 size={16} className="spinner" />
                            ) : (
                              <Download size={16} />
                            )}
                          </button>

                          {/* Delete Button */}
                          <button
                            className="action-button delete"
                            onClick={() => handleDelete(report.id)}
                            title="Delete Report"
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
              >
                <option value="" disabled>
                  Choose a project...
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="ia-form">
              <label>Report Name *</label>
              <input
                type="text"
                placeholder="Enter report name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
              />
            </div>
            <div className="ia-form">
              <label>Description</label>
              <textarea
                rows={2}
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
              />
            </div>

            {selectedProject && (
              <>
                <div className="template-selection-panel">
                  <label className="panel-label">2. Select Template</label>
                  <div className="template-grid">
                    {REPORT_TEMPLATES.map((tpl) => (
                      <div
                        key={tpl.id}
                        className={`template-card ${selectedTemplate === tpl.id ? "selected" : ""}`}
                        onClick={() => setSelectedTemplate(tpl.id)}
                      >
                        <div className="template-card-header">
                          <div className="template-icon">
                            <Layout size={20} />
                          </div>
                          {selectedTemplate === tpl.id && (
                            <CheckCircle size={18} className="check-icon" />
                          )}
                        </div>
                        <div className="template-info">
                          <h4>{tpl.name}</h4>
                          <p>{tpl.description}</p>
                        </div>
                        <div className="template-actions">
                          <button
                            className="template-view-btn"
                            onClick={(e) => handleTemplateView(e, tpl)}
                          >
                            <Eye size={14} /> View Sample
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="file-selection-panel">
                  <label className="panel-label">3. Select Files</label>
                  <div className="list-controls">
                    <div className="search-bar">
                      <Search size={20} />
                      <input
                        type="text"
                        placeholder="Search files..."
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
                        <option value="all">All Depts</option>
                        {uniqueDepartments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="file-selection-list">
                    <div className="file-selection-header">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={
                          filteredAndSearchedFiles.length > 0 &&
                          selectedFileIds.size ===
                            filteredAndSearchedFiles.length
                        }
                      />
                      <label>Select All</label>
                    </div>
                    {filteredAndSearchedFiles.map((file) => (
                      <div key={file.id} className="file-selection-item">
                        <input
                          type="checkbox"
                          checked={selectedFileIds.has(file.id)}
                          onChange={() => handleFileSelection(file.id)}
                        />
                        <label className="file-details">
                          <span className="file-name">{file.name}</span>
                          <span className="file-meta">
                            <span>
                              By: <strong>{file.faculty_name}</strong>
                            </span>
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                  {generationMessage && (
                    <p className={`form-message ${generationMessage.type}`}>
                      {generationMessage.text}
                    </p>
                  )}
                  <button
                    onClick={handleGenerateReport}
                    className="generate-button"
                    disabled={
                      isGenerating ||
                      selectedFileIds.size === 0 ||
                      !selectedTemplate
                    }
                  >
                    {isGenerating ? "Generating..." : "Generate Report"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* --- MODAL: PUBLISH OPTIONS --- */}
      {publishModalReport && (
        <div
          className="modal-overlay"
          onClick={() => setPublishModalReport(null)}
        >
          <div
            className="modal-content small-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Publish Report</h3>
              <button
                className="close-btn"
                onClick={() => setPublishModalReport(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>
                Choose where to publish{" "}
                <strong>{publishModalReport.file_name}</strong>:
              </p>
              <div className="publish-options">
                <button
                  className="publish-option-btn"
                  onClick={() => handlePublishAction("shared")}
                >
                  <div className="p-icon">
                    <Users size={24} />
                  </div>
                  <div className="p-info">
                    <h4>To Stakeholders (Shared)</h4>
                    <span>Visible to internal faculty & admin</span>
                  </div>
                </button>
                <button
                  className="publish-option-btn"
                  onClick={() => handlePublishAction("public")}
                >
                  <div className="p-icon">
                    <Globe size={24} />
                  </div>
                  <div className="p-info">
                    <h4>Globally (Public)</h4>
                    <span>Visible to public & institute website</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: COMMENTS VIEW --- */}
      {commentsModalReport && (
        <div
          className="modal-overlay"
          onClick={() => setCommentsModalReport(null)}
        >
          <div
            className="modal-content medium-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Report Comments</h3>
              <button
                className="close-btn"
                onClick={() => setCommentsModalReport(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-sub-header">
              Report: <strong>{commentsModalReport.file_name}</strong>
            </div>
            <div className="modal-body comments-body">
              {reportComments.length > 0 ? (
                <div className="comments-list">
                  {reportComments.map((comment) => (
                    <div key={comment.id} className="comment-card">
                      <div className="comment-header">
                        <span className="comment-user">{comment.user}</span>
                        <span className="comment-dept">({comment.dept})</span>
                        <span className="comment-date">{comment.date}</span>
                      </div>
                      <div className="comment-text">{comment.text}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-comments">
                  No comments available for this report.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManagement;