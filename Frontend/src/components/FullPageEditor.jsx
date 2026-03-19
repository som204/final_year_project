import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../config";

import {
  X, Save, Loader2, Bold, Italic, Strikethrough,
  Underline as UnderlineIcon, List, ListOrdered, Minus,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Highlighter, Undo, Redo, Type, Link as LinkIcon,
  Image as ImageIcon, ZoomIn, ZoomOut, RotateCcw,
  Eye, EyeOff, ChevronDown, Search, Download,
  Printer, Copy, Scissors, Clipboard, Code,
  PaintBucket, Superscript, Subscript, Quote,
  Table as TableIcon, Columns, MoreHorizontal,
  CheckSquare, Hash, Maximize2, Minimize2,Palette,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// ============================================================
// CONSTANTS
// ============================================================

const FONT_SIZES = ["8","9","10","11","12","14","16","18","20","22","24","26","28","36","48","72"];
const FONT_FAMILIES = [
  { label:"Default", value:"" },
  { label:"Arial", value:"Arial, sans-serif" },
  { label:"Georgia", value:"Georgia, serif" },
  { label:"Times New Roman", value:"'Times New Roman', serif" },
  { label:"Courier New", value:"'Courier New', monospace" },
  { label:"Verdana", value:"Verdana, sans-serif" },
  { label:"Trebuchet MS", value:"'Trebuchet MS', sans-serif" },
  { label:"Palatino", value:"'Palatino Linotype', serif" },
  { label:"Garamond", value:"Garamond, serif" },
  { label:"Impact", value:"Impact, sans-serif" },
  { label:"Comic Sans", value:"'Comic Sans MS', cursive" },
];
const TEXT_COLORS = [
  "#000000","#1e2533","#374151","#64748b","#94a3b8","#ffffff",
  "#dc2626","#ea580c","#d97706","#16a34a","#2563eb","#7c3aed",
  "#db2777","#0891b2","#065f46","#1e3a8a","#4c1d95","#7f1d1d",
];
const HIGHLIGHT_COLORS = [
  "#fef08a","#bbf7d0","#bfdbfe","#fecaca",
  "#fed7aa","#e9d5ff","#ccfbf1","#fce7f3",
  "transparent",
];
const LINE_HEIGHTS = ["1.0","1.15","1.5","2.0","2.5","3.0"];
const LETTER_SPACINGS = ["normal","-1px","0.5px","1px","2px","3px","4px"];

// ============================================================
// HELPERS
// ============================================================

const rebuildFullHtml = (originalFullHtml, newBodyContent) => {
  if (!originalFullHtml) {
    return `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="utf-8"/></head>\n<body>${newBodyContent}</body>\n</html>`;
  }
  const hasBody = /<body[^>]*>/i.test(originalFullHtml);
  if (hasBody) {
    return originalFullHtml.replace(
      /(<body[^>]*>)([\s\S]*?)(<\/body>)/i,
      `$1\n${newBodyContent}\n$3`,
    );
  }
  return newBodyContent;
};

// ============================================================
// SUB COMPONENTS
// ============================================================

const Divider = () => (
  <div style={{ width:1, height:26, background:"#e2e8f0", margin:"0 3px", flexShrink:0 }}/>
);

const ToolBtn = ({ onClick, title, children, active, disabled, style={} }) => (
  <button
    onClick={onClick}
    title={title}
    disabled={disabled}
    style={{
      display:"flex", alignItems:"center", justifyContent:"center",
      gap:4, padding:"4px 6px", border:"none", borderRadius:5,
      background: active ? "#dbeafe" : "transparent",
      color: active ? "#1d4ed8" : disabled ? "#cbd5e1" : "#374151",
      cursor: disabled ? "not-allowed" : "pointer",
      fontSize:12, fontWeight:500, flexShrink:0,
      transition:"background 0.15s",
      ...style,
    }}
    onMouseEnter={(e) => { if (!disabled && !active) e.currentTarget.style.background="#f1f5f9"; }}
    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = active ? "#dbeafe" : "transparent"; }}
  >
    {children}
  </button>
);

const Dropdown = ({ label, icon, open, onToggle, children, disabled, minWidth=140 }) => (
  <div style={{ position:"relative", flexShrink:0 }}>
    <ToolBtn
      onClick={onToggle}
      disabled={disabled}
      style={{ minWidth, justifyContent:"space-between", paddingRight:6 }}
    >
      {icon && <span style={{ display:"flex", alignItems:"center" }}>{icon}</span>}
      <span style={{ flex:1, textAlign:"left", paddingLeft: icon ? 4 : 0 }}>{label}</span>
      <ChevronDown size={11} style={{ opacity:0.5 }}/>
    </ToolBtn>
    {open && (
      <div style={{
        position:"absolute", top:"calc(100% + 4px)", left:0,
        background:"white", border:"1px solid #e2e8f0", borderRadius:10,
        boxShadow:"0 12px 40px rgba(0,0,0,0.14)", zIndex:99999,
        minWidth, maxHeight:280, overflowY:"auto", padding:4,
      }}>
        {children}
      </div>
    )}
  </div>
);

const DropItem = ({ onClick, children, style={} }) => (
  <div
    onClick={onClick}
    style={{
      padding:"7px 12px", cursor:"pointer", borderRadius:6,
      fontSize:13, color:"#1e293b", display:"flex", alignItems:"center", gap:8,
      ...style,
    }}
    onMouseEnter={(e) => e.currentTarget.style.background="#f1f5f9"}
    onMouseLeave={(e) => e.currentTarget.style.background=""}
  >
    {children}
  </div>
);

const ColorGrid = ({ colors, onSelect, label }) => (
  <div style={{ padding:10 }}>
    {label && <div style={{ fontSize:10, color:"#94a3b8", fontWeight:700, marginBottom:8, letterSpacing:1 }}>{label}</div>}
    <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:4 }}>
      {colors.map((c) => (
        <div
          key={c}
          onClick={() => onSelect(c)}
          title={c}
          style={{
            width:22, height:22, background:c, borderRadius:5, cursor:"pointer",
            border: c === "#ffffff" || c === "transparent" ? "1px solid #e2e8f0" : "1px solid transparent",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:9, color:"#64748b",
          }}
        >
          {c === "transparent" ? "✕" : ""}
        </div>
      ))}
    </div>
    <input
      type="color"
      onChange={(e) => onSelect(e.target.value)}
      style={{ width:"100%", height:28, marginTop:8, cursor:"pointer", border:"1px solid #e2e8f0", borderRadius:6 }}
      title="Custom color"
    />
  </div>
);

// ============================================================
// MAIN COMPONENT
// ============================================================

const FullPageEditor = () => {
  const { id } = useParams();
  const iframeRef = useRef(null);
  const isEditModeRef = useRef(false);
  const selectedElementRef = useRef(null);
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);
  const iframeLoadedRef = useRef(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [reportName, setReportName] = useState("");
  const [data, setData] = useState(null);
  const [originalFullHtml, setOriginalFullHtml] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [wordCount, setWordCount] = useState(0);

  // Floating toolbar
  const [floatingBar, setFloatingBar] = useState({ visible:false, x:0, y:0 });

  // Active dropdown
  const [openDropdown, setOpenDropdown] = useState(null);

  // Active formats (for toggle indicators)
  const [activeFormats, setActiveFormats] = useState({
    bold:false, italic:false, underline:false, strikeThrough:false,
  });

  // Find & replace panel
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [findMatchCase, setFindMatchCase] = useState(false);

  // ── Helpers ────────────────────────────────────────────────
  const showStatus = (msg, duration = 2500) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), duration);
  };

  const getIframeDoc = useCallback(() => {
    try {
      return iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document || null;
    } catch { return null; }
  }, []);

  const getIframeBodyHtml = useCallback(() =>
    getIframeDoc()?.body?.innerHTML || "", [getIframeDoc]);

  const setIframeBodyHtml = useCallback((html) => {
    const doc = getIframeDoc();
    if (doc) doc.body.innerHTML = html;
  }, [getIframeDoc]);

  // Update word count
  const updateWordCount = useCallback(() => {
    const doc = getIframeDoc();
    if (!doc) return;
    const text = doc.body.innerText || "";
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [getIframeDoc]);

  // Update active format indicators
  const updateActiveFormats = useCallback(() => {
    const doc = getIframeDoc();
    if (!doc) return;
    setActiveFormats({
      bold: doc.queryCommandState("bold"),
      italic: doc.queryCommandState("italic"),
      underline: doc.queryCommandState("underline"),
      strikeThrough: doc.queryCommandState("strikeThrough"),
    });
  }, [getIframeDoc]);

  // ── Undo / Redo ────────────────────────────────────────────
  const pushUndo = useCallback((html) => {
    undoStackRef.current = [...undoStackRef.current.slice(-99), html];
    redoStackRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  const handleUndo = useCallback(() => {
    if (!undoStackRef.current.length) return;
    const current = getIframeBodyHtml();
    const previous = undoStackRef.current[undoStackRef.current.length - 1];
    redoStackRef.current = [...redoStackRef.current, current];
    undoStackRef.current = undoStackRef.current.slice(0, -1);
    setIframeBodyHtml(previous);
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(true);
    showStatus("Undone");
  }, [getIframeBodyHtml, setIframeBodyHtml]);

  const handleRedo = useCallback(() => {
    if (!redoStackRef.current.length) return;
    const current = getIframeBodyHtml();
    const next = redoStackRef.current[redoStackRef.current.length - 1];
    undoStackRef.current = [...undoStackRef.current, current];
    redoStackRef.current = redoStackRef.current.slice(0, -1);
    setIframeBodyHtml(next);
    setCanUndo(true);
    setCanRedo(redoStackRef.current.length > 0);
    showStatus("Redone");
  }, [getIframeBodyHtml, setIframeBodyHtml]);

  // ── Format commands ────────────────────────────────────────
  const execFormat = useCallback((command, value = null) => {
    const doc = getIframeDoc();
    if (!doc) return;
    doc.execCommand(command, false, value);
    updateActiveFormats();
    pushUndo(getIframeBodyHtml());
  }, [getIframeDoc, getIframeBodyHtml, pushUndo, updateActiveFormats]);

  // Apply CSS property to selected text via span
  const applyInlineStyle = useCallback((property, value) => {
    const doc = getIframeDoc();
    if (!doc) return;
    const sel = doc.defaultView?.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    if (sel.isCollapsed) {
      // No selection — apply to current element
      if (selectedElementRef.current) {
        selectedElementRef.current.style[property] = value;
        pushUndo(getIframeBodyHtml());
      }
      return;
    }

    const range = sel.getRangeAt(0);
    try {
      const span = doc.createElement("span");
      span.style[property] = value;
      range.surroundContents(span);
    } catch {
      // Range spans multiple elements — use execCommand fallback
      if (property === "fontSize") doc.execCommand("fontSize", false, "3");
      if (property === "color") doc.execCommand("foreColor", false, value);
    }
    pushUndo(getIframeBodyHtml());
    showStatus(`${property} applied`);
  }, [getIframeDoc, getIframeBodyHtml, pushUndo]);

  // Apply style to entire selected block element
  const applyBlockStyle = useCallback((property, value) => {
    const el = selectedElementRef.current;
    if (!el) return;
    el.style[property] = value;
    pushUndo(getIframeBodyHtml());
    showStatus(`${property}: ${value}`);
  }, [getIframeBodyHtml, pushUndo]);

  // ── Floating toolbar on selection ─────────────────────────
  const updateFloatingToolbar = useCallback(() => {
    if (!isEditModeRef.current) return;
    const doc = getIframeDoc();
    if (!doc) return;
    const sel = doc.defaultView?.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      setFloatingBar((f) => ({ ...f, visible: false }));
      return;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const iframeRect = iframeRef.current?.getBoundingClientRect();
    if (!iframeRect) return;
    setFloatingBar({
      visible: true,
      x: rect.left - iframeRect.left + rect.width / 2,
      y: Math.max(0, rect.top - iframeRect.top - 52),
    });
    updateActiveFormats();
  }, [getIframeDoc, updateActiveFormats]);

  // ── Setup iframe ───────────────────────────────────────────
  const setupIframeEditing = useCallback((doc) => {
    if (!doc) return;

    doc.getElementById("editor-interaction-styles")?.remove();
    const styleEl = doc.createElement("style");
    styleEl.id = "editor-interaction-styles";
    styleEl.textContent = `
      /* Edit mode hover */
      body.edit-mode [data-editable] {
        position: relative;
        cursor: text !important;
        transition: outline 0.1s;
      }
      body.edit-mode [data-editable]:hover {
        outline: 1.5px dashed #0284c7 !important;
        outline-offset: 2px !important;
      }
      /* Active editable */
      [contenteditable="true"] {
        outline: 2px solid #0284c7 !important;
        outline-offset: 2px !important;
        background: rgba(2,132,199,0.03) !important;
        border-radius: 3px;
        min-height: 1em;
        cursor: text !important;
      }
      [contenteditable="true"]:focus {
        outline: 2px solid #0ea5e9 !important;
        box-shadow: 0 0 0 4px rgba(14,165,233,0.1) !important;
      }
      /* Text selection color */
      ::selection { background: #bfdbfe; }
      ::-moz-selection { background: #bfdbfe; }
      /* Editable tooltip */
      body.edit-mode [data-editable]:hover::before {
        content: attr(data-label);
        position: absolute;
        top: -20px;
        left: 0;
        background: #1e2533;
        color: white;
        font-size: 10px;
        padding: 2px 7px;
        border-radius: 4px;
        white-space: nowrap;
        z-index: 99999;
        pointer-events: none;
        font-family: sans-serif;
        font-weight: normal;
      }
    `;
    doc.head.appendChild(styleEl);

    // Tag all editable text elements
    const editableMap = {
      "p": "Paragraph", "h1": "Heading 1", "h2": "Heading 2",
      "h3": "Heading 3", "h4": "Heading 4", "h5": "Heading 5",
      "td": "Table Cell", "th": "Table Header", "li": "List Item",
      "span": "Text", "a": "Link", "label": "Label", "caption": "Caption",
      ".card-title": "Card Title", ".card-desc": "Description",
      ".kpi-value": "KPI Value", ".kpi-label": "KPI Label",
      ".kpi-sub": "KPI Sub", ".kpi-delta": "KPI Delta",
      ".blk-title": "Block Title", ".blk-sub": "Block Sub",
      ".c-title": "Title", ".c-sub": "Subtitle",
      ".stat-label": "Stat Label", ".stat-value": "Stat Value",
      ".stat-change": "Change", ".muted": "Text",
      ".hd-inst": "Institute Name", ".hd-sub": "Sub Heading",
      ".exec-summary p": "Summary", ".section p": "Section Text",
      ".cover-title h2": "Cover Title", ".cover-title p": "Cover Subtitle",
      ".aside-stat .label": "Label", ".aside-stat .value": "Value",
      ".cover-eyebrow": "Eyebrow", ".cover-summary": "Summary",
      ".badge": "Badge", ".tag": "Tag",
      ".toc-label": "TOC Item", ".toc-pg": "Page No",
    };

    Object.entries(editableMap).forEach(([sel, label]) => {
      try {
        doc.querySelectorAll(sel).forEach((el) => {
          const hasBlockChildren = [...el.children].some((c) =>
            ["DIV","P","UL","OL","TABLE","SECTION","ARTICLE"].includes(c.tagName),
          );
          const hasDirectText = [...el.childNodes].some(
            (n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim(),
          );
          if (!hasBlockChildren || hasDirectText) {
            el.setAttribute("data-editable", "true");
            el.setAttribute("data-label", `✏ ${label}`);
          }
        });
      } catch (_) {}
    });

    // ── Click handler ──────────────────────────────────────
    doc.addEventListener("click", (e) => {
      if (!isEditModeRef.current) return;

      // Deactivate previous
      if (selectedElementRef.current && selectedElementRef.current !== e.target) {
        selectedElementRef.current.removeAttribute("contenteditable");
      }

      const target = e.target.closest("[data-editable]");
      if (target) {
        target.setAttribute("contenteditable", "true");
        target.focus();

        // Move cursor to click position (not just end)
        try {
          const sel = doc.defaultView.getSelection();
          if (sel && sel.rangeCount === 0) {
            const range = doc.createRange();
            range.selectNodeContents(target);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        } catch (_) {}

        selectedElementRef.current = target;
      } else {
        selectedElementRef.current = null;
      }
    });

    // ── Double-click: select word ──────────────────────────
    doc.addEventListener("dblclick", (e) => {
      if (!isEditModeRef.current) return;
      const target = e.target.closest("[data-editable]");
      if (target) {
        const sel = doc.defaultView.getSelection();
        if (sel && sel.rangeCount > 0) {
          // Browser handles word selection natively on dblclick
          updateActiveFormats();
        }
      }
    });

    // ── Selection change ───────────────────────────────────
    doc.addEventListener("selectionchange", () => {
      updateFloatingToolbar();
      updateActiveFormats();
    });

    // ── Input ──────────────────────────────────────────────
    let inputTimer;
    doc.addEventListener("input", () => {
      clearTimeout(inputTimer);
      inputTimer = setTimeout(() => {
        pushUndo(doc.body.innerHTML);
        updateWordCount();
      }, 400);
    });

    // ── Keyboard shortcuts ─────────────────────────────────
    doc.addEventListener("keydown", (e) => {
      const ctrl = e.metaKey || e.ctrlKey;
      if (ctrl) {
        const map = {
          b:"bold", i:"italic", u:"underline",
          "1":()=>doc.execCommand("formatBlock",false,"h1"),
          "2":()=>doc.execCommand("formatBlock",false,"h2"),
          "3":()=>doc.execCommand("formatBlock",false,"h3"),
          "l":()=>doc.execCommand("justifyLeft"),
          "e":()=>doc.execCommand("justifyCenter"),
          "r":()=>doc.execCommand("justifyRight"),
          "j":()=>doc.execCommand("justifyFull"),
        };
        if (map[e.key]) {
          e.preventDefault();
          typeof map[e.key] === "string"
            ? doc.execCommand(map[e.key], false, null)
            : map[e.key]();
        }
        if (e.key==="z" && !e.shiftKey) { e.preventDefault(); handleUndo(); }
        if (e.key==="z" && e.shiftKey)  { e.preventDefault(); handleRedo(); }
        if (e.key==="y")                { e.preventDefault(); handleRedo(); }
        if (e.key==="f") { e.preventDefault(); setShowFindReplace(true); }
        if (e.key==="s") { e.preventDefault(); handleSave(); }
        if (e.key==="p") { e.preventDefault(); handlePrint(); }
      }

      // Tab key → indent
      if (e.key === "Tab") {
        e.preventDefault();
        doc.execCommand(e.shiftKey ? "outdent" : "indent");
      }
    });

    // ── Paste: strip external styles, keep plain text + basic formatting ──
    doc.addEventListener("paste", (e) => {
      if (!isEditModeRef.current) return;
      e.preventDefault();
      const text = e.clipboardData.getData("text/html") || e.clipboardData.getData("text/plain");
      // Strip dangerous tags but keep formatting
      const clean = text
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/style="[^"]*font-family[^"]*"/gi, "")
        .replace(/class="[^"]*Mso[^"]*"/gi, ""); // strip Word classes
      doc.execCommand("insertHTML", false, clean);
      pushUndo(doc.body.innerHTML);
    });

  }, [pushUndo, handleUndo, handleRedo, updateFloatingToolbar, updateActiveFormats, updateWordCount]);

  // ── Edit mode sync ─────────────────────────────────────────
  useEffect(() => {
    isEditModeRef.current = isEditMode;
    if (!iframeLoadedRef.current) return;
    const doc = getIframeDoc();
    if (!doc) return;
    if (isEditMode) {
      doc.body.classList.add("edit-mode");
    } else {
      doc.body.classList.remove("edit-mode");
      doc.querySelectorAll("[contenteditable]").forEach((el) =>
        el.removeAttribute("contenteditable"),
      );
      selectedElementRef.current = null;
      setFloatingBar((f) => ({ ...f, visible: false }));
    }
  }, [isEditMode, getIframeDoc]);

  // ── Close dropdowns on outside click ──────────────────────
  useEffect(() => {
    const handler = () => setOpenDropdown(null);
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Fullscreen ─────────────────────────────────────────────
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // ── Fetch + load ───────────────────────────────────────────
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/reports/${id}`, {
          withCredentials: true,
          headers: { Accept: "application/json" },
        });
        const reportData = res.data;
        const fullHtml = reportData.html_report || "";
        setData(reportData);
        setReportName(reportData.file_name || `Report #${id}`);
        setOriginalFullHtml(fullHtml);

        const iframe = iframeRef.current;
        if (!iframe) { setIsLoading(false); return; }

        iframe.onload = () => {
          try {
            const doc = iframe.contentDocument || iframe.contentWindow?.document;
            if (doc) {
              setupIframeEditing(doc);
              iframeLoadedRef.current = true;
              updateWordCount();
            }
          } catch (err) {
            console.error("iframe setup error:", err);
          } finally {
            setIsLoading(false);
          }
        };

        iframe.srcdoc = fullHtml;
      } catch (err) {
        setError(err.response?.data?.detail || err.message || "Failed to load.");
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [id, setupIframeEditing, updateWordCount]);

  // ── Save ───────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const doc = getIframeDoc();
      if (!doc) throw new Error("Editor not ready.");
      const bodyClone = doc.body.cloneNode(true);
      bodyClone.querySelectorAll("[contenteditable]").forEach((el) => el.removeAttribute("contenteditable"));
      bodyClone.querySelectorAll("[data-editable]").forEach((el) => el.removeAttribute("data-editable"));
      bodyClone.querySelectorAll("[data-label]").forEach((el) => el.removeAttribute("data-label"));
      bodyClone.classList.remove("edit-mode");
      bodyClone.querySelector("#editor-interaction-styles")?.remove();

      const rebuiltFullHtml = rebuildFullHtml(originalFullHtml, bodyClone.innerHTML);
      const payload = { ...data, html_report: rebuiltFullHtml };
        console.log("Saving report with payload:", payload);
      await axios.put(`${API_BASE_URL}/reports/update/${id}`, payload, { withCredentials: true });
      setData(payload);
      setOriginalFullHtml(rebuiltFullHtml);
      showStatus("✓ Saved successfully");
    } catch (err) {
      alert("Failed to save: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  // ── Download PDF ───────────────────────────────────────────
  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    showStatus("Generating PDF...", 10000);
    try {
      const iframe = iframeRef.current;
      if (!iframe) return;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      const pages = Array.from(doc.querySelectorAll(".page"));
      const targets = pages.length > 0 ? pages : [doc.body];

      const pdf = new jsPDF({ unit:"mm", format:"a4", orientation:"portrait" });
      const A4W = 210, A4H = 297;

      for (let i = 0; i < targets.length; i++) {
        const el = targets[i];
        const canvas = await html2canvas(el, {
          scale: 2, useCORS: true, backgroundColor: "#ffffff",
          width: el.scrollWidth, height: el.scrollHeight,
          logging: false,
        });
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const naturalW = (el.scrollWidth / 96) * 25.4;
        const naturalH = (el.scrollHeight / 96) * 25.4;
        const scale = Math.min(A4W / naturalW, A4H / naturalH, 1);
        const imgW = naturalW * scale;
        const imgH = naturalH * scale;
        const offsetX = (A4W - imgW) / 2;
        const offsetY = (A4H - imgH) / 2;
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", offsetX, offsetY, imgW, imgH);
      }

      const fileName = (reportName || "report").replace(/\s+/g, "_");
      pdf.save(`${fileName}.pdf`);
      showStatus("✓ PDF downloaded");
    } catch (err) {
      alert("PDF generation failed: " + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  // ── Print ──────────────────────────────────────────────────
  const handlePrint = () => {
    iframeRef.current?.contentWindow?.print();
  };

  // ── Find & Replace ─────────────────────────────────────────
  const handleFind = () => {
    const doc = getIframeDoc();
    if (!doc || !findText) return;
    const flags = findMatchCase ? "g" : "gi";
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
    const text = doc.body.innerHTML;
    const highlighted = text.replace(regex, (m) => `<mark style="background:#fef08a">${m}</mark>`);
    doc.body.innerHTML = highlighted;
    showStatus(`Highlighted occurrences of "${findText}"`);
  };

  const handleReplace = () => {
    const doc = getIframeDoc();
    if (!doc || !findText) return;
    const flags = findMatchCase ? "g" : "gi";
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
    doc.body.innerHTML = doc.body.innerHTML.replace(regex, replaceText);
    pushUndo(getIframeBodyHtml());
    showStatus(`Replaced "${findText}" → "${replaceText}"`);
  };

  const handleCloseTab = () => {
    if (window.confirm("Any unsaved changes will be lost. Close editor?")) window.close();
  };

  const handleZoom = (delta) => setZoom((z) => Math.min(200, Math.max(30, z + delta)));

  // dd helper
  const dd = (name) => ({ open: openDropdown === name, onToggle: (e) => { e.stopPropagation(); setOpenDropdown((p) => p === name ? null : name); } });

  // ── Guards ─────────────────────────────────────────────────
  if (isLoading) return (
    <div className="loading-screen">
      <Loader2 size={40} className="spinner" style={{ color:"#0284c7" }}/>
      <span style={{ marginTop:15, fontSize:"1.2rem" }}>Loading Editor...</span>
    </div>
  );

  if (error) return (
    <div className="error-screen">
      <h2>Error Loading Report</h2><p>{error}</p>
      <button className="error-btn" onClick={() => window.close()}>Close Tab</button>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", overflow:"hidden", fontFamily:"'Inter',system-ui,sans-serif", background:"#f8fafc" }}>

      {/* ═══════════════════════════════════════════════════════
          MENU BAR (File / Edit / Insert / Format / View)
      ═══════════════════════════════════════════════════════ */}
      <div style={{ display:"flex", alignItems:"center", background:"#1e2533", color:"white", padding:"0 12px", height:36, flexShrink:0, gap:2 }}>
        {/* Title */}
        <span style={{ fontSize:13, fontWeight:600, color:"#94a3b8", marginRight:12, maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {reportName}
        </span>

        {/* Menu items */}
        {[
          { label:"File", items:[
            { icon:<Save size={13}/>, label:"Save", shortcut:"Ctrl+S", action: handleSave },
            { icon:<Download size={13}/>, label:"Download PDF", action: handleDownloadPdf },
            { icon:<Printer size={13}/>, label:"Print", shortcut:"Ctrl+P", action: handlePrint },
            { divider: true },
            { icon:<X size={13}/>, label:"Close Tab", action: handleCloseTab },
          ]},
          { label:"Edit", items:[
            { icon:<Undo size={13}/>, label:"Undo", shortcut:"Ctrl+Z", action: handleUndo, disabled:!canUndo },
            { icon:<Redo size={13}/>, label:"Redo", shortcut:"Ctrl+Y", action: handleRedo, disabled:!canRedo },
            { divider: true },
            { icon:<Scissors size={13}/>, label:"Cut", shortcut:"Ctrl+X", action:()=>execFormat("cut") },
            { icon:<Copy size={13}/>, label:"Copy", shortcut:"Ctrl+C", action:()=>execFormat("copy") },
            { icon:<Clipboard size={13}/>, label:"Paste as Plain Text", action:()=>execFormat("paste") },
            { divider: true },
            { icon:<Search size={13}/>, label:"Find & Replace", shortcut:"Ctrl+F", action:()=>setShowFindReplace(v=>!v) },
            { icon:<MoreHorizontal size={13}/>, label:"Select All", shortcut:"Ctrl+A", action:()=>execFormat("selectAll") },
            { divider: true },
            { icon:<RotateCcw size={13}/>, label:"Clear Formatting", action:()=>execFormat("removeFormat") },
          ]},
          { label:"Insert", items:[
            { icon:<LinkIcon size={13}/>, label:"Link", action:()=>{ const u=window.prompt("URL:"); if(u) execFormat("createLink",u); } },
            { icon:<ImageIcon size={13}/>, label:"Image from URL", action:()=>{ const u=window.prompt("Image URL:"); if(u) execFormat("insertImage",u); } },
            { icon:<TableIcon size={13}/>, label:"Table", action:()=>{
              const r=parseInt(window.prompt("Rows:","3"))||3;
              const c=parseInt(window.prompt("Cols:","3"))||3;
              const doc=getIframeDoc(); if(!doc) return;
              let t=`<table border="1" style="border-collapse:collapse;width:100%;margin:12px 0">`;
              for(let i=0;i<r;i++){ t+="<tr>"; for(let j=0;j<c;j++){ const tag=i===0?"th":"td"; t+=`<${tag} style="padding:8px 10px;border:1px solid #e2e8f0">${i===0?`Col ${j+1}`:"Cell"}</${tag}>`; } t+="</tr>"; }
              t+="</table>"; doc.execCommand("insertHTML",false,t); pushUndo(getIframeBodyHtml());
            }},
            { icon:<Minus size={13}/>, label:"Horizontal Rule", action:()=>execFormat("insertHorizontalRule") },
            { icon:<Quote size={13}/>, label:"Blockquote", action:()=>execFormat("formatBlock","blockquote") },
            { icon:<Code size={13}/>, label:"Code Block", action:()=>execFormat("formatBlock","pre") },
            { icon:<Hash size={13}/>, label:"Ordered List", action:()=>execFormat("insertOrderedList") },
            { icon:<List size={13}/>, label:"Unordered List", action:()=>execFormat("insertUnorderedList") },
          ]},
          { label:"Format", items:[
            { icon:<Bold size={13}/>, label:"Bold", shortcut:"Ctrl+B", action:()=>execFormat("bold") },
            { icon:<Italic size={13}/>, label:"Italic", shortcut:"Ctrl+I", action:()=>execFormat("italic") },
            { icon:<UnderlineIcon size={13}/>, label:"Underline", shortcut:"Ctrl+U", action:()=>execFormat("underline") },
            { icon:<Strikethrough size={13}/>, label:"Strikethrough", action:()=>execFormat("strikeThrough") },
            { icon:<Superscript size={13}/>, label:"Superscript", action:()=>execFormat("superscript") },
            { icon:<Subscript size={13}/>, label:"Subscript", action:()=>execFormat("subscript") },
            { divider: true },
            { icon:<AlignLeft size={13}/>, label:"Align Left", shortcut:"Ctrl+L", action:()=>execFormat("justifyLeft") },
            { icon:<AlignCenter size={13}/>, label:"Align Center", shortcut:"Ctrl+E", action:()=>execFormat("justifyCenter") },
            { icon:<AlignRight size={13}/>, label:"Align Right", shortcut:"Ctrl+R", action:()=>execFormat("justifyRight") },
            { icon:<AlignJustify size={13}/>, label:"Justify", shortcut:"Ctrl+J", action:()=>execFormat("justifyFull") },
            { divider: true },
            { icon:<RotateCcw size={13}/>, label:"Clear Formatting", action:()=>execFormat("removeFormat") },
          ]},
          { label:"View", items:[
            { icon:<Eye size={13}/>, label: showPreview?"Exit Preview":"Preview Mode", action:()=>setShowPreview(v=>!v) },
            { icon:<ZoomIn size={13}/>, label:"Zoom In", action:()=>handleZoom(10) },
            { icon:<ZoomOut size={13}/>, label:"Zoom Out", action:()=>handleZoom(-10) },
            { icon:<RotateCcw size={13}/>, label:"Reset Zoom (100%)", action:()=>setZoom(100) },
            { divider: true },
            { icon:<Maximize2 size={13}/>, label: isFullscreen?"Exit Fullscreen":"Fullscreen", action: toggleFullscreen },
          ]},
        ].map(({ label, items }) => (
          <div key={label} style={{ position:"relative" }}>
            <button
              onClick={(e) => { e.stopPropagation(); setOpenDropdown(p => p === label ? null : label); }}
              style={{ background:"transparent", border:"none", color: openDropdown===label ? "white":"#94a3b8", padding:"0 10px", height:36, cursor:"pointer", fontSize:13, borderRadius:0, transition:"color 0.15s", fontFamily:"inherit" }}
              onMouseEnter={(e) => e.currentTarget.style.background="rgba(255,255,255,0.08)"}
              onMouseLeave={(e) => e.currentTarget.style.background= openDropdown===label?"rgba(255,255,255,0.08)":"transparent"}
            >
              {label}
            </button>
            {openDropdown === label && (
              <div style={{ position:"absolute", top:"100%", left:0, background:"white", border:"1px solid #e2e8f0", borderRadius:10, boxShadow:"0 12px 40px rgba(0,0,0,0.18)", zIndex:99999, minWidth:220, padding:4 }}>
                {items.map((item, i) =>
                  item.divider ? (
                    <div key={i} style={{ height:1, background:"#f1f5f9", margin:"4px 8px" }}/>
                  ) : (
                    <div
                      key={item.label}
                      onClick={() => { if (!item.disabled) { item.action(); setOpenDropdown(null); } }}
                      style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 12px", cursor: item.disabled?"not-allowed":"pointer", borderRadius:6, opacity: item.disabled?0.4:1, color:"#1e293b" }}
                      onMouseEnter={(e) => { if(!item.disabled) e.currentTarget.style.background="#f1f5f9"; }}
                      onMouseLeave={(e) => e.currentTarget.style.background=""}
                    >
                      <span style={{ display:"flex", alignItems:"center", gap:9, fontSize:13 }}>{item.icon}{item.label}</span>
                      {item.shortcut && <span style={{ fontSize:11, color:"#94a3b8", fontFamily:"monospace" }}>{item.shortcut}</span>}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        ))}

        <div style={{ flex:1 }}/>

        {/* Edit toggle in menu bar */}
        <button
          onClick={() => setIsEditMode(v=>!v)}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 14px", borderRadius:6, border:"none", background: isEditMode?"#0284c7":"rgba(255,255,255,0.1)", color:"white", fontSize:12, fontWeight:600, cursor:"pointer" }}
        >
          <Type size={13}/> {isEditMode ? "✓ Editing" : "Edit"}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════
          TOOLBAR RIBBON
      ═══════════════════════════════════════════════════════ */}
      <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:2, padding:"4px 10px", background:"white", borderBottom:"1px solid #e2e8f0", flexShrink:0 }}>

        {/* History */}
        <ToolBtn onClick={handleUndo} disabled={!canUndo} title="Undo (Ctrl+Z)"><Undo size={14}/></ToolBtn>
        <ToolBtn onClick={handleRedo} disabled={!canRedo} title="Redo (Ctrl+Y)"><Redo size={14}/></ToolBtn>
        <Divider/>

        {/* Font family */}
        <Dropdown label="Font Family" minWidth={130} {...dd("fontFamily")} disabled={!isEditMode}>
          {FONT_FAMILIES.map((f) => (
            <DropItem key={f.label} onClick={() => { applyInlineStyle("fontFamily", f.value); setOpenDropdown(null); }}
              style={{ fontFamily: f.value || "inherit" }}>
              {f.label}
            </DropItem>
          ))}
        </Dropdown>

        {/* Font size */}
        <Dropdown label="Size" minWidth={72} {...dd("fontSize")} disabled={!isEditMode}>
          {FONT_SIZES.map((s) => (
            <DropItem key={s} onClick={() => { applyInlineStyle("fontSize", s+"px"); setOpenDropdown(null); }}
              style={{ fontSize: Math.min(parseInt(s), 18) }}>
              {s}
            </DropItem>
          ))}
        </Dropdown>

        <Divider/>

        {/* Format buttons */}
        <ToolBtn onClick={()=>execFormat("bold")} disabled={!isEditMode} active={activeFormats.bold} title="Bold (Ctrl+B)"><Bold size={14}/></ToolBtn>
        <ToolBtn onClick={()=>execFormat("italic")} disabled={!isEditMode} active={activeFormats.italic} title="Italic (Ctrl+I)"><Italic size={14}/></ToolBtn>
        <ToolBtn onClick={()=>execFormat("underline")} disabled={!isEditMode} active={activeFormats.underline} title="Underline (Ctrl+U)"><UnderlineIcon size={14}/></ToolBtn>
        <ToolBtn onClick={()=>execFormat("strikeThrough")} disabled={!isEditMode} active={activeFormats.strikeThrough} title="Strikethrough"><Strikethrough size={14}/></ToolBtn>
        <ToolBtn onClick={()=>execFormat("superscript")} disabled={!isEditMode} title="Superscript" style={{ fontSize:11 }}>x²</ToolBtn>
        <ToolBtn onClick={()=>execFormat("subscript")} disabled={!isEditMode} title="Subscript" style={{ fontSize:11 }}>x₂</ToolBtn>

        {/* Text color */}
        <Dropdown minWidth={200} {...dd("textColor")} disabled={!isEditMode}
          label={<span style={{ display:"flex", alignItems:"center", gap:4 }}><Palette size={13}/><div style={{ width:12, height:3, background:"#dc2626", borderRadius:2 }}/></span>}
        >
          <ColorGrid colors={TEXT_COLORS} label="TEXT COLOR" onSelect={(c) => { execFormat("foreColor", c); setOpenDropdown(null); }}/>
        </Dropdown>

        {/* Highlight */}
        <Dropdown minWidth={200} {...dd("highlight")} disabled={!isEditMode}
          label={<span style={{ display:"flex", alignItems:"center", gap:4 }}><Highlighter size={13}/><div style={{ width:12, height:3, background:"#fef08a", borderRadius:2 }}/></span>}
        >
          <ColorGrid colors={HIGHLIGHT_COLORS} label="HIGHLIGHT" onSelect={(c) => { execFormat("hiliteColor", c); setOpenDropdown(null); }}/>
        </Dropdown>

        <Divider/>

        {/* Alignment */}
        <ToolBtn onClick={()=>execFormat("justifyLeft")} disabled={!isEditMode} title="Align Left (Ctrl+L)"><AlignLeft size={14}/></ToolBtn>
        <ToolBtn onClick={()=>execFormat("justifyCenter")} disabled={!isEditMode} title="Center (Ctrl+E)"><AlignCenter size={14}/></ToolBtn>
        <ToolBtn onClick={()=>execFormat("justifyRight")} disabled={!isEditMode} title="Align Right (Ctrl+R)"><AlignRight size={14}/></ToolBtn>
        <ToolBtn onClick={()=>execFormat("justifyFull")} disabled={!isEditMode} title="Justify (Ctrl+J)"><AlignJustify size={14}/></ToolBtn>

        <Divider/>

        {/* Heading styles */}
        {["h1","h2","h3","p"].map((tag) => (
          <ToolBtn key={tag} onClick={()=>execFormat("formatBlock",tag)} disabled={!isEditMode} title={tag.toUpperCase()} style={{ fontSize:11, fontWeight:700, minWidth:26 }}>
            {tag === "p" ? "¶" : tag.toUpperCase()}
          </ToolBtn>
        ))}

        <Divider/>

        {/* Lists */}
        <ToolBtn onClick={()=>execFormat("insertUnorderedList")} disabled={!isEditMode} title="Bullet List"><List size={14}/></ToolBtn>
        <ToolBtn onClick={()=>execFormat("insertOrderedList")} disabled={!isEditMode} title="Numbered List"><ListOrdered size={14}/></ToolBtn>
        <ToolBtn onClick={()=>execFormat("indent")} disabled={!isEditMode} title="Indent" style={{ fontSize:13 }}>→</ToolBtn>
        <ToolBtn onClick={()=>execFormat("outdent")} disabled={!isEditMode} title="Outdent" style={{ fontSize:13 }}>←</ToolBtn>

        <Divider/>

        {/* Line height */}
        <Dropdown label="Line" minWidth={80} {...dd("lineHeight")} disabled={!isEditMode}>
          {LINE_HEIGHTS.map((lh) => (
            <DropItem key={lh} onClick={() => { applyBlockStyle("lineHeight", lh); setOpenDropdown(null); }}>{lh}</DropItem>
          ))}
        </Dropdown>

        {/* Letter spacing */}
        <Dropdown label="Spacing" minWidth={90} {...dd("letterSpacing")} disabled={!isEditMode}>
          {LETTER_SPACINGS.map((ls) => (
            <DropItem key={ls} onClick={() => { applyInlineStyle("letterSpacing", ls); setOpenDropdown(null); }}>{ls}</DropItem>
          ))}
        </Dropdown>

        <Divider/>

        {/* Insert */}
        <ToolBtn onClick={()=>{ const u=window.prompt("URL:"); if(u) execFormat("createLink",u); }} disabled={!isEditMode} title="Insert Link"><LinkIcon size={14}/></ToolBtn>
        <ToolBtn onClick={()=>{ const u=window.prompt("Image URL:"); if(u) execFormat("insertImage",u); }} disabled={!isEditMode} title="Insert Image"><ImageIcon size={14}/></ToolBtn>
        <ToolBtn onClick={()=>execFormat("insertHorizontalRule")} disabled={!isEditMode} title="Horizontal Rule"><Minus size={14}/></ToolBtn>
        <ToolBtn onClick={()=>execFormat("removeFormat")} disabled={!isEditMode} title="Clear Formatting" style={{ fontSize:11, fontWeight:600, padding:"4px 8px" }}>Clear</ToolBtn>

        <Divider/>

        {/* Find & Replace */}
        <ToolBtn onClick={()=>setShowFindReplace(v=>!v)} title="Find & Replace (Ctrl+F)" active={showFindReplace}>
          <Search size={14}/>
        </ToolBtn>

        <Divider/>

        {/* Zoom */}
        <ToolBtn onClick={()=>handleZoom(-10)} title="Zoom Out"><ZoomOut size={14}/></ToolBtn>
        <span style={{ fontSize:11, color:"#64748b", minWidth:40, textAlign:"center", fontWeight:600 }}>{zoom}%</span>
        <ToolBtn onClick={()=>handleZoom(10)} title="Zoom In"><ZoomIn size={14}/></ToolBtn>
        <ToolBtn onClick={()=>setZoom(100)} title="Reset Zoom"><RotateCcw size={12}/></ToolBtn>

        <Divider/>

        {/* Preview + fullscreen */}
        <ToolBtn onClick={()=>setShowPreview(v=>!v)} active={showPreview} title="Toggle Preview">
          {showPreview ? <EyeOff size={14}/> : <Eye size={14}/>}
          <span style={{ fontSize:11 }}>{showPreview?"Edit":"Preview"}</span>
        </ToolBtn>
        <ToolBtn onClick={toggleFullscreen} title="Fullscreen">
          {isFullscreen ? <Minimize2 size={14}/> : <Maximize2 size={14}/>}
        </ToolBtn>

        <div style={{ flex:1 }}/>

        {/* Download & Save */}
        <ToolBtn onClick={handleDownloadPdf} disabled={isDownloading} title="Download PDF"
          style={{ background:"#f1f5f9", border:"1px solid #e2e8f0", padding:"4px 10px" }}>
          {isDownloading ? <Loader2 size={13} style={{ animation:"spin 1s linear infinite" }}/> : <Download size={13}/>}
          <span style={{ fontSize:11, fontWeight:600 }}>PDF</span>
        </ToolBtn>

        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 14px", borderRadius:7, border:"none", background:"#0284c7", color:"white", fontSize:13, fontWeight:600, cursor:"pointer", flexShrink:0 }}
        >
          {isSaving ? <Loader2 size={14} style={{ animation:"spin 1s linear infinite" }}/> : <Save size={14}/>}
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════
          FIND & REPLACE PANEL
      ═══════════════════════════════════════════════════════ */}
      {showFindReplace && (
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 14px", background:"#fffbeb", borderBottom:"1px solid #fde68a", flexShrink:0, flexWrap:"wrap" }}>
          <Search size={14} style={{ color:"#92400e" }}/>
          <input
            value={findText}
            onChange={(e)=>setFindText(e.target.value)}
            placeholder="Find..."
            style={{ padding:"4px 10px", border:"1px solid #fde68a", borderRadius:6, fontSize:13, width:160, background:"white" }}
            onKeyDown={(e)=>{ if(e.key==="Enter") handleFind(); }}
            autoFocus
          />
          <input
            value={replaceText}
            onChange={(e)=>setReplaceText(e.target.value)}
            placeholder="Replace with..."
            style={{ padding:"4px 10px", border:"1px solid #fde68a", borderRadius:6, fontSize:13, width:160, background:"white" }}
            onKeyDown={(e)=>{ if(e.key==="Enter") handleReplace(); }}
          />
          <label style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#92400e", cursor:"pointer" }}>
            <input type="checkbox" checked={findMatchCase} onChange={(e)=>setFindMatchCase(e.target.checked)}/> Match case
          </label>
          <button onClick={handleFind} style={{ padding:"4px 12px", borderRadius:6, border:"none", background:"#f59e0b", color:"white", fontSize:12, fontWeight:600, cursor:"pointer" }}>Find</button>
          <button onClick={handleReplace} style={{ padding:"4px 12px", borderRadius:6, border:"none", background:"#d97706", color:"white", fontSize:12, fontWeight:600, cursor:"pointer" }}>Replace All</button>
          <button onClick={()=>setShowFindReplace(false)} style={{ background:"transparent", border:"none", cursor:"pointer", color:"#92400e", marginLeft:4 }}><X size={14}/></button>
        </div>
      )}

      {/* Edit hint / preview banner */}
      {isEditMode && !showPreview && (
        <div style={{ background:"#eff6ff", borderBottom:"1px solid #bfdbfe", padding:"4px 16px", fontSize:11.5, color:"#1d4ed8", flexShrink:0, display:"flex", alignItems:"center", gap:20 }}>
          <span>✏️ <strong>Edit mode</strong> — click any text to edit. Select text for quick formatting.</span>
          <span style={{ color:"#93c5fd", fontFamily:"monospace" }}>Ctrl+B · Ctrl+I · Ctrl+U · Ctrl+Z · Ctrl+F · Ctrl+S</span>
        </div>
      )}
      {showPreview && (
        <div style={{ background:"#f0fdf4", borderBottom:"1px solid #bbf7d0", padding:"4px 16px", fontSize:11.5, color:"#15803d", flexShrink:0 }}>
          👁 <strong>Preview mode</strong> — no editor overlays. Click "Edit View" to return.
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          STATUS BAR
      ═══════════════════════════════════════════════════════ */}

      {/* ═══════════════════════════════════════════════════════
          IFRAME WORKSPACE
      ═══════════════════════════════════════════════════════ */}
      <div style={{ flex:1, overflow:"auto", background:"#e5e7eb", padding:"20px", position:"relative" }}>

        {/* Floating toolbar on text selection */}
        {floatingBar.visible && isEditMode && !showPreview && (
          <div style={{
            position:"absolute",
            left: Math.max(0, floatingBar.x - 130),
            top: Math.max(0, floatingBar.y),
            background:"#1e2533",
            borderRadius:9,
            padding:"5px 8px",
            display:"flex",
            alignItems:"center",
            gap:2,
            zIndex:99999,
            boxShadow:"0 6px 24px rgba(0,0,0,0.35)",
            pointerEvents:"auto",
          }}>
            {[
              { icon:<Bold size={12}/>, cmd:"bold", title:"Bold" },
              { icon:<Italic size={12}/>, cmd:"italic", title:"Italic" },
              { icon:<UnderlineIcon size={12}/>, cmd:"underline", title:"Underline" },
              { icon:<Strikethrough size={12}/>, cmd:"strikeThrough", title:"Strikethrough" },
              { icon:<span style={{ fontSize:10, fontWeight:700 }}>x²</span>, cmd:"superscript", title:"Superscript" },
              { icon:<span style={{ fontSize:10, fontWeight:700 }}>x₂</span>, cmd:"subscript", title:"Subscript" },
            ].map(({ icon, cmd, title }) => (
              <button key={cmd} onClick={()=>execFormat(cmd)} title={title}
                style={{ background: activeFormats[cmd]?"rgba(14,165,233,0.3)":"transparent", border:"none", color:"white", padding:"4px 6px", borderRadius:5, cursor:"pointer", display:"flex", alignItems:"center" }}
                onMouseEnter={(e) => e.currentTarget.style.background="rgba(255,255,255,0.15)"}
                onMouseLeave={(e) => e.currentTarget.style.background= activeFormats[cmd]?"rgba(14,165,233,0.3)":"transparent"}
              >{icon}</button>
            ))}
            <div style={{ width:1, background:"rgba(255,255,255,0.15)", margin:"0 4px", height:18 }}/>
            {TEXT_COLORS.slice(0,6).map((c) => (
              <div key={c} onClick={()=>execFormat("foreColor",c)}
                style={{ width:15, height:15, background:c, borderRadius:3, cursor:"pointer", border:"1px solid rgba(255,255,255,0.2)", flexShrink:0 }}
                title={`Color: ${c}`}
              />
            ))}
            <div style={{ width:1, background:"rgba(255,255,255,0.15)", margin:"0 4px", height:18 }}/>
            <button onClick={()=>execFormat("removeFormat")}
              style={{ background:"transparent", border:"none", color:"#94a3b8", padding:"3px 6px", borderRadius:5, cursor:"pointer", fontSize:10, fontWeight:700 }}
              onMouseEnter={(e) => e.currentTarget.style.background="rgba(255,255,255,0.15)"}
              onMouseLeave={(e) => e.currentTarget.style.background="transparent"}
              title="Clear formatting"
            >CLR</button>
          </div>
        )}

        <iframe
          ref={iframeRef}
          title="Report Editor"
          style={{
            width: "210mm",
            height: "100%",
            minHeight: "calc(100vh - 160px)",
            border: "none",
            display: "block",
            background: "white",
            margin: "0 auto",
            boxShadow: "0 4px 40px rgba(0,0,0,0.18)",
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
          }}
        />
      </div>

      {/* STATUS BAR */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"3px 14px", background:"#1e2533", color:"#94a3b8", fontSize:11, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <span>{isEditMode ? "✏️ Edit Mode" : "👁 View Mode"}</span>
          {statusMsg && <span style={{ color:"#34d399", fontWeight:600 }}>{statusMsg}</span>}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <span>Words: {wordCount}</span>
          <span>Zoom: {zoom}%</span>
          <span style={{ color: canUndo ? "#34d399" : "#475569" }}>
            {undoStackRef.current.length} changes
          </span>
        </div>
      </div>

    </div>
  );
};

export default FullPageEditor;