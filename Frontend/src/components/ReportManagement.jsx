import React, { useState, useEffect, useMemo, useContext } from "react";
import { API_BASE_URL } from "../config";
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
        fetch(`${API_BASE_URL}/reports/institute/${user.institute_id}`, {
          credentials: "include",
          method: "GET",
        }),
        fetch(`${API_BASE_URL}/projects/institute/${user.institute_id}`, {
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
          `${API_BASE_URL}/uploads/projects/${selectedProject}`,
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
        `${API_BASE_URL}/reports/template/${template.id}`,
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
        `${API_BASE_URL}/reports/create`,
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
      const res = await axios.get(`${API_BASE_URL}/reports/${reportId}`, {
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
    const res = await axios.get(`${API_BASE_URL}/reports/${report.id}`, {
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
        `${API_BASE_URL}/reports/delete/${id}`,
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
        `${API_BASE_URL}/reports/share`,
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
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Report Management</h1>
          <p className="text-slate-500 mt-2 font-medium">Generate, publish, and manage comprehensive institutional reports</p>
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
            <FileText size={18} /> All Reports
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === "create"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            <PlusCircle size={18} /> Create New Report
          </button>
        </div>

        <div className="transition-all duration-300">
          {/* LIST VIEW */}
          {activeTab === "list" && (
            <div className="animate-in fade-in duration-300 slide-in-from-bottom-2">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by report title..."
                    value={reportSearchTerm}
                    onChange={(e) => setReportSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium placeholder:font-normal placeholder:text-slate-400"
                  />
                </div>
              </div>

              {isReportsLoading && (
                <div className="flex justify-center items-center py-12 text-slate-500">
                  <Loader2 className="animate-spin text-indigo-500 mr-3" size={32} />
                  <span className="font-medium text-lg">Loading reports...</span>
                </div>
              )}
              {reportsError && <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-200 font-medium my-6">{reportsError}</div>}
              {viewError && <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-200 font-medium my-6">{viewError}</div>}

              {!isReportsLoading && !reportsError && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80">
                          <th className="py-4 px-6 text-slate-500 font-semibold text-sm border-b border-slate-100">Report Title</th>
                          <th className="py-4 px-6 text-slate-500 font-semibold text-sm border-b border-slate-100">Project</th>
                          <th className="py-4 px-6 text-slate-500 font-semibold text-sm border-b border-slate-100">Date Generated</th>
                          <th className="py-4 px-6 text-slate-500 font-semibold text-sm border-b border-slate-100 text-right w-56">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {filteredReports.length > 0 ? (
                          filteredReports.map((report) => (
                            <tr key={report.id} className="hover:bg-slate-50/80 transition-colors group">
                              <td className="py-4 px-6 border-b border-slate-50">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <button
                                    className="flex items-center gap-2 font-bold text-slate-800 hover:text-indigo-600 transition-colors focus:outline-none text-left"
                                    onClick={() => handleOpenComments(report)}
                                    title="Click to view comments"
                                  >
                                    <MessageSquare size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0" />
                                    <span>{report.file_name}</span>
                                  </button>
                                  <span
                                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase"
                                    style={getVisibilityBadgeStyle(report.share)}
                                  >
                                    {report.share || 'Private'}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-6 border-b border-slate-50 text-slate-600 font-medium">
                                {projects.find((p) => p.id === report.project_id)?.name || "N/A"}
                              </td>
                              <td className="py-4 px-6 border-b border-slate-50 text-slate-600 font-medium whitespace-nowrap">
                                {new Date(report.created_at).toLocaleString()}
                              </td>
                              <td className="py-4 px-6 border-b border-slate-50 text-right whitespace-nowrap">
                                <button
                                  className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors mr-1 focus:ring-2 focus:ring-indigo-200 outline-none disabled:opacity-50"
                                  onClick={() => handleViewReport(report.id)}
                                  disabled={isViewingReportId === report.id}
                                  title="View PDF"
                                >
                                  <Eye size={18} />
                                </button>
                                <button 
                                  className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors mr-1 focus:ring-2 focus:ring-indigo-200 outline-none" 
                                  onClick={() => handleOpenEdit(report)} 
                                  title="Live Edit Report"
                                >
                                  <Edit size={18} />
                                </button>

                                <button
                                  className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors mr-1 focus:ring-2 focus:ring-indigo-200 outline-none"
                                  onClick={() => handleOpenPublishModal(report)}
                                  title="Publish Report"
                                >
                                  <Share2 size={18} />
                                </button>

                                <button
                                  className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors mr-1 focus:ring-2 focus:ring-indigo-200 outline-none disabled:opacity-50"
                                  onClick={() => handleDownloadReport(report)}
                                  disabled={isDownloadingReportId === report.id}
                                  title="Download Report"
                                >
                                  {isDownloadingReportId === report.id ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                </button>

                                <button
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors focus:ring-2 focus:ring-rose-200 outline-none"
                                  onClick={() => handleDelete(report.id)}
                                  title="Delete Report"
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
                                <FileText className="w-12 h-12 text-slate-200" />
                                <p className="text-lg">No reports found.</p>
                                <p className="text-sm text-slate-400 mt-1">Adjust your search or create a new report.</p>
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
            <div className="animate-in fade-in duration-300 slide-in-from-bottom-2 grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-5 pb-3 border-b border-slate-100">Report Details</h3>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">1. Select a Project <span className="text-rose-500">*</span></label>
                      <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium appearance-none cursor-pointer text-slate-700"
                      >
                        <option value="" disabled>Choose a project...</option>
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Report Name <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        placeholder="Enter report name"
                        value={reportName}
                        onChange={(e) => setReportName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium placeholder:font-normal placeholder:text-slate-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                      <textarea
                        rows={3}
                        placeholder="Brief summary..."
                        value={reportDescription}
                        onChange={(e) => setReportDescription(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium placeholder:font-normal placeholder:text-slate-400 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {selectedProject && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-5 pb-3 border-b border-slate-100">2. Select Template</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {REPORT_TEMPLATES.map((tpl) => (
                        <div
                          key={tpl.id}
                          className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 group flex flex-col ${
                            selectedTemplate === tpl.id
                              ? "border-indigo-500 bg-indigo-50/50 shadow-sm"
                              : "border-slate-200 hover:border-indigo-300 hover:shadow-sm"
                          }`}
                          onClick={() => setSelectedTemplate(tpl.id)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className={`p-2 rounded-lg ${selectedTemplate === tpl.id ? 'bg-indigo-100/50 text-indigo-600' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-500'} transition-colors`}>
                              <Layout size={20} />
                            </div>
                            {selectedTemplate === tpl.id && (
                              <CheckCircle size={20} className="text-indigo-600 bg-white rounded-full absolute top-4 right-4 animate-in zoom-in duration-200" />
                            )}
                          </div>
                          <div>
                            <h4 className={`font-bold transition-colors ${selectedTemplate === tpl.id ? 'text-indigo-900' : 'text-slate-800'}`}>{tpl.name}</h4>
                            <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed line-clamp-2">{tpl.description}</p>
                          </div>
                          <div className="mt-auto pt-3 border-t border-slate-100">
                            <button
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors"
                              onClick={(e) => handleTemplateView(e, tpl)}
                            >
                              <Eye size={14} /> View Sample
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {selectedProject && (
                <div className="lg:col-span-8">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
                      <h3 className="text-lg font-bold text-slate-800">3. Select Files to Include</h3>
                      <div className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {selectedFileIds.size} Selected
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="text"
                          placeholder="Search files..."
                          value={fileSearchTerm}
                          onChange={(e) => setFileSearchTerm(e.target.value)}
                          className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
                        />
                      </div>
                      <div className="relative w-full sm:w-48 group">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" size={18} />
                        <select
                          value={fileFilterDept}
                          onChange={(e) => setFileFilterDept(e.target.value)}
                          className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium appearance-none cursor-pointer"
                        >
                          <option value="all">All Departments</option>
                          {uniqueDepartments.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-1 mb-6 flex-1 overflow-hidden flex flex-col min-h-[400px]">
                      <div className="flex items-center px-4 py-3 bg-slate-100/50 border-b border-slate-200 rounded-t-xl gap-3">
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={filteredAndSearchedFiles.length > 0 && selectedFileIds.size === filteredAndSearchedFiles.length}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        />
                        <label className="text-sm font-semibold text-slate-700 select-none cursor-pointer" onClick={handleSelectAll}>Select All Visible</label>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto w-full">
                        {filteredAndSearchedFiles.length === 0 ? (
                           <div className="flex flex-col items-center justify-center h-full text-slate-500 min-h-[300px]">
                              <FileText className="w-10 h-10 text-slate-300 mb-2" />
                              <p>No project files found matching filters.</p>
                           </div>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {filteredAndSearchedFiles.map((file) => (
                              <label key={file.id} className="flex items-start p-4 hover:bg-white transition-colors cursor-pointer group">
                                <div className="mt-0.5">
                                  <input
                                    type="checkbox"
                                    checked={selectedFileIds.has(file.id)}
                                    onChange={() => handleFileSelection(file.id)}
                                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                  />
                                </div>
                                <div className="ml-3 flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <FileText size={16} className={`${selectedFileIds.has(file.id) ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-500'} transition-colors shrink-0`} />
                                    <span className={`text-sm font-medium block truncate ${selectedFileIds.has(file.id) ? 'text-indigo-900' : 'text-slate-700'}`}>
                                      {file.name}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">{file.department_name || "General"}</span>
                                    <span>•</span>
                                    <span>By <span className="font-medium text-slate-700">{file.faculty_name}</span></span>
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto pt-4 border-t border-slate-100">
                      <div className="flex-1">
                        {generationMessage && (
                          <div className={`text-sm font-medium px-4 py-2 rounded-lg ${
                            generationMessage.type === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}>
                            {generationMessage.text}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={handleGenerateReport}
                        disabled={isGenerating || selectedFileIds.size === 0 || !selectedTemplate}
                        className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2"
                      >
                        {isGenerating ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : <><Layout size={18} /> Generate Analytics Report</>}
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL: PUBLISH OPTIONS --- */}
      {publishModalReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPublishModalReport(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">Report Visibility</h3>
              <button
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-2 rounded-xl transition-colors"
                onClick={() => setPublishModalReport(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-slate-600 font-medium mb-5">
                Choose access level for <strong className="text-slate-800">"{publishModalReport.file_name}"</strong>:
              </p>
              <div className="space-y-3">
                <button
                  className="w-full text-left p-4 rounded-2xl border-2 border-slate-100 hover:border-sky-300 hover:bg-sky-50 transition-all group flex gap-4 items-center focus:outline-none focus:ring-4 focus:ring-sky-500/10"
                  onClick={() => handlePublishAction("shared")}
                >
                  <div className="p-3 bg-sky-100 text-sky-600 rounded-xl group-hover:bg-sky-200 group-hover:text-sky-700 transition-colors">
                    <Users size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg group-hover:text-sky-900 transition-colors">Shared Access</h4>
                    <span className="text-sm text-slate-500 font-medium">Visible to internal faculty & administrators</span>
                  </div>
                </button>
                <button
                  className="w-full text-left p-4 rounded-2xl border-2 border-slate-100 hover:border-emerald-300 hover:bg-emerald-50 transition-all group flex gap-4 items-center focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                  onClick={() => handlePublishAction("public")}
                >
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl group-hover:bg-emerald-200 group-hover:text-emerald-700 transition-colors">
                    <Globe size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg group-hover:text-emerald-900 transition-colors">Public Access</h4>
                    <span className="text-sm text-slate-500 font-medium">Available globally on the public institute website</span>
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setCommentsModalReport(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/80">
              <div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2"><MessageSquare size={22} className="text-indigo-500" /> Report Comments</h3>
                <div className="text-sm font-medium text-slate-500 mt-1">Report: <strong className="text-slate-700">{commentsModalReport.file_name}</strong></div>
              </div>
              <button
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-2 rounded-xl transition-colors"
                onClick={() => setCommentsModalReport(null)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto bg-slate-50">
              {reportComments.length > 0 ? (
                <div className="space-y-4">
                  {reportComments.map((comment) => (
                    <div key={comment.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-bold text-slate-800 block text-[15px]">{comment.user}</span>
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{comment.dept}</span>
                        </div>
                        <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{comment.date}</span>
                      </div>
                      <div className="text-slate-600 leading-relaxed text-[15px] mt-2 bg-slate-50/50 p-3 rounded-xl border border-slate-50">{comment.text}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <MessageSquare className="w-16 h-16 text-slate-200 mb-4" />
                  <h4 className="text-lg font-bold text-slate-700 mb-1">No comments yet</h4>
                  <p className="text-slate-500">There are no comments available for this report.</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end">
              <button className="px-6 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors" onClick={() => setCommentsModalReport(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManagement;