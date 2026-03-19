// src/pages/AnalyticsPageDynamicUI.jsx
import React, { useState, useEffect, useMemo, useRef, useContext } from "react";
import { API_BASE_URL } from "../config";
import { UserContext } from "../Context/user.context";
import { Bar, Pie, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { 
  FolderKanban, 
  BarChart3, 
  AlertCircle, 
  DollarSign, 
  Briefcase, 
  GraduationCap, 
  RefreshCw, 
  Download, 
  FileText, 
  Copy,
  AlignLeft
} from "lucide-react";

 

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement
);

/* =========================================================
   HELPER FUNCTIONS 
   ========================================================= */

const DEFAULT_PALETTE = ["#0A2540", "#00C49A", "#4A90E2", "#F5A623", "#6c757d", "#ef4444", "#3b82f6", "#8b5cf6"];
const safe = (v, fallback = null) => (v === undefined ? fallback : v);

const normalizeChartForChartJs = (chartObj) => {
  if (!chartObj || !chartObj.data) return null;
  
  let type = String(chartObj.type || "bar").toLowerCase();
  let isStacked = false;
  
  if (type === "stacked_bar") {
    type = "bar";
    isStacked = true;
  }

  const labels = chartObj.data.labels ?? [];
  const datasetsRaw = chartObj.data.datasets ?? [];
  
  const datasets = datasetsRaw.map((ds, i) => {
    const bg = ds.backgroundColor ?? DEFAULT_PALETTE[i % DEFAULT_PALETTE.length];
    return {
      label: ds.label ?? `Series ${i + 1}`,
      data: Array.isArray(ds.data) ? ds.data : [],
      backgroundColor: bg,
      borderColor: typeof bg === "string" ? bg : undefined,
      fill: false,
    };
  });

  return { type, isStacked, data: { labels, datasets } };
};

const formatTS = (iso) => {
  if (!iso) return "-";
  try { return new Date(iso).toLocaleString(); } catch { return String(iso); }
};

const downloadJSON = (obj, filename = "report.json") => {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const tableToCSV = (headers = [], rows = []) => {
  const escapeCell = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(",")].concat(rows.map((r) => r.map(escapeCell).join(","))).join("\n");
  return csv;
};

const downloadCSV = (csv, filename = "data.csv") => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const copyToClipboard = async (text) => {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    document.body.removeChild(ta);
    return true;
  } catch {
    document.body.removeChild(ta);
    return false;
  }
};

function pickIconForChart(title = "") {
  const t = (title || "").toLowerCase();
  if (t.includes("revenue") || t.includes("income") || t.includes("financial")) return <DollarSign className="icon-yellow" />;
  if (t.includes("placement") || t.includes("ctc")) return <Briefcase className="icon-blue" />;
  if (t.includes("student") || t.includes("enrollment")) return <GraduationCap className="icon-green" />;
  return <BarChart3 className="icon-default" />;
}

function mapCategoryToIconClass(category = "") {
  const c = (category || "").toLowerCase();
  if (c.includes("academic")) return "departments";
  if (c.includes("financial")) return "files";
  if (c.includes("research")) return "projects";
  if (c.includes("placement")) return "faculty";
  if (c.includes("infrastructure")) return "reports";
  return "faculty";
}

/* =========================================================
   UI SUB-COMPONENTS
   ========================================================= */

const SummaryBar = ({ metadata = {}, title, onRefresh, onDownloadJson, onCopyMeta, time}) => {
  const items = [
    { label: "Charts", value: metadata.total_charts },
    { label: "Tables", value: metadata.total_tables },
    { label: "KPIs", value: metadata.total_kpis },
    { label: "Files", value: metadata.files_processed },
  ];
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title ?? metadata.report_name ?? "Report Analytics"}</h2>
        <div className="text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1 w-fit rounded-lg border border-slate-100 hidden sm:block">
           {metadata.institute_id ? `Institute: ${metadata.institute_id}` : ""} 
           {metadata.report_type ? ` • ${metadata.report_type}` : ""}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="flex gap-4 sm:gap-6 bg-slate-50 px-5 py-3 rounded-xl border border-slate-100">
          {items.map((it, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="text-xl font-bold text-indigo-600">{safe(it.value, "-")}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{it.label}</div>
            </div>
          ))}
          <div className="w-px bg-slate-200"></div>
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-sm font-semibold text-slate-700">{formatTS(time).split(',')[0]}</div>
            <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">Generated</div>
          </div>
        </div>

        <div className="flex gap-2">
          <button title="Refresh" onClick={onRefresh} className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
            <RefreshCw size={18} />
          </button>
          <button title="Download JSON" onClick={onDownloadJson} className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
            <Download size={18} />
          </button>
          <button title="Copy metadata" onClick={onCopyMeta} className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
            <Copy size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const KPIGrid = ({ kpis = [], collapsed = false }) => {
  if (collapsed || !kpis || !kpis.length) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-2">
      {kpis.map((k, idx) => {
        const label = k.metric ?? k.label ?? k.name ?? "KPI";
        const value = k.value ?? k.val ?? "-";
        
        // Map category to a specific color profile
        let bgColor = "bg-indigo-100", textColor = "text-indigo-600";
        if (k.category?.toLowerCase?.().includes("financial")) { bgColor = "bg-emerald-100"; textColor = "text-emerald-600"; }
        else if (k.category?.toLowerCase?.().includes("student")) { bgColor = "bg-blue-100"; textColor = "text-blue-600"; }
        else if (k.category?.toLowerCase?.().includes("faculty")) { bgColor = "bg-violet-100"; textColor = "text-violet-600"; }

        return (
          <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between hover:shadow-md hover:border-indigo-100 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${bgColor} ${textColor} group-hover:scale-110 transition-transform`}>
                {k.icon ?? <BarChart3 size={24} />}
              </div>
              {k.trend && (
                <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${String(k.trend).includes('-') || String(k.trend).toLowerCase().includes('down') ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {String(k.trend)}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-1 line-clamp-1" title={label}>{label}</p>
              <div className="text-3xl font-black text-slate-800 tracking-tight">{String(value)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DynamicChart = ({ chartObj }) => {
  const normalized = normalizeChartForChartJs(chartObj);
  if (!normalized) return null;

  const commonOpts = { 
    responsive: true, 
    maintainAspectRatio: false, 
    plugins: { legend: { position: "bottom" } },
    scales: normalized.isStacked ? { x: { stacked: true }, y: { stacked: true } } : undefined
  };

  const wrapStyle = { minHeight: 260 };

  if (normalized.type === "bar") return <div style={wrapStyle}><Bar data={normalized.data} options={commonOpts} /></div>;
  if (normalized.type === "line") return <div style={wrapStyle}><Line data={normalized.data} options={commonOpts} /></div>;
  if (normalized.type === "pie") return <div style={wrapStyle}><Pie data={normalized.data} options={commonOpts} /></div>;
  if (normalized.type === "doughnut" || normalized.type === "donut") return <div style={wrapStyle}><Doughnut data={normalized.data} options={commonOpts} /></div>;
  if (normalized.type === "stacked_bar") return <div style={wrapStyle}><Bar data={normalized.data} options={commonOpts} /></div>;
  if (normalized.type === "stacked_line") return <div style={wrapStyle}><Line data={normalized.data} options={commonOpts} /></div>;
  if (normalized.type === "histogram") return <div style={wrapStyle}><Bar data={normalized.data} options={commonOpts} /></div>;

  return <div className="info-card"><AlertCircle className="icon" /> Unsupported chart type: {String(chartObj.type)}</div>;
};

const ReportTable = ({ table, pageSize = 5 }) => {
  if (!table || !table.data) return null;
  const headers = table.data.headers ?? table.data.columns ?? [];
  const rows = table.data.rows ?? table.data.values ?? [];
  
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  const onDownload = () => {
    const csv = tableToCSV(headers, rows);
    downloadCSV(csv, `${(table.title || "table").replace(/\s+/g, "_")}.csv`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <AlignLeft size={20} className="text-indigo-500" />
          {table.title ?? "Data Table"}
        </h3>
        <div className="flex gap-2">
          <button 
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm" 
            title="Download CSV" 
            onClick={onDownload}
          >
            <FileText size={16} /> <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50/80">
              {headers.map((h, i) => (
                <th key={i} className="py-4 px-6 text-slate-500 font-semibold text-sm border-b border-slate-100">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {pageRows.map((r, ri) => (
              <tr key={ri} className="hover:bg-slate-50/50 transition-colors">
                {r.map((cell, ci) => (
                  <td key={ci} className="py-3 px-6 text-slate-600 font-medium">{cell}</td>
                ))}
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={headers.length || 1} className="py-8 text-center text-slate-400 font-medium">No data rows</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pageCount > 1 && (
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-500">
            Page {page} of {pageCount}
          </span>
          <div className="flex gap-2">
            <button 
              className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors disabled:opacity-50 disabled:hover:text-slate-600 disabled:hover:border-slate-200 shadow-sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))} 
              disabled={page === 1}
            >
              Prev
            </button>
            <button 
              className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors disabled:opacity-50 disabled:hover:text-slate-600 disabled:hover:border-slate-200 shadow-sm"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))} 
              disabled={page === pageCount}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ReportSection = ({ section }) => {
  const [expanded, setExpanded] = useState(false);
  if (!section) return null;
  const content = section.content || "";
  const isLong = content.length > 300;
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8 mt-4">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <AlignLeft size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">{section.title || "Section"}</h3>
        </div>
        <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed font-medium">
            {isLong && !expanded ? `${content.substring(0, 300)}...` : content}
        </div>
        {isLong && (
            <button 
                onClick={() => setExpanded(!expanded)} 
                className="mt-4 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors focus:outline-none"
            >
                {expanded ? "Show Less" : "Read More"}
            </button>
        )}
    </div>
  );
};

const Modal = ({ open, onClose, title, children }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h3>
          <button
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-2 rounded-xl transition-colors focus:outline-none"
            onClick={onClose}
          >
            <AlertCircle size={20} className="hidden" />
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto bg-slate-50/30 flex-1">{children}</div>
      </div>
    </div>
  );
};

/* =========================================================
   MAIN PAGE COMPONENT
   ========================================================= */

const AnalyticsPage = () => {
  const { user, token } = useContext(UserContext);
  
  // --- Configuration ---

  // --- State ---
  const [report, setReport] = useState(null); 
  const [reportsList, setReportsList] = useState([]); 
  const [selectedReportKey, setSelectedReportKey] = useState(""); 
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // UI controls
  const [kpiCollapsed, setKpiCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [drilldown, setDrilldown] = useState({ open: false, chart: null, meta: null });
  
  // Helper for headers
  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  // 1. Fetch List of Reports on Mount
  useEffect(() => {
    const fetchReportList = async () => {
      if (!user || !user.institute_id) return;

      try {
        const response = await fetch(`${API_BASE_URL}/reports/institute/${user.institute_id}`, {
          headers: getAuthHeaders(),
        });

        if (!response.ok) throw new Error("Failed to fetch report list");
        
        const rawData = await response.json();
        const dataArray = Array.isArray(rawData) ? rawData : (rawData.data || []);

        // Map to standardized structure
        const mapped = dataArray.map((r) => ({
          key: String(r.id), 
          title: r.file_name || `Report ${r.id}`,
          id: r.id
        }));

        setReportsList(mapped);

        // Auto-select first report if none selected
        if (mapped.length > 0 && !selectedReportKey) {
          setSelectedReportKey(mapped[0].key);
        }
      } catch (err) {
        console.error("Error fetching list:", err);
        setError("Could not load report list.");
      }
    };

    fetchReportList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); 

  // 2. Fetch Report Details when Selection Changes
  useEffect(() => {
    if (!selectedReportKey) return;

    const fetchReportDetails = async () => {
      setLoading(true);
      setError(null);
      setReport(null); 

      try {
        const response = await fetch(`${API_BASE_URL}/reports/${selectedReportKey}`, {
          headers: getAuthHeaders(),
        });
        
        if (!response.ok) throw new Error("Failed to fetch report details");
        
        const data = await response.json();
        setReport(data);
        // console.log("Fetched report data:", data);
      } catch (err) {
        console.error("Error fetching report:", err);
        setError(err.message || "Failed to load report data.");
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReportKey]);


  // --- Data Processing (Filtered via useMemo, NOT useState to fix Loop) ---
  
  const finalData = report?.final_report_data || {};
  const metadata = report?.metadata || {};
  const kpis = finalData.kpis || [];
  const charts = finalData.charts || [];
  const tables = finalData.tables || [];
  const sections = finalData.sections || [];

  // console.log(finalData);
  // console.log(metadata,kpis,charts,tables,sections);

  // Calculate filtered views directly
  const filteredCharts = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return charts;
    return charts.filter(c => 
      (c.title || "").toLowerCase().includes(q) || 
      (c.topic || "").toLowerCase().includes(q) || 
      JSON.stringify(c.data || "").toLowerCase().includes(q)
    );
  }, [search, charts]);

  const filteredTables = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return tables;
    return tables.filter(t => 
      (t.title || "").toLowerCase().includes(q) || 
      JSON.stringify(t.data || "").toLowerCase().includes(q)
    );
  }, [search, tables]);

  const filteredSections = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return sections;
    return sections.filter(s => 
      (s.title || "").toLowerCase().includes(q) || 
      (s.content || "").toLowerCase().includes(q)
    );
  }, [search, sections]);


  // --- Handlers ---

  const handleSelectReport = (e) => {
    setSelectedReportKey(e.target.value);
  };

  const handleRefresh = () => {
    const current = selectedReportKey;
    setSelectedReportKey("");
    setTimeout(() => setSelectedReportKey(current), 0);
  };

  const handleDownloadJSON = () => {
    if (!report) return;
    const fileName = (metadata?.report_name || "report").replace(/\s+/g, "_") + ".json";
    downloadJSON(report, fileName);
  };

  const handleCopyMeta = async () => {
    await copyToClipboard(JSON.stringify(metadata, null, 2));
  };

  const openDrilldown = (chartObj) => {
    setDrilldown({ open: true, chart: chartObj, meta: normalizeChartForChartJs(chartObj) });
  };
  
  const closeDrilldown = () => setDrilldown({ open: false, chart: null, meta: null });

  const downloadChartDatasetCSV = (chartObj) => {
    const meta = normalizeChartForChartJs(chartObj);
    if (!meta) return;
    const labels = meta.data.labels ?? [];
    const headers = ["label", ...meta.data.datasets.map(ds => ds.label || "series")];
    const rows = [];
    const rowCount = Math.max(...meta.data.datasets.map(ds => ds.data.length), labels.length);
    for (let i = 0; i < rowCount; i++) {
      const row = [labels[i] ?? ""];
      for (let ds of meta.data.datasets) {
        row.push(ds.data[i] ?? "");
      }
      rows.push(row);
    }
    const csv = tableToCSV(headers, rows);
    downloadCSV(csv, `${(chartObj.title || "chart").replace(/\s+/g, "_")}.csv`);
  };


  // --- Render Content ---
  const renderContent = () => {
    if (loading) return (
      <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl shadow-sm border border-slate-100 mt-6">
        <div className="animate-spin text-indigo-500 mb-4 inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full" />
        <span className="text-lg font-bold text-slate-700">Loading comprehensive analytics...</span>
      </div>
    );
    if (error) return (
      <div className="bg-rose-50 text-rose-600 p-6 rounded-2xl border border-rose-200 font-medium mt-6 flex flex-col items-center justify-center">
        <AlertCircle className="mb-3 w-10 h-10 text-rose-400" />
        <span className="text-lg">{error}</span>
      </div>
    );
    
    if (!report) {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 flex flex-col items-center justify-center text-center mt-6 h-[400px]">
          <BarChart3 className="w-20 h-20 text-indigo-100 mb-6" />
          <h3 className="text-2xl font-bold text-slate-800 mb-2">No Report Selected</h3>
          <p className="text-slate-500 font-medium max-w-md">Please select a report from the dropdown above to view its detailed analytics dashboard.</p>
        </div>
      );
    }

    if ((!kpis.length) && (!charts.length) && (!tables.length) && (!sections.length)) {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 flex flex-col items-center justify-center text-center mt-6 h-[400px]">
          <AlertCircle className="w-20 h-20 text-slate-200 mb-6" />
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Empty Data</h3>
          <p className="text-slate-500 font-medium max-w-md">The selected report contains no specific analytics data nodes.</p>
        </div>
      );
    }

    return (
      <div className="animate-in fade-in duration-500 pt-2">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pt-4 border-t border-slate-200/60">
          <label className="flex items-center gap-3 cursor-pointer user-select-none group text-slate-600 font-semibold hover:text-indigo-600 transition-colors">
            <div className="relative flex items-center justify-center">
              <input type="checkbox" checked={kpiCollapsed} onChange={() => setKpiCollapsed(v => !v)} className="peer sr-only" />
              <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </div>
            <span>Hide KPI Summary</span>
          </label>

          <div className="flex flex-wrap gap-3">
            <input
              placeholder="Search charts & tables..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium sm:w-64 shadow-sm"
            />
          </div>
        </div>

        {/* Content */}
        <KPIGrid kpis={kpis} collapsed={kpiCollapsed} />

        {/* Sections: Executive Summary */}
        {filteredSections.length > 0 && (
          <div className="mb-8">
            {filteredSections.filter(s => s.title === "Executive Summary").map((s, i) => (
                <ReportSection key={`exec-${i}`} section={s} />
            ))}
          </div>
        )}

        {/* Charts Grid */}
        {filteredCharts.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {filteredCharts.map((c, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col group hover:shadow-md hover:border-indigo-100 transition-all">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex gap-4 items-center">
                  <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-indigo-500 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                    {pickIconForChart(c.title)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 text-lg tracking-tight">{c.title ?? `Chart ${i + 1}`}</h4>
                    {c.topic && <div className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wide">{c.topic}</div>}
                  </div>
                </div>
                <div className="p-6 bg-white min-h-[300px] flex-1">
                  <DynamicChart chartObj={c} />
                </div>
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" onClick={() => openDrilldown(c)} title="View full details and raw data">
                    <BarChart3 size={16} /> Drill down
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-sm font-bold text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" onClick={() => downloadChartDatasetCSV(c)} title="Download underlying data as CSV">
                    <Download size={16} /> Export
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tables */}
        {filteredTables.map((t, i) => <ReportTable key={i} table={t} />)}

        {/* Other Sections */}
        {filteredSections.filter(s => s.title !== "Executive Summary").map((s, i) => (
             <ReportSection key={`sec-${i}`} section={s} />
        ))}

        {/* Drilldown Modal */}
        <Modal open={drilldown.open} onClose={closeDrilldown} title={drilldown.chart?.title ?? "Chart Analysis"}>
          {drilldown.meta ? (
            <div className="flex flex-col gap-8 pb-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-2">Subject Area</div>
                <p className="text-slate-700 font-medium text-lg leading-relaxed">{drilldown.chart?.topic || "General Analysis"}</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                  <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2"><BarChart3 size={20} className="text-indigo-500" /> Visualization</h4>
                </div>
                <div className="min-h-[350px]"><DynamicChart chartObj={drilldown.chart} /></div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                  <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2"><AlignLeft size={20} className="text-indigo-500" /> Source Data</h4>
                  <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-sm font-bold text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm focus:outline-none" onClick={() => downloadChartDatasetCSV(drilldown.chart)}>
                    <Download size={16} /> Download CSV
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-100/80">
                        <th className="py-3 px-5 text-slate-600 font-bold text-sm border-b border-slate-200">Category / Label</th>
                        {drilldown.meta.data.datasets.map((ds, idx) => (
                          <th key={idx} className="py-3 px-5 text-slate-600 font-bold text-sm border-b border-slate-200">{ds.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {(() => {
                        const labels = drilldown.meta.data.labels ?? [];
                        const dsList = drilldown.meta.data.datasets;
                        const rows = [];
                        const maxLen = Math.max(labels.length, ...dsList.map(ds => ds.data.length));
                        for (let r = 0; r < maxLen; r++) {
                          rows.push(
                            <tr key={r} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-5 font-semibold text-slate-700">{labels[r] ?? ""}</td>
                              {dsList.map((ds, ci) => <td key={ci} className="py-3 px-5 text-slate-600 font-medium">{safe(ds.data[r], "")}</td>)}
                            </tr>
                          );
                        }
                        return rows;
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center text-slate-500 font-medium text-lg">No extended data preview available for this node.</div>
          )}
        </Modal>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Report Analytics Dashboard</h1>
          <p className="text-slate-500 mt-2 font-medium">Deep dive into institutional data and generated metric insights</p>
        </header>

        {/* Report Selector Header Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Target Data Source</label>
            <div className="relative max-w-lg">
              <FolderKanban className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select
                value={selectedReportKey}
                onChange={handleSelectReport}
                className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-800 appearance-none cursor-pointer"
                disabled={loading && !reportsList.length}
              >
                {reportsList.length === 0 && <option value="">{loading ? "Loading reports..." : "No reports found"}</option>}
                {reportsList.map(r => <option key={r.key} value={r.key}>{r.title}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>
          </div>
        </div>

        <SummaryBar
          metadata={metadata}
          title={finalData.title}
          onRefresh={handleRefresh}
          onDownloadJson={handleDownloadJSON}
          onCopyMeta={handleCopyMeta}
          time={finalData.metadata?.generated_at}
        />

        <div className="animate-in slide-in-from-bottom-2 duration-500">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;