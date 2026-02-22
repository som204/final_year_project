import React, { useState, useEffect, useContext } from "react";
import { 
  FileText, 
  Search, 
  Eye, 
  Calendar,
  Download,
  Loader
} from "lucide-react";
import '../pages/Student/Student.css';
import { UserContext } from '../Context/user.context';
import axios from "axios";
import html2pdf from "html2pdf.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const StudentReports = () => {
  const { user } = useContext(UserContext);

  // State for API Data
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessingId, setIsProcessingId] = useState(null); // Handles loading state for View/Download

  // --- Fetch Reports ---
  useEffect(() => {
    const fetchReports = async () => {
      if (!user?.institute_id) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/reports/institute/${user.institute_id}`, { 
          credentials: 'include' 
        });

        if (!response.ok) throw new Error("Failed to fetch reports");
        
        const reportsData = await response.json();
        console.log("Fetched reports:", reportsData);
        setReports(reportsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [user?.institute_id]);

  // --- Filter Logic ---
  // Students only see reports marked with visibility 'public'
  const filteredReports = reports.filter(r => 
    r.share === 'public' && 
    (r.file_name || r.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Handlers ---
  const handleViewPdf = async (reportId) => {
    setIsProcessingId(`view-${reportId}`);
    try {
      const res = await axios.get(`http://localhost:8000/reports/${reportId}`, {
        withCredentials: true,
        headers: { Accept: "application/json" },
      });

      const html = res.data.html_report;
      if (html) {
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        return;
      }
      throw new Error("No viewable report content returned from server.");
    } catch (err) {
      alert("Error opening report: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsProcessingId(null);
    }
  };


  const handleDownloadReport = async (report) => {
    setIsProcessingId(`download-${report.id}`);

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
      alert("Error downloading report: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsProcessingId(null);
    }
  };

  return (
    <div className="student-layout">
      <div className="student-content">
        
        <div className="page-header">
          <h1>Institute Reports</h1>
          <p>Access and download official documents released by the institute.</p>
        </div>

        {/* SEARCH */}
        <div className="list-controls">
          <div className="search-bar">
            <Search size={20} color="#64748b" />
            <input 
              type="text" 
              placeholder="Search reports..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Loading / Error States */}
        {isLoading ? (
          <div style={{display: 'flex', alignItems: 'center', gap: 10, color: '#64748b', padding: '2rem'}}>
            <Loader className="spinner" size={24} /> Fetching institute reports...
          </div>
        ) : error ? (
          <div className="form-message error" style={{color: 'red', marginBottom: '1rem'}}>{error}</div>
        ) : (
          /* REPORTS GRID */
          <div className="student-reports-grid">
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <div key={report.id} className="student-report-card">
                  <div className="report-header">
                    <div className="icon-wrapper active">
                      <FileText size={28} />
                    </div>
                    {/* Public Badge */}
                    <span className="contribution-badge" style={{background:'#dcfce7', color:'#16a34a', border:'none', textTransform: 'capitalize'}}>
                      {report.visibility || 'Public'}
                    </span>
                  </div>
                  
                  <div className="report-body">
                    <h3>{report.file_name || report.title || `Report #${report.id}`}</h3>
                    <p className="report-desc">{report.report_desc || report.description || "No description provided for this report."}</p>
                    <div className="report-meta">
                      <Calendar size={14} /> {report.created_at ? new Date(report.created_at).toLocaleDateString() : "Date unavailable"}
                    </div>
                  </div>

                  <div className="report-footer">
                    <button 
                      className="action-btn view" 
                      onClick={() => handleViewPdf(report.id)}
                      disabled={isProcessingId === `view-${report.id}`}
                    >
                      {isProcessingId === `view-${report.id}` ? <Loader className="spinner" size={16} /> : <Eye size={16} />}
                      View
                    </button>
                    
                    <button 
                      className="action-btn view" 
                      onClick={() => handleDownloadReport(report)}
                      disabled={isProcessingId === `download-${report.id}`}
                    >
                      {isProcessingId === `download-${report.id}` ? <Loader className="spinner" size={16} /> : <Download size={16} />} 
                      Download
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#64748b', gridColumn: '1 / -1' }}>No public reports found at this time.</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentReports;