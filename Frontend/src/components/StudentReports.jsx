import React, { useState, useEffect, useContext } from "react";
import { 
  FileText, 
  Search, 
  Eye, 
  Calendar,
  Download,
  Loader
} from "lucide-react";

import { UserContext } from '../Context/user.context';
import { API_BASE_URL } from '../config';
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
        const response = await fetch(`${API_BASE_URL}/reports/institute/${user.institute_id}`, { 
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
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
      }

      const resData = await response.json();
      const html = resData.html_report;
      if (html) {
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        return;
      }
      throw new Error("No viewable report content returned from server.");
    } catch (err) {
      alert("Error opening report: " + err.message);
    } finally {
      setIsProcessingId(null);
    }
  };


  const handleDownloadReport = async (report) => {
    setIsProcessingId(`download-${report.id}`);

    try {
      const response = await fetch(`${API_BASE_URL}/reports/${report.id}`, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
      }

      const resData = await response.json();
      const html = resData.html_report;

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
      alert("Error downloading report: " + err.message);
    } finally {
      setIsProcessingId(null);
    }
  };

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <header className="mb-8 md:mb-10 animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Institute Reports</h1>
            <p className="text-slate-500 mt-2 font-medium">Access and download official documents released by the institute.</p>
          </div>

          {/* SEARCH */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search reports..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium placeholder:font-normal placeholder:text-slate-400"
            />
          </div>
        </header>

        {/* Loading / Error States */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-slate-100 shadow-sm animate-in fade-in duration-500">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Fetching institute reports...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 px-6 py-4 rounded-xl font-medium shadow-sm flex items-start gap-3">
             <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             {error}
          </div>
        ) : (
          /* REPORTS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <div key={report.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-100 transition-all duration-300 overflow-hidden flex flex-col group hover:-translate-y-1">
                  
                  <div className="p-6 flex-1 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                        <FileText size={24} />
                      </div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                        {report.visibility || 'Public'}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-2 mb-2" title={report.file_name || report.title || `Report #${report.id}`}>
                        {report.file_name || report.title || `Report #${report.id}`}
                      </h3>
                      <p className="text-slate-500 text-sm font-medium line-clamp-3 leading-relaxed">
                        {report.report_desc || report.description || "No description provided for this report."}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                      <Calendar size={14} className="text-slate-400" /> 
                      {report.created_at ? new Date(report.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "Date unavailable"}
                    </div>
                  </div>
                  
                  <div className="px-6 pb-6 pt-2 bg-slate-50/50 flex gap-3">
                    <button 
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-50 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-100 transition-colors focus:ring-2 focus:ring-indigo-200 outline-none disabled:opacity-50" 
                      onClick={() => handleViewPdf(report.id)}
                      disabled={isProcessingId === `view-${report.id}`}
                    >
                      {isProcessingId === `view-${report.id}` ? <Loader className="animate-spin" size={18} /> : <Eye size={18} />}
                      View
                    </button>
                    
                    <button 
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors focus:ring-2 focus:ring-slate-200 outline-none disabled:opacity-50" 
                      onClick={() => handleDownloadReport(report)}
                      disabled={isProcessingId === `download-${report.id}`}
                    >
                      {isProcessingId === `download-${report.id}` ? <Loader className="animate-spin" size={18} /> : <Download size={18} />} 
                      Download
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <FileText className="mx-auto mb-4 text-slate-200 w-12 h-12" />
                <p className="font-medium text-lg text-slate-400">No public reports found at this time.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentReports;