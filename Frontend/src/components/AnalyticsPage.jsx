// src/pages/AnalyticsPageDynamicUI.jsx
import React, { useEffect, useState, useContext, useMemo } from "react";
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

import "../pages/Admin/InstituteAdmin.css"; 

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
    <div className="summary-bar" style={{ alignItems: "center" }}>
      <div className="summary-left" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <h2 className="page-title">{title ?? metadata.report_name ?? "Report Analytics"}</h2>
        <div className="page-subtitle">
           {metadata.institute_id ? `Institute ID: ${metadata.institute_id}` : ""} 
           {metadata.report_type ? ` • ${metadata.report_type}` : ""}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="summary-stats" style={{ display: "flex", gap: 12 }}>
          {items.map((it, i) => (
            <div key={i} className="summary-stat">
              <div className="summary-stat-value">{safe(it.value, "-")}</div>
              <div className="summary-stat-label">{it.label}</div>
            </div>
          ))}
          <div className="summary-stat small">
            <div className="summary-stat-value">{formatTS(time)}</div>
            <div className="summary-stat-label">Generated</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: 8 }}>
          <button title="Refresh" onClick={onRefresh} className="button" style={{ padding: "8px 10px" }}>
            <RefreshCw size={16} />
          </button>
          <button title="Download JSON" onClick={onDownloadJson} className="button" style={{ padding: "8px 10px" }}>
            <Download size={16} />
          </button>
          <button title="Copy metadata" onClick={onCopyMeta} className="button" style={{ padding: "8px 10px" }}>
            <Copy size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const KPIGrid = ({ kpis = [], collapsed = false }) => {
  if (collapsed || !kpis || !kpis.length) return null;
  return (
    <div className="kpi-grid" style={{ marginBottom: 16 }}>
      {kpis.map((k, idx) => {
        const label = k.metric ?? k.label ?? k.name ?? "KPI";
        const value = k.value ?? k.val ?? "-";
        return (
          <div className="ia-stat-card kpi-card" key={idx}>
            <div className={`ia-stat-card-icon ${mapCategoryToIconClass(k.category)}`}>{k.icon ?? "📊"}</div>
            <div className="ia-stat-card-info">
              <p className="kpi-label">{label}</p>
              <div className="kpi-value">{String(value)}</div>
              {k.trend && <div className="kpi-trend">{String(k.trend)}</div>}
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
    <div className="ia-recent-activity table-panel" style={{ marginTop: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 className="table-title">{table.title ?? "Table"}</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="button" title="Download CSV" onClick={onDownload}><FileText size={16} /></button>
        </div>
      </div>
      <div className="table-wrap">
        <table className="ia-data-table">
          <thead>
            <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {pageRows.map((r, ri) => <tr key={ri}>{r.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
      {pageCount > 1 && (
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <button className="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
          <div style={{ alignSelf: "center" }}>{page} / {pageCount}</div>
          <button className="button" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page === pageCount}>Next</button>
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
    <div className="ia-recent-activity" style={{ marginTop: 18, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <AlignLeft size={18} className="icon-blue" />
            <h3 className="table-title" style={{ margin: 0 }}>{section.title || "Section"}</h3>
        </div>
        <div style={{ lineHeight: 1.6, color: "#334155", whiteSpace: "pre-wrap" }}>
            {isLong && !expanded ? `${content.substring(0, 300)}...` : content}
        </div>
        {isLong && (
            <button 
                onClick={() => setExpanded(!expanded)} 
                style={{ marginTop: 8, background: "none", border: "none", color: "#3b82f6", cursor: "pointer", padding: 0, fontSize: 13 }}
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
    <div style={{
      position: "fixed", inset: 0, background: "rgba(3,7,18,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
    }}>
      <div style={{ width: "90%", maxWidth: 900, background: "#fff", borderRadius: 12, padding: 18, boxShadow: "0 10px 30px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="button" onClick={onClose}>Close</button>
          </div>
        </div>
        <div style={{ maxHeight: "70vh", overflow: "auto" }}>{children}</div>
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
  const API_BASE_URL = "http://localhost:8000"; 

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
    if (loading) return <div className="info-card"><div className="spinner" /> Loading report data...</div>;
    if (error) return <div className="info-card error"><AlertCircle className="icon" /> {error}</div>;
    
    if (!report) {
      return (
        <div className="info-card empty-state">
          <BarChart3 className="info-card-icon" />
          <h3 className="info-card-title">No Report Selected</h3>
          <p className="info-card-subtitle">Please select a report from the dropdown.</p>
        </div>
      );
    }

    if ((!kpis.length) && (!charts.length) && (!tables.length) && (!sections.length)) {
      return (
        <div className="info-card empty-state">
          <AlertCircle className="info-card-icon" />
          <h3 className="info-card-title">Empty Data</h3>
          <p className="info-card-subtitle">The selected report contains no analytics data.</p>
        </div>
      );
    }

    return (
      <>
        {/* Toolbar */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
            <input type="checkbox" checked={kpiCollapsed} onChange={() => setKpiCollapsed(v => !v)} />
            <span>Hide KPIs</span>
          </label>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", minWidth: 240 }}
            />
            <button className="button" title="Refresh Data" onClick={handleRefresh}><RefreshCw size={16} /></button>
            <button className="button" title="Download JSON" onClick={handleDownloadJSON}><Download size={16} /></button>
          </div>
        </div>

        {/* Content */}
        <KPIGrid kpis={kpis} collapsed={kpiCollapsed} />

        {/* Sections: Executive Summary first */}
        {/* {filteredSections.length > 0 && (
            <div style={{ marginBottom: 20 }}>
                {filteredSections.filter(s => s.title === "Executive Summary").map((s, i) => (
                    <ReportSection key={`exec-${i}`} section={s} />
                ))}
            </div>
        )} */}

        {/* Charts Grid */}
        {filteredCharts.length > 0 && (
          <div className="analytics-grid improved-grid" style={{ marginBottom: 12 }}>
            {filteredCharts.map((c, i) => (
              <div key={i} className="chart-widget card-elevated" style={{ position: "relative" }}>
                <div className="widget-header">
                  <div className="chart-icon">{pickIconForChart(c.title)}</div>
                  <div className="widget-title-wrap">
                    <h4 className="widget-title">{c.title ?? `Chart ${i + 1}`}</h4>
                    {c.topic && <div className="widget-subtitle">{c.topic}</div>}
                  </div>
                </div>
                <div className="chart-area">
                  <DynamicChart chartObj={c} />
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8, justifyContent: "flex-end" }}>
                  <button className="button" onClick={() => openDrilldown(c)} title="View Details">Drill down</button>
                  <button className="button" onClick={() => downloadChartDatasetCSV(c)} title="Download CSV"><FileText size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tables */}
        {filteredTables.map((t, i) => <ReportTable key={i} table={t} />)}

        {/* Other Sections */}
        {/* {filteredSections.filter(s => s.title !== "Executive Summary").map((s, i) => (
             <ReportSection key={`sec-${i}`} section={s} />
        ))} */}

        {/* Drilldown Modal */}
        <Modal open={drilldown.open} onClose={closeDrilldown} title={drilldown.chart?.title ?? "Chart details"}>
          {drilldown.meta ? (
            <div>
              <p style={{ color: "#555", marginBottom: 12 }}>{drilldown.chart?.topic}</p>
              
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ marginBottom: 8 }}>Preview</h4>
                <div style={{ minHeight: 240 }}><DynamicChart chartObj={drilldown.chart} /></div>
              </div>

              <div>
                <h4 style={{ marginBottom: 8 }}>Raw Data</h4>
                <div style={{ overflowX: "auto", border: "1px solid #eee", borderRadius: 8 }}>
                  <table className="ia-data-table" style={{ minWidth: 600, margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Label</th>
                        {drilldown.meta.data.datasets.map((ds, idx) => <th key={idx}>{ds.label}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const labels = drilldown.meta.data.labels ?? [];
                        const dsList = drilldown.meta.data.datasets;
                        const rows = [];
                        const maxLen = Math.max(labels.length, ...dsList.map(ds => ds.data.length));
                        for (let r = 0; r < maxLen; r++) {
                          rows.push(
                            <tr key={r}>
                              <td>{labels[r] ?? ""}</td>
                              {dsList.map((ds, ci) => <td key={ci}>{safe(ds.data[r], "")}</td>)}
                            </tr>
                          );
                        }
                        return rows;
                      })()}
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: 12 }}>
                  <button className="button" onClick={() => downloadChartDatasetCSV(drilldown.chart)}>Download CSV</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="info-card">No data preview available</div>
          )}
        </Modal>
      </>
    );
  };

  return (
    <div className="analytics-page ui-refined">
      <h1 className="analytics-title">Report Analytics Dashboard</h1>

      {/* Report Selector */}
      <div style={{ margin: "12px 0 18px 0", display: "flex", gap: 12, alignItems: "center" }}>
        <label style={{ fontWeight: 600, color: "#334155" }}>Select Report:</label>
        <select
          value={selectedReportKey}
          onChange={handleSelectReport}
          className="project-selector"
          style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", minWidth: 320 }}
          disabled={loading && !reportsList.length}
        >
          {reportsList.length === 0 && <option value="">{loading ? "Loading..." : "No reports found"}</option>}
          {reportsList.map(r => <option key={r.key} value={r.key}>{r.title}</option>)}
        </select>
      </div>

      <SummaryBar
        metadata={metadata}
        title={finalData.title}
        onRefresh={handleRefresh}
        onDownloadJson={handleDownloadJSON}
        onCopyMeta={handleCopyMeta}
        time={finalData.metadata?.generated_at}
      />

      <div className="page-content">
        <div className="selector-row">
          <div className="selector-left">
            <div className="widget-header small">
              <FolderKanban className="widget-icon" />
              <div>
                <div className="widget-title-small">Report</div>
                <div className="widget-subtitle-small">
                    {finalData.title || finalData.report_name || "Report Details"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default AnalyticsPage;