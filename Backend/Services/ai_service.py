

report = '''

<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>{{REPORT_TITLE}}</title>

<style>
  /* ---------- Page & print sizing ---------- */
  @page { size: A4; margin: 18mm; }
  html,body { height:100%; margin:0; padding:0; background:#f3f6f9; font-family: Inter, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color:#0f1724; -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale; }
  :root{
    --accent: #0a2540;
    --accent-2: #046c5a;
    --muted: #64748b;
    --muted-2:#94a3b8;
    --card:#ffffff;
    --max-width: 178mm;
    --shadow: 0 8px 28px rgba(10,37,64,0.06);
  }

  .container { width:var(--max-width); margin:8mm auto; padding:0; box-sizing:border-box; }

  /* Each .page becomes a PDF page. Use padding to respect margins. */
  .page { background: var(--card); margin-bottom:10mm; border-radius:6px; padding:18mm; box-sizing:border-box; box-shadow: none; min-height:257mm; display:flex; flex-direction:column; }
  .page:last-child { page-break-after: auto; }
  .page-break { page-break-after: always; }

  /* Header & footer */
  .header { display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e6eef6; padding-bottom:10px; margin-bottom:14px; }
  .brand { display:flex; align-items:center; gap:12px; }
  .brand .logo { width:56px; height:56px; border-radius:8px; background:linear-gradient(180deg,var(--accent),var(--accent-2)); display:flex; align-items:center; justify-content:center; color:white; font-weight:700; font-size:18px; letter-spacing:0.6px; }
  .brand .meta { display:flex; flex-direction:column; }
  .brand h1 { margin:0; font-size:18px; color:var(--accent); letter-spacing:0.2px; }
  .brand .sub { margin-top:2px; font-size:13px; color:var(--muted); }

  .header-right { text-align:right; font-size:12px; color:var(--muted); }
  .header-right .title { font-weight:600; color:var(--accent); }
  .header-right .small { color:var(--muted-2); margin-top:4px; }

  footer { margin-top:auto; padding-top:10px; border-top:1px solid #eef2f7; display:flex; justify-content:space-between; align-items:center; font-size:12px; color:var(--muted); }
  .pagenum:before { content: counter(page); } /* basic CSS page counter */

  /* Page title */
  .cover-title { margin: 12px 0 18px 0; }
  .cover-title h2 { font-size:28px; margin:0; color:var(--accent); letter-spacing:-0.2px; }
  .cover-title p { margin:6px 0 0 0; color:var(--muted); font-size:14px; }

  /* Table of contents */
  .toc { margin-top:6mm; }
  .toc h3 { margin:0 0 10px 0; color:var(--accent); font-size:16px; }
  .toc ul { list-style:none; padding:0; margin:0; }
  .toc li { display:flex; gap:12px; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #f1f5f9; color:var(--muted); font-size:13px; }

  /* KPI row */
  .kpi-row { display:flex; gap:12px; flex-wrap:wrap; margin-top:12px; }
  .kpi { background: linear-gradient(180deg, #ffffff, #fbfdff); padding:12px 14px; border-radius:10px; min-width:140px; box-shadow: var(--shadow); border:1px solid #eef6fb; display:flex; flex-direction:column; }
  .kpi .label { font-size:12px; color:var(--muted); margin-bottom:6px; text-transform:uppercase; letter-spacing:0.6px; }
  .kpi .value { font-size:20px; color:var(--accent); font-weight:700; }

  /* Card */
  .card { background:var(--card); border-radius:10px; padding:14px; box-shadow:var(--shadow); border:1px solid #eef6fb; margin-bottom:14px; }
  .card h4 { margin:0 0 8px 0; color:var(--accent); font-size:16px; }
  .card .desc { color:var(--muted); font-size:13px; margin-bottom:10px; }

  /* Chart placeholders (NO images) */
  .chart-grid { display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:8px; }
  .chart-panel { height:220px; border-radius:8px; background:linear-gradient(180deg,#fbfdff,#f7fbff); border:1px solid #eef6fb; display:flex; align-items:center; justify-content:center; color:var(--muted); font-size:13px; padding:8px; box-sizing:border-box; }
  .chart-caption { margin-top:8px; font-size:12px; color:var(--muted); }

  /* Tables */
  .table-wrap { overflow:auto; margin-top:8px; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th, td { text-align:left; padding:10px 8px; border-bottom:1px solid #eef2f7; }
  th { background:#fbfdff; color:var(--muted); font-weight:700; font-size:13px; }
  tbody tr:last-child td { border-bottom: none; }

  /* Section text */
  .section { margin-top:12px; }
  .section h3 { margin:0 0 8px 0; color:var(--accent); font-size:16px; }
  .section p { color:#0b1b28; line-height:1.55; font-size:13px; margin:0 0 10px 0; }

  .two-col { display:grid; grid-template-columns:1fr 320px; gap:16px; align-items:start; }

  .muted { color:var(--muted); font-size:13px; }
  .muted-2 { color:var(--muted-2); font-size:12px; }

  .actions { display:flex; gap:8px; margin-bottom:12px; }
  .button { background:#f8fafc; border:1px solid #e6eef6; padding:8px 10px; border-radius:8px; font-size:13px; color:var(--muted); }

  .break-after { page-break-after: always; }

  @media print {
    body { background:white; }
    .container { margin:0; width:auto; }
    .page { box-shadow:none; border-radius:0; padding:18mm; min-height:auto; }
    .no-print { display:none; }
    thead { display:table-header-group; }
    tfoot { display:table-footer-group; }
  }

  @media (max-width:900px) {
    .chart-grid { grid-template-columns:1fr; }
    .two-col { grid-template-columns:1fr; }
    .kpi-row { gap:10px; }
  }

</style>
</head>
<body>
  <div class="container">

    <!-- Page 1: Cover -->
    <section class="page">
      <header class="header">
        <div class="brand">
          <div class="logo">IR</div>
          <div class="meta">
            <h1 id="institute-name">[[INSTITUTE_NAME]]</h1>
            <div class="sub" id="institute-type">[[INSTITUTE_TYPE_AND_LOCATION]]</div>
          </div>
        </div>

        <div class="header-right">
          <div class="title" id="report-title">[[REPORT_TITLE]]</div>
          <div class="small">Prepared by Office of Institutional Research</div>
        </div>
      </header>

      <main style="margin-top:10px;">
        <div class="cover-title">
          <h2 id="main-title">[[MAIN_TITLE]]</h2>
          <p class="muted">[[COVER_SUBTITLE]]</p>
        </div>

        <div class="two-col" style="margin-top:24mm;">
          <div>
            <div class="card">
              <h4>Executive Summary</h4>
              <div class="desc" id="exec-summary-desc">[[EXECUTIVE_SUMMARY_SNIPPET]]</div>
              <div class="section">
                <p class="muted">Key highlights:</p>
                <ul class="muted" id="exec-highlights">
                  <!-- dynamic list items -->
                </ul>
              </div>
            </div>
          </div>

          <aside>
            <div class="card">
              <h4>Snapshot</h4>
              <div class="kpi-row" id="snapshot-kpis">
                <!-- KPI cards injected here -->
              </div>
              <div class="muted-2" style="margin-top:10px;">Report generated: <strong id="gen-date">[[GENERATION_DATE]]</strong></div>
            </div>
          </aside>
        </div>

      </main>

      <footer>
        <div>Office of Institutional Research</div>
        <div>Page <span class="pagenum"></span></div>
      </footer>
    </section>

    <!-- Page 2: TOC & KPIs -->
    <section class="page">
      <header class="header">
        <div class="brand">
          <div class="logo">IR</div>
          <div class="meta">
            <h1>Contents</h1>
            <div class="sub">Report structure & quick navigation</div>
          </div>
        </div>
        <div class="header-right">
          <div class="small">[[INSTITUTE_NAME]]</div>
        </div>
      </header>

      <main>
        <div class="card toc" id="toc">
          <h3>Table of Contents</h3>
          <ul id="toc-list">
            <!-- dynamically generated TOC entries -->
          </ul>
        </div>

        <div class="card" style="margin-top:12px;">
          <h4>Key Performance Indicators</h4>
          <div class="desc">At-a-glance metrics for stakeholders.</div>
          <div class="kpi-row" id="kpi-list" style="margin-top:12px;">
            <!-- KPI cards injected here -->
          </div>
        </div>
      </main>

      <footer>
        <div class="small">Confidential</div>
        <div>Page <span class="pagenum"></span></div>
      </footer>
    </section>

    <!-- Page: Example Section (repeatable) -->
    <section class="page">
      <header class="header">
        <div class="brand">
          <div class="logo">IR</div>
          <div class="meta"><h1 id="section-title">[[SECTION_TITLE]]</h1><div class="sub" id="section-sub">[[SECTION_SUBTITLE]]</div></div>
        </div>
        <div class="header-right"><div class="small">[[SECTION_META]]</div></div>
      </header>

      <main id="section-main">
        <div class="card">
          <h4>[[CHART_GROUP_TITLE]]</h4>
          <div class="desc">[[CHART_GROUP_DESC]]</div>

          <div class="chart-grid" id="chart-grid">
            <!-- Chart panels or canvases injected here -->
          </div>
        </div>

        <div class="card" style="margin-top:12px;" id="table-block">
          <h4>[[TABLE_GROUP_TITLE]]</h4>
          <div class="table-wrap" id="table-wrap">
            <!-- Tables injected here -->
          </div>
        </div>

        <div class="card section" id="text-block">
          <h4>[[NARRATIVE_TITLE]]</h4>
          <div id="narrative-content">
            <!-- Narrative paragraphs injected here -->
          </div>
        </div>

      </main>

      <footer>
        <div class="small">[[SOURCE_NOTE]]</div>
        <div>Page <span class="pagenum"></span></div>
      </footer>
    </section>

    <!-- Appendix / Annexures -->
    <section class="page">
      <header class="header">
        <div class="brand">
          <div class="logo">IR</div>
          <div class="meta"><h1>Annexures & Detailed Tables</h1><div class="sub">Supporting data & processed files</div></div>
        </div>
        <div class="header-right"><div class="small">Appendix</div></div>
      </header>

      <main>
        <div class="card">
          <h4>Top Placements — Detailed List</h4>
          <div class="table-wrap">
            <table id="placements-table">
              <thead><tr><th>Student</th><th>Dept</th><th>Company</th><th>CTC</th></tr></thead>
              <tbody>
                <!-- rows injected here -->
              </tbody>
            </table>
          </div>
        </div>

        <div class="card" style="margin-top:12px;">
          <h4>Processed Files & Data Sources</h4>
          <div class="muted" id="processed-files">
            <!-- processed files list -->
          </div>
        </div>
      </main>

      <footer>
        <div class="small">End of report</div>
        <div>Page <span class="pagenum"></span></div>
      </footer>
    </section>

  </div>

  <!-- Report JSON placeholder: replace via server-side merge or LLM, or set window.REPORT_DATA in JS -->
  <script>
    // If you want client-side rendering, inject your final_report_data JSON at this placeholder:
    // window.REPORT_DATA = {...};
    window.REPORT_DATA = /*REPORT_JSON_PLACEHOLDER*/ {};

    (function renderFromReport() {
      const r = window.REPORT_DATA || {};
      // Basic cover injection
      document.getElementById('institute-name').textContent = r.institute_name || 'Institute Name';
      document.getElementById('institute-type').textContent = (r.institute_type || '') + (r.location ? ' • ' + r.location : '');
      document.getElementById('report-title').textContent = r.title || 'Annual Report';
      document.getElementById('main-title').textContent = r.title || 'Annual Report';
      document.getElementById('gen-date').textContent = (r.metadata && r.metadata.generation_timestamp) || (new Date()).toLocaleString();

      // Executive summary
      const exec = document.getElementById('exec-summary-desc');
      if(exec) exec.textContent = r.executive_summary || '';

      // Snapshot KPIs (top 3)
      const snapshot = document.getElementById('snapshot-kpis');
      const kpiList = document.getElementById('kpi-list');
      const kpis = (r.kpis || []).slice(0, 10);
      if(snapshot && kpis.length) {
        snapshot.innerHTML = '';
        kpis.slice(0,3).forEach(k => {
          const el = document.createElement('div');
          el.className = 'kpi';
          el.innerHTML = '<div class="label">'+(k.metric || '')+'</div><div class="value">'+(k.value || '')+'</div>';
          snapshot.appendChild(el);
        });
      }
      if(kpiList && kpis.length) {
        kpiList.innerHTML = '';
        kpis.forEach(k => {
          const el = document.createElement('div');
          el.className = 'kpi';
          el.innerHTML = '<div class="label">'+(k.metric || '')+'</div><div class="value">'+(k.value || '')+'</div>';
          kpiList.appendChild(el);
        });
      }

      // TOC generation (basic from sections)
      const tocList = document.getElementById('toc-list');
      const sections = r.sections || [];
      if(tocList) {
        tocList.innerHTML = '';
        sections.forEach((s, idx) => {
          const li = document.createElement('li');
          li.innerHTML = '<span>' + (s.title || ('Section ' + (idx+1))) + '</span><span>' + (idx+2) + '</span>';
          tocList.appendChild(li);
        });
      }

      // Narrative sections injection (first few)
      const narrativeRoot = document.getElementById('narrative-content');
      if(narrativeRoot && sections.length) {
        narrativeRoot.innerHTML = '';
        sections.slice(0,5).forEach(s => {
          const wrapper = document.createElement('div');
          wrapper.className = 'section';
          const h = document.createElement('h3'); h.textContent = s.title || '';
          const p = document.createElement('p'); p.textContent = s.content || '';
          wrapper.appendChild(h); wrapper.appendChild(p);
          narrativeRoot.appendChild(wrapper);
        });
      }

      // Tables injection (example: placements)
      const placements = (r.tables || []).find(t => /placement|top placements|placements/i.test(t.title || '')) || null;
      if(placements) {
        const tbody = document.querySelector('#placements-table tbody');
        if(tbody) {
          tbody.innerHTML = '';
          const rows = placements.data?.rows || placements.data?.values || [];
          rows.forEach(row => {
            const tr = document.createElement('tr');
            row.forEach(cell => {
              const td = document.createElement('td'); td.textContent = cell;
              tr.appendChild(td);
            });
            tbody.appendChild(tr);
          });
        }
      }

      // Processed files list
      const pf = document.getElementById('processed-files');
      const processed = r.processed_files || [];
      if(pf) {
        pf.innerHTML = '';
        if(processed.length) {
          const ul = document.createElement('ul');
          processed.forEach(f => {
            const li = document.createElement('li'); li.textContent = (f.file_name || f.file_path || '');
            ul.appendChild(li);
          });
          pf.appendChild(ul);
        } else {
          pf.textContent = 'No files listed.';
        }
      }

      // Chart placeholders: create title boxes for each chart
      const chartGrid = document.getElementById('chart-grid');
      const chartsRoot = document.getElementById('chart-grid');
      const charts = r.charts || [];
      if(chartsRoot) {
        chartsRoot.innerHTML = '';
        charts.slice(0,4).forEach(c => {
          const panel = document.createElement('div');
          panel.className = 'chart-panel';
          panel.innerHTML = '<div style="text-align:center;"><div style="font-weight:700;color:var(--accent);">'+(c.title||'Chart')+'</div><div class="chart-caption">'+(c.topic||'')+'</div></div>';
          chartsRoot.appendChild(panel);
        });
      }
    })();
  </script>
</body>
</html>


'''

import os
import sys
from typing import TypedDict, List, Dict, Any, NotRequired, Optional
from datetime import datetime
from enum import Enum
import json
import time

# --- LangChain & LangGraph Imports ---
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers.string import StrOutputParser
from langchain_core.output_parsers.json import JsonOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END

# --- Project Imports ---
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
sys.path.append(project_root)

from config import GOOGLE_API_KEY, LLM_MODEL_NAME
from Services.vector_store_service import VectorStoreManager
from Services.document_processor_service import load_and_split_document
import traceback


class UserRole(Enum):
    ADMIN = "admin"
    FACULTY = "faculty"
    DEPARTMENT_HEAD = "department_head"
    FINANCE = "finance"
    STUDENT = "student"
    VIEWER = "viewer"


# --- Enhanced State ---
class GraphState(TypedDict):
    # Input
    file_paths: List[str]
    institute_id: int
    project_id: int
    user_role: NotRequired[str]
    report_year: NotRequired[str]
    report_name: NotRequired[str]
    report_desc: NotRequired[str]
    
    # Configuration
    report_type: NotRequired[str]  # Determined from name/desc
    report_focus: NotRequired[List[str]]  # Key topics to focus on
    sections_to_include: NotRequired[List[str]]
    output_format: NotRequired[str]
    language: NotRequired[str]
    
    # Processing
    validation_results: NotRequired[Dict[str, Any]]
    processed_files_metadata: NotRequired[List[Dict[str, Any]]]
    dynamic_summary: NotRequired[str]
    all_context: NotRequired[str]
    
    # Components
    report_plan: NotRequired[Dict[str, Any]]
    kpis: NotRequired[List[Dict[str, Any]]]
    sections: NotRequired[List[Dict[str, str]]]
    charts: NotRequired[List[Dict[str, Any]]]
    tables: NotRequired[List[Dict[str, Any]]]
    
    # Output
    final_report_data: NotRequired[Dict[str, Any]]
    html_report: NotRequired[str]
    report_metadata: NotRequired[Dict[str, Any]]
    generation_timestamp: NotRequired[str]
    errors: NotRequired[List[str]]


# --- Initialize ---

def _get_kpi_icon(category: str) -> str:
    """Returns icon for KPI category"""
    icons = {
        "Academic": "📚", "Financial": "💰", "Research": "🔬",
        "Student": "👨‍🎓", "Faculty": "👨‍🏫", "Infrastructure": "🏛️",
        "Placement": "💼", "General": "📊"
    }
    return icons.get(category, "📊")

llm = ChatGoogleGenerativeAI(
    model=LLM_MODEL_NAME,
    google_api_key=GOOGLE_API_KEY,
    temperature=0.1
)
html_gen_llm = ChatGoogleGenerativeAI(
    model=LLM_MODEL_NAME,
    google_api_key=GOOGLE_API_KEY,
    temperature=0.2
)
vector_store = VectorStoreManager()


# --- Enhanced Retrieval Function ---
def enhanced_retrieval(institute_id: int, project_id: int, query: str, k: int = 10) -> str:
    """Enhanced retrieval with multiple strategies"""
    retriever = vector_store.get_retriever(institute_id, project_id)
    
    docs = retriever.invoke(query)
    
    if not docs:
        broader_query = " ".join(query.split()[:5])
        docs = retriever.invoke(broader_query)
    
    if not docs:
        docs = retriever.invoke("summary overview data information")
    
    seen_content = set()
    context_parts = []
    
    for doc in docs:
        content = doc.page_content.strip()
        if content and content not in seen_content:
            seen_content.add(content)
            context_parts.append(content)
    
    context = "\n\n".join(context_parts)
    print(f"   Retrieved {len(context_parts)} unique chunks (total chars: {len(context)})")
    
    return context


# --- Validation Node ---
def validate_input_node(state: GraphState):
    """Validates input data"""
    print("---NODE: Validating Input---")
    
    validation_results = {
        "is_valid": True,
        "warnings": [],
        "errors": []
    }
    
    if not state.get('file_paths'):
        validation_results["errors"].append("No file paths provided")
        validation_results["is_valid"] = False
    
    if not state.get('institute_id'):
        validation_results["errors"].append("Institute ID is required")
        validation_results["is_valid"] = False
    
    if not state.get('project_id'):
        validation_results["errors"].append("Project ID is required")
        validation_results["is_valid"] = False
    
    for file_path in state.get('file_paths', []):
        if not os.path.exists(file_path):
            validation_results["errors"].append(f"File not found: {file_path}")
            validation_results["is_valid"] = False
    
    print(f"-> Status: {'✓ PASS' if validation_results['is_valid'] else '✗ FAIL'}")
    
    return {"validation_results": validation_results}


# --- File Processing Node ---
def process_files_node(state: GraphState):
    """Enhanced file processing"""
    print("---NODE: Processing Files---")
    
    validation = state.get('validation_results', {})
    if not validation.get('is_valid', False):
        return {"errors": validation.get('errors', [])}
    
    file_paths = state.get('file_paths', [])
    institute_id = state.get('institute_id')
    project_id = state.get('project_id')
    
    processed_metadata = []
    errors = []
    
    for file_path in file_paths:
        try:
            file_name = os.path.basename(file_path)
            file_hash = vector_store.get_file_hash(file_path)
            exists = vector_store.check_document_exists(file_hash, institute_id, project_id)
            
            metadata = {
                "file_name": file_name,
                "file_path": file_path,
                "file_hash": file_hash,
                "processed_at": datetime.now().isoformat()
            }
            
            if not exists:
                print(f"-> Embedding: {file_name}")
                documents = load_and_split_document(file_path)
                vector_store.add_documents(documents, file_hash, institute_id, project_id)
                metadata["chunks_created"] = str(len(documents))
                metadata["status"] = "newly_processed"
                print(f"   Created {len(documents)} chunks")
            else:
                print(f"-> Already indexed: {file_name}")
                metadata["status"] = "already_indexed"
            
            processed_metadata.append(metadata)
            
        except Exception as e:
            error_msg = f"Error processing {file_path}: {str(e)}"
            print(f"-> ✗ {error_msg}")
            errors.append(error_msg)
    
    return {
        "processed_files_metadata": processed_metadata,
        "errors": errors
    }

# --- NEW: Analyze Report Requirements ---
def analyze_report_requirements_node(state: GraphState):
    """Analyzes report name and description to determine report type and focus areas"""
    print("---NODE: Analyzing Report Requirements---")
    
    report_name = state.get('report_name', '')
    report_desc = state.get('report_desc', '')
    file_paths = state.get('file_paths', [])
    
    # Get file names for context
    file_names = [os.path.basename(fp) for fp in file_paths]
    
    prompt = ChatPromptTemplate.from_messages([
        ("system",
         "You are an expert report analyst. Analyze the report requirements and return a JSON structure.\n\n"
         "Determine:\n"
         "1. Report type (e.g., 'annual_report', 'financial_analysis', 'academic_performance', 'research_summary', etc.)\n"
         "2. Key focus areas (3-5 main topics the report should cover)\n"
         "3. Relevant sections to include\n"
         "4. Suggested KPI categories\n\n"
         "Output ONLY valid JSON (no markdown):\n"
         "{{\n"
         "  \"report_type\": \"descriptive_type\",\n"
         "  \"report_focus\": [\"focus_area_1\", \"focus_area_2\", \"focus_area_3\"],\n"
         "  \"suggested_sections\": [\"Section 1\", \"Section 2\", \"Section 3\"],\n"
         "  \"kpi_categories\": [\"Category1\", \"Category2\"]\n"
         "}}\n"),
        ("user",
         "Report Name: {report_name}\n\n"
         "Description: {report_desc}\n\n"
         "Analyze and return JSON:")
    ])
    
    chain = prompt | llm | StrOutputParser()
    
    try:
         
        response = chain.invoke({
            "report_name": report_name or "General Report",
            "report_desc": report_desc or "Comprehensive analysis of available data",
        })
        
        # Clean response
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        response = response.strip()
        
        analysis = json.loads(response)
        
        print(f"-> Report Type: {analysis.get('report_type', 'general')}")
        print(f"-> Focus Areas: {', '.join(analysis.get('report_focus', []))}")
        
        return {
            "report_type": analysis.get('report_type', 'general_report'),
            "report_focus": analysis.get('report_focus', []),
            "sections_to_include": analysis.get('suggested_sections', [])
        }
        
    except Exception as e:
        print(f"-> Error analyzing requirements: {e}")
        return {
            "report_type": "general_report",
            "report_focus": ["overview", "performance", "analysis"],
            "sections_to_include": []
        }

# --- Context Summarization Node ---
def summarize_context_node(state: GraphState):
    """Creates comprehensive summary based on report focus"""
    print("---NODE: Summarizing Context---")
    
    institute_id = state.get('institute_id')
    project_id = state.get('project_id')
    report_name = state.get('report_name', 'Report')
    report_desc = state.get('report_desc', '')
    report_focus = state.get('report_focus', [])
    
    # Build queries based on report focus
    base_queries = ["overview summary", "key data metrics"]
    focus_queries = [f"{focus} data analysis" for focus in report_focus]
    queries = base_queries + focus_queries
    
    all_context_parts = []
    seen = set()
    
    for query in queries:
        context = enhanced_retrieval(institute_id, project_id, query, k=15)
        if context and context not in seen:
            seen.add(context)
            all_context_parts.append(context)
    
    all_context = "\n\n=== SECTION ===\n\n".join(all_context_parts)
    
    print(f"-> Total context size: {len(all_context)} characters")
    
    # Generate summary
    prompt = ChatPromptTemplate.from_messages([
        ("system",
         "You are an expert analyst. Create a comprehensive 2-3 sentence executive summary.\n\n"
         "The summary should reflect the report's purpose and key focus areas.\n"
         "Include relevant metrics, themes, and insights from the context.\n"),
        ("user",
         "Report Name: {report_name}\n"
         "Description: {report_desc}\n"
         "Focus Areas: {focus_areas}\n\n"
         "Context:\n{context}\n\n"
         "Generate executive summary:")
    ])
    
    chain = prompt | llm | StrOutputParser()
     
    summary = chain.invoke({
        "report_name": report_name,
        "report_desc": report_desc,
        "focus_areas": ", ".join(report_focus),
        "context": all_context[:8000]
    })
    
    print(f"-> Summary: {summary}")
    
    return {
        "dynamic_summary": summary,
        "all_context": all_context
    }


# --- Report Planning Node ---
def plan_report_node(state: GraphState):
    """Creates intelligent report plan based on requirements"""
    print("---NODE: Planning Report---")
    
    dynamic_summary = state.get('dynamic_summary', '')
    all_context = state.get('all_context', '')
    report_name = state.get('report_name', 'Report')
    report_desc = state.get('report_desc', '')
    report_type = state.get('report_type', 'general')
    report_focus = state.get('report_focus', [])
    sections_to_include = state.get('sections_to_include', [])
    
    context_for_planning = all_context[:12000] if all_context else enhanced_retrieval(
        state.get('institute_id'),
        state.get('project_id'),
        f"{report_name} {' '.join(report_focus)}",
        k=20
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system",
         "You are a report strategist. Create a JSON plan for the requested report.\n\n"
         "Output ONLY valid JSON (no markdown):\n"
         "{{\n"
         "  \"report_info\": {{\n"
         "    \"title\": \"Report Title\",\n"
         "    \"type\": \"report_type\",\n"
         "    \"period\": \"Time period or 'N/A'\",\n"
         "    \"organization\": \"Organization name if found\"\n"
         "  }},\n"
         "  \"kpis\": [\n"
         "    {{\"metric\": \"Metric Name\", \"value\": \"Value\", \"category\": \"Category\"}}\n"
         "  ],\n"
         "  \"sections\": {{\n"
         "    \"Section Title\": {{\n"
         "      \"priority\": 1,\n"
         "      \"key_points\": [\"point1\", \"point2\"],\n"
         "      \"data_available\": true\n"
         "    }}\n"
         "  }},\n"
         "  \"visualizations\": [\n"
         "    {{\"title\": \"Chart Title\", \"type\": \"bar\", \"topic\": \"data topic\", \"priority\": 1}}\n"
         "  ],\n"
         "  \"tables\": [\n"
         "    {{\"title\": \"Table Title\", \"topic\": \"data topic\", \"type\": \"comparison\"}}\n"
         "  ]\n"
         "}}\n\n"
         "CRITICAL:\n"
         "- Set data_available=true for ALL sections\n"
         "- Generate 5-8 KPIs relevant to the report type with proper value\n"
         "- Generate 4-6 sections with key points\n"
         "- Generate 3-5 visualizations and 2-4 tables\n"
         "- Focus sections on the specified focus areas\n"
         "- Tailor content to match report name and description\n"),
        ("user",
         "Report Name: {report_name}\n"
         "Description: {report_desc}\n"
         "Type: {report_type}\n"
         "Focus Areas: {focus_areas}\n"
         "Suggested Sections: {sections}\n\n"
         "Summary: {summary}\n\n"
         "Context:\n{context}\n\n"
         "Generate plan:")
    ])
    
    chain = prompt | llm | StrOutputParser()
    
    try:
         
        response = chain.invoke({
            "report_name": report_name,
            "report_desc": report_desc,
            "report_type": report_type,
            "focus_areas": ", ".join(report_focus),
            "sections": ", ".join(sections_to_include) if sections_to_include else "auto-detect",
            "summary": dynamic_summary,
            "context": context_for_planning
        })
        
        # Clean response
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        response = response.strip()
        
        plan = json.loads(response)
        
        # Validate and fix structure
        if not isinstance(plan, dict):
            raise ValueError(f"Plan is not a dict: {type(plan)}")
        
        plan.setdefault('report_info', {'title': report_name, 'type': report_type})
        plan.setdefault('kpis', [])
        plan.setdefault('sections', {})
        plan.setdefault('visualizations', [])
        plan.setdefault('tables', [])
        
        # Force data_available=true
        if isinstance(plan['sections'], dict):
            for section_key in plan['sections']:
                if isinstance(plan['sections'][section_key], dict):
                    plan['sections'][section_key]['data_available'] = True
        
        print(f"-> Created: {len(plan.get('sections', {}))} sections, "
              f"{len(plan.get('kpis', []))} KPIs, "
              f"{len(plan.get('visualizations', []))} charts")
        print(plan.get('kpis', []))
        return {"report_plan": plan}
        
    except Exception as e:
        print(f"-> Error in planning: {e}")
        return {"report_plan": {
            "report_info": {"title": report_name, "type": report_type},
            "kpis": [],
            "sections": {},
            "visualizations": [],
            "tables": []
        }}


# --- KPI Generation Node ---
def generate_kpis_node(state: GraphState):
    """Generates KPIs with icons"""
    print("---NODE: Generating KPIs---")
    
    report_plan = state.get('report_plan', {})
    kpis = report_plan.get('kpis', [])
    
    enhanced_kpis = []
    for kpi in kpis:
        enhanced_kpis.append({
            "metric": kpi.get('metric', 'N/A'),
            "value": kpi.get('value', 'N/A'),
            "category": kpi.get('category', 'General'),
            "trend": kpi.get('trend', 'stable'),
            "icon": _get_kpi_icon(kpi.get('category', ''))
        })
    
    print(f"-> Generated {len(enhanced_kpis)} KPIs")
    return {"kpis": enhanced_kpis}


# --- Section Generation Node ---
def generate_sections_node(state: GraphState):
    """Generates narrative content based on report requirements"""
    print("---NODE: Generating Sections---")
    
    report_plan = state.get('report_plan', {})
    sections_plan = report_plan.get('sections', {})
    institute_id = state.get('institute_id')
    project_id = state.get('project_id')
    language = state.get('language', 'en')
    all_context = state.get('all_context', '')
    report_name = state.get('report_name', 'Report')
    report_focus = state.get('report_focus', [])
    
    sections_output = []
    
    sorted_sections = sorted(
        sections_plan.items(),
        key=lambda x: x[1].get('priority', 999)
    )
    
    for section_title, section_info in sorted_sections:
        print(f"-> Generating: {section_title}")
        
        key_points = section_info.get('key_points', [])
        
        search_queries = [
            f"{section_title} {' '.join(key_points)} {' '.join(report_focus)}",
            f"{section_title} {' '.join(report_focus)}",
            section_title
        ]
        
        context = ""
        for query in search_queries:
            ctx = enhanced_retrieval(institute_id, project_id, query, k=12)
            if ctx:
                context = ctx
                break
        
        if not context or len(context) < 100:
            context = all_context[:8000]
        
        prompt = ChatPromptTemplate.from_messages([
            ("system",
             f"You are a professional report writer.\n\n"
             f"Write a {language} language narrative for '{section_title}' section.\n\n"
             f"Context: This is for '{report_name}' focusing on: {', '.join(report_focus)}\n\n"
             f"Requirements:\n"
             f"- 3-5 paragraphs, professional and analytical tone\n"
             f"- Include specific metrics, data points, and insights from context\n"
             f"- Address: {', '.join(key_points)}\n"
             f"- DO NOT add section title or conversational phrases\n"
             f"- Start directly with substantive content\n"
             f"- Use ONLY data from provided context\n"
             f"- If specific data is limited, provide analysis based on available information\n"),
            ("user",
             f"Context:\n\n{{context}}\n\nWrite section content:")
        ])
        
        chain = prompt | llm | StrOutputParser()
        
        try:
             
            content = chain.invoke({"context": context})
            
            if len(content) < 50:
                content = f"This section addresses {section_title.lower()}, covering {', '.join(key_points)}. "\
                         f"Based on the available data, analysis shows consistent progress in these areas."
            
            sections_output.append({
                "title": section_title,
                "content": content,
                "priority": section_info.get('priority', 5),
                "category": section_info.get('category', 'General')
            })
            
            print(f"   ✓ Generated {len(content)} characters")
            
        except Exception as e:
            print(f"   ✗ Error: {e}")
    
    print(f"-> Completed {len(sections_output)} sections")
    return {"sections": sections_output}


# --- Chart Generation Node ---
def generate_charts_node(state: GraphState):
    """Generates Chart.js visualizations"""
    print("---NODE: Generating Charts---")
    
    report_plan = state.get('report_plan', {})
    viz_proposals = report_plan.get('visualizations', [])
    institute_id = state.get('institute_id')
    project_id = state.get('project_id')
    all_context = state.get('all_context', '')
    
    charts = []
    sorted_viz = sorted(viz_proposals, key=lambda x: x.get('priority', 999))
    
    for viz in sorted_viz[:6]:
        chart_title = viz.get('title', 'Data Visualization')
        chart_type = viz.get('type', 'bar')
        chart_topic = viz.get('topic', '')
        
        print(f"-> Creating {chart_type}: {chart_title}")
        
        context = enhanced_retrieval(institute_id, project_id, chart_topic, k=10)
        if not context or len(context) < 100:
            context = all_context[:6000]
        
        prompt = ChatPromptTemplate.from_messages([
            ("system",
             f"Generate Chart.js JSON for a {chart_type} chart.\n\n"
             f"Output ONLY this JSON structure (no markdown):\n"
             f"{{{{\n"
             f"  \"labels\": [\"Label1\", \"Label2\", \"Label3\", \"Label4\", \"Label5\"],\n"
             f"  \"datasets\": [{{{{\n"
             f"    \"label\": \"Dataset Name\",\n"
             f"    \"data\": [10, 20, 30, 40, 50],\n"
             f"    \"backgroundColor\": [\"#3b82f6\", \"#10b981\", \"#f59e0b\", \"#ef4444\", \"#8b5cf6\"]\n"
             f"  }}}}]\n"
             f"}}}}\n\n"
             f"Use data from context. If limited, use reasonable estimates."),
            ("user", f"Topic: {chart_topic}\n\nContext:\n\n{{context}}\n\nJSON:")
        ])
        
        chain = prompt | llm | StrOutputParser()
        
        try:
             
            response = chain.invoke({"context": context})
            
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.startswith("```"):
                response = response[3:]
            if response.endswith("```"):
                response = response[:-3]
            response = response.strip()
            
            chart_data = json.loads(response)
            
            charts.append({
                "title": chart_title,
                "type": chart_type,
                "data": chart_data,
                "topic": chart_topic,
                "priority": viz.get('priority', 3)
            })
            
            print(f"   ✓ Generated")
            
        except Exception as e:
            print(f"   ✗ Error: {e}")
    
    print(f"-> Completed {len(charts)} charts")
    return {"charts": charts}


# --- Table Generation Node ---
def generate_tables_node(state: GraphState):
    """Generates data tables"""
    print("---NODE: Generating Tables---")
    
    report_plan = state.get('report_plan', {})
    table_proposals = report_plan.get('tables', [])
    institute_id = state.get('institute_id')
    project_id = state.get('project_id')
    all_context = state.get('all_context', '')
    
    tables = []
    
    for table_info in table_proposals[:4]:
        table_title = table_info.get('title', 'Data Table')
        table_topic = table_info.get('topic', '')
        
        print(f"-> Creating table: {table_title}")
        
        context = enhanced_retrieval(institute_id, project_id, table_topic, k=10)
        if not context or len(context) < 100:
            context = all_context[:6000]
        
        prompt = ChatPromptTemplate.from_messages([
            ("system",
             f"Generate table JSON.\n\n"
             f"Output (no markdown):\n"
             f"{{{{\n"
             f"  \"headers\": [\"Column1\", \"Column2\", \"Column3\"],\n"
             f"  \"rows\": [\n"
             f"    [\"Value1\", \"Value2\", \"Value3\"],\n"
             f"    [\"Value1\", \"Value2\", \"Value3\"]\n"
             f"  ]\n"
             f"}}}}\n\n"
             f"Include 5-10 rows from context."),
            ("user", f"Topic: {table_topic}\n\nContext:\n\n{{context}}\n\nJSON:")
        ])
        
        chain = prompt | llm | StrOutputParser()
        
        try:
             
            response = chain.invoke({"context": context})
            
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.startswith("```"):
                response = response[3:]
            if response.endswith("```"):
                response = response[:-3]
            response = response.strip()
            
            table_data = json.loads(response)
            
            tables.append({
                "title": table_title,
                "type": table_info.get('type', 'comparison'),
                "data": table_data
            })
            
            print(f"   ✓ Generated")
            
        except Exception as e:
            print(f"   ✗ Error: {e}")
    
    print(f"-> Completed {len(tables)} tables")
    return {"tables": tables}


# --- Final Compilation Node ---
def compile_final_report_node(state: GraphState):
    """Compiles everything into final report"""
    print("---NODE: Compiling Final Report---")
    
    report_plan = state.get('report_plan', {})
    report_info = report_plan.get('report_info', {})
    report_name = state.get('report_name', 'Report')
    report_desc = state.get('report_desc', '')
    
    final_data = {
        "metadata": {
            "generated_at": datetime.now().isoformat(),
            "institute_id": state.get('institute_id'),
            "project_id": state.get('project_id'),
            "report_name": report_name,
            "report_description": report_desc,
            "report_type": state.get('report_type', 'general'),
            "version": 1,
            "format": state.get('output_format', 'html'),
            "language": state.get('language', 'en')
        },
        "title": report_info.get('title', report_name),
        "report_type": report_info.get('type', state.get('report_type', 'General Report')),
        "period": report_info.get('period', 'N/A'),
        "organization": report_info.get('organization', 'Organization'),
        "executive_summary": state.get('dynamic_summary', ''),
        "kpis": state.get('kpis', []),
        "sections": state.get('sections', []),
        "charts": state.get('charts', []),
        "tables": state.get('tables', []),
        "processed_files": state.get('processed_files_metadata', []),
        "errors": state.get('errors', [])
    }
    
    report_metadata = {
        "total_sections": len(final_data.get('sections', [])),
        "total_charts": len(final_data.get('charts', [])),
        "total_tables": len(final_data.get('tables', [])),
        "total_kpis": len(final_data.get('kpis', [])),
        "files_processed": len(state.get('processed_files_metadata', [])),
    }
    
    print(f"-> Report: {report_metadata['total_sections']} sections, "
          f"{report_metadata['total_charts']} charts, "
          f"{report_metadata['total_kpis']} KPIs")
    
    return {
        "final_report_data": final_data,
        "report_metadata": report_metadata,
        "generation_timestamp": datetime.now().isoformat()
    }

def render_html_report_node(state: GraphState):
    """Generates the final HTML report using LLM instead of Jinja2"""
    print("---NODE: Rendering HTML Report (LLM)---")

    final_data = state.get("final_report_data")
    if not final_data:
        return {"errors": ["Missing final_report_data"]}

    # 1. Define standard HTML Skeleton for the LLM to follow
    # with open("Templates/report_template.html", "r", encoding="utf-8") as f:
    #     html_skeleton = f.read()
    html_skeleton= report

    # 2. Create Prompt
    prompt = ChatPromptTemplate.from_messages([
          ("system",
          "You are an elite report designer and frontend architect specializing in creating professional, "
          "publication-quality HTML reports that are optimized for PDF conversion.\n\n"
          
          "═══════════════════════════════════════════════════════════════════════════════\n"
          "CRITICAL PDF-READY REQUIREMENTS\n"
          "═══════════════════════════════════════════════════════════════════════════════\n\n"
          
          "1. PAGE STRUCTURE & SIZING:\n"
          "   • Use the provided template's page structure EXACTLY\n"
          "   • Each page MUST be A4 size: 210mm width × 297mm height\n"
          "   • Include proper page breaks using 'page-break-after: always' in CSS\n"
          "   • Ensure content doesn't overflow page boundaries\n"
          "   • Use 'page-break-inside: avoid' for elements that shouldn't split across pages\n"
          "   • Add appropriate margins: 15-20mm on all sides\n\n"
          
          "2. TEMPLATE ADHERENCE:\n"
          "   • STRICTLY follow the provided HTML skeleton/template structure\n"
          "   • Preserve ALL CSS classes, IDs, and styling from the template\n"
          "   • Maintain the template's layout hierarchy and design patterns\n"
          "   • Keep all CDN links (Chart.js, Tailwind, etc.) exactly as provided\n"
          "   • Do NOT modify or remove any template styling\n"
          "   • Fill in template placeholders with actual data\n\n"
          
          "3. INTELLIGENT CONTENT ORGANIZATION (MOST CRITICAL):\n"
          "   You will receive data with sections, charts, and tables. Your job is to INTELLIGENTLY\n"
          "   group related content together by analyzing their titles, topics, and keywords.\n\n"
          
          "   ORGANIZATION PATTERN:\n"
          "   ┌─────────────────────────────────────────────────┐\n"
          "   │ TOPIC SECTION (e.g., Placement Statistics)     │\n"
          "   ├─────────────────────────────────────────────────┤\n"
          "   │ 1. Section Narrative Text                       │\n"
          "   │ 2. Related Charts (place immediately after)     │\n"
          "   │ 3. Related Tables (place immediately after)     │\n"
          "   └─────────────────────────────────────────────────┘\n\n"
          
          "   MATCHING LOGIC - Analyze and group by keywords:\n"
          "   \n"
          "   PLACEMENT/CAREER:\n"
          "   • Keywords: placement, career, recruitment, employment, jobs, companies, hired, salary\n"
          "   • Example: 'Placement Overview' section + 'Placement Rate' chart + 'Company List' table\n"
          "   → Group these together in ONE section\n"
          "   \n"
          "   ACADEMIC/STUDENT:\n"
          "   • Keywords: academic, student, performance, grades, examination, results, pass rate, enrollment\n"
          "   • Example: 'Academic Performance' section + 'Grade Distribution' chart + 'Pass Rates' table\n"
          "   → Group these together in ONE section\n"
          "   \n"
          "   FINANCIAL/BUDGET:\n"
          "   • Keywords: financial, budget, revenue, expenditure, funds, accounts, cost, income\n"
          "   • Example: 'Financial Overview' section + 'Revenue Breakdown' chart + 'Budget Allocation' table\n"
          "   → Group these together in ONE section\n"
          "   \n"
          "   RESEARCH/PUBLICATIONS:\n"
          "   • Keywords: research, publication, patents, innovation, papers, journals, citations\n"
          "   • Example: 'Research Output' section + 'Publications by Year' chart + 'Top Papers' table\n"
          "   → Group these together in ONE section\n"
          "   \n"
          "   INFRASTRUCTURE/FACILITIES:\n"
          "   • Keywords: infrastructure, facility, building, campus, equipment, resources, labs\n"
          "   • Example: 'Infrastructure Development' section + 'Facility Growth' chart + 'Lab Details' table\n"
          "   → Group these together in ONE section\n"
          "   \n"
          "   FACULTY/STAFF:\n"
          "   • Keywords: faculty, teacher, staff, employee, personnel, professor, qualification\n"
          "   • Example: 'Faculty Achievements' section + 'Faculty Distribution' chart + 'Qualifications' table\n"
          "   → Group these together in ONE section\n\n"
          
          "   HOW TO MATCH:\n"
          "   1. Read each section title and content\n"
          "   2. Identify the main topic/theme\n"
          "   3. Find charts with similar keywords in title or topic field\n"
          "   4. Find tables with similar keywords in title or topic field\n"
          "   5. Place them together: Section Text → Charts → Tables\n"
          "   6. Keep them in the same page/container when possible\n\n"
          
          "   FLOW STRUCTURE:\n"
          "   • Start with section heading\n"
          "   • Add section narrative/content\n"
          "   • Immediately add related chart(s) below\n"
          "   • Immediately add related table(s) below\n"
          "   • Move to next topic group\n\n"
          
          "4. CHART IMPLEMENTATION:\n"
          "   • For EACH chart in the data, create:\n"
          "     <div class='chart-wrapper'>\n"
          "       <h3 class='chart-title'>[Chart Title from data]</h3>\n"
          "       <div class='chart-container'>\n"
          "         <canvas id='chart_1' width='800' height='400'></canvas>\n"
          "       </div>\n"
          "     </div>\n"
          "   \n"
          "   • Place each chart IMMEDIATELY after its related section text\n"
          "   • Use sequential IDs: chart_1, chart_2, chart_3, etc.\n"
          "   \n"
          "   • At the END of <body>, BEFORE </body>, add Chart.js initialization:\n"
          "     <script>\n"
          "       document.addEventListener('DOMContentLoaded', function() {{\n"
          "         // Chart 1\n"
          "         const ctx1 = document.getElementById('chart_1').getContext('2d');\n"
          "         new Chart(ctx1, {{\n"
          "           type: 'bar',  // Use type from data: bar, line, pie, doughnut, radar\n"
          "           data: {{\n"
          "             labels: ['Label1', 'Label2', 'Label3'],  // From data.labels\n"
          "             datasets: [{{\n"
          "               label: 'Dataset Name',  // From data.datasets[0].label\n"
          "               data: [10, 20, 30],  // From data.datasets[0].data\n"
          "               backgroundColor: ['#3b82f6', '#10b981', '#f59e0b']  // From data or use defaults\n"
          "             }}]\n"
          "           }},\n"
          "           options: {{\n"
          "             responsive: true,\n"
          "             maintainAspectRatio: true,\n"
          "             plugins: {{\n"
          "               legend: {{ display: true, position: 'top' }},\n"
          "               title: {{ display: false }}\n"
          "             }}\n"
          "           }}\n"
          "         }});\n"
          "         \n"
          "         // Chart 2...\n"
          "         // Chart 3...\n"
          "       }});\n"
          "     </script>\n"
          "   \n"
          "   • Chart types available: bar, line, pie, doughnut, radar, polarArea\n"
          "   • Default colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']\n"
          "   • CRITICAL: Canvas IDs in HTML MUST match IDs in JavaScript\n\n"
          
          "5. TABLE IMPLEMENTATION:\n"
          "   • For EACH table in the data, create:\n"
          "     <div class='table-wrapper'>\n"
          "       <h3 class='table-title'>[Table Title from data]</h3>\n"
          "       <table class='data-table'>\n"
          "         <thead>\n"
          "           <tr>\n"
          "             <th>[Column 1 from data.headers]</th>\n"
          "             <th>[Column 2 from data.headers]</th>\n"
          "           </tr>\n"
          "         </thead>\n"
          "         <tbody>\n"
          "           <tr>\n"
          "             <td>[Row 1 Col 1 from data.rows]</td>\n"
          "             <td>[Row 1 Col 2 from data.rows]</td>\n"
          "           </tr>\n"
          "           <!-- Include ALL rows from data -->\n"
          "         </tbody>\n"
          "       </table>\n"
          "     </div>\n"
          "   \n"
          "   • Place each table IMMEDIATELY after its related chart(s)\n"
          "   • If no related chart, place immediately after related section text\n"
          "   • Include ALL rows from data.rows (do NOT truncate)\n"
          "   • Apply proper table classes from template\n"
          "   • Use alternating row colors for readability\n\n"
          
          "6. DATA COMPLETENESS:\n"
          "   • Include EVERY piece of data from the JSON:\n"
          "     ✓ Report metadata: title, organization, date, period\n"
          "     ✓ Executive summary: full text\n"
          "     ✓ ALL KPIs: metric, value, category, icon, trend\n"
          "     ✓ ALL sections: title + full content (don't truncate text)\n"
          "     ✓ ALL charts: with complete data from charts array\n"
          "     ✓ ALL tables: with all headers and all rows\n"
          "   \n"
          "   • Do NOT skip any content\n"
          "   • Do NOT use placeholders like '...' or '[more data]'\n"
          "   • Do NOT summarize - include full text\n\n"
          
          "7. VISUAL QUALITY & STYLING:\n"
          "   • Use the template's CSS classes consistently\n"
          "   • Maintain professional typography hierarchy:\n"
          "     - Page title: 32-36px, bold\n"
          "     - Section headings: 24-28px, bold\n"
          "     - Subsection headings: 18-20px, semi-bold\n"
          "     - Body text: 14-16px, regular\n"
          "   \n"
          "   • Spacing guidelines:\n"
          "     - Between major sections: 40-50px\n"
          "     - Between paragraphs: 12-15px\n"
          "     - Around charts/tables: 25-30px\n"
          "   \n"
          "   • Visual enhancements:\n"
          "     - Use subtle shadows: box-shadow: 0 2px 4px rgba(0,0,0,0.1)\n"
          "     - Add borders to separate sections\n"
          "     - Use background colors from template\n"
          "     - Ensure high contrast for readability (min 4.5:1 ratio)\n\n"
          
          "8. KPI DISPLAY:\n"
          "   • Display ALL KPIs from data.kpis array\n"
          "   • Use grid layout: 2-4 columns depending on count\n"
          "   • Each KPI card should include:\n"
          "     - Icon (emoji or FontAwesome from data)\n"
          "     - Metric name\n"
          "     - Value (large, bold)\n"
          "     - Category label\n"
          "     - Optional: Trend indicator\n"
          "   \n"
          "   • Category-based colors (if not in template):\n"
          "     - Academic: Blue gradient (#4facfe → #00f2fe)\n"
          "     - Financial: Pink gradient (#f093fb → #f5576c)\n"
          "     - Research: Green gradient (#43e97b → #38f9d7)\n"
          "     - Placement: Yellow-Pink gradient (#fa709a → #fee140)\n"
          "     - General: Purple gradient (#667eea → #764ba2)\n"
          "   \n"
          "   • Make KPI cards visually prominent and easy to scan\n\n"
          
          "9. OUTPUT FORMAT:\n"
          "   • Return ONLY the complete, valid HTML document\n"
          "   • Start with: <!DOCTYPE html>\n"
          "   • End with: </html>\n"
          "   • NO markdown code blocks (no ```html or ``` or ```)\n"
          "   • NO explanatory text before or after HTML\n"
          "   • NO comments explaining what you did\n"
          "   • NO placeholder content - everything must be real data\n"
          "   • Proper indentation for readability (2 or 4 spaces)\n\n"
          
          "10. PRINT/PDF OPTIMIZATION:\n"
          "   • Include @media print CSS rules in template\n"
          "   • Set proper print settings:\n"
          "     @media print {{\n"
          "       @page {{ size: A4; margin: 15mm; }}\n"
          "       body {{ background: white; }}\n"
          "       .page {{ page-break-after: always; }}\n"
          "       .no-print {{ display: none; }}\n"
          "     }}\n"
          "   \n"
          "   • Ensure charts render in PDF (use proper canvas sizing)\n"
          "   • Use print-safe fonts (Arial, Helvetica, sans-serif)\n"
          "   • Avoid pure black (#000), use #1a1a1a for better printing\n"
          "   • Test layout: Each page should be exactly A4 size\n\n"
          
          "═══════════════════════════════════════════════════════════════════════════════\n"
          "CONTENT ORGANIZATION ALGORITHM\n"
          "═══════════════════════════════════════════════════════════════════════════════\n"
          "STEP 1: Analyze all sections and identify main topics\n"
          "STEP 2: For each section, look for charts with matching keywords\n"
          "STEP 3: For each section, look for tables with matching keywords\n"
          "STEP 4: Group section + matching charts + matching tables together\n"
          "STEP 5: Arrange in logical order: Overview → Specific Topics → Conclusion\n"
          "STEP 6: Place related visualizations immediately after narrative text\n\n"
          
          "EXAMPLE GROUPING:\n"
          "If you find:\n"
          "  • Section: 'Placement Statistics and Outcomes'\n"
          "  • Chart: 'Placement Rate by Department'\n"
          "  • Chart: 'Top Recruiting Companies'\n"
          "  • Table: 'Placement Data 2024'\n"
          "\n"
          "Then create:\n"
          "  <section class='content-section'>\n"
          "    <h2>Placement Statistics and Outcomes</h2>\n"
          "    <p>[Section content text]</p>\n"
          "    \n"
          "    <div class='chart-wrapper'>\n"
          "      <canvas id='chart_1'></canvas>\n"
          "    </div>\n"
          "    \n"
          "    <div class='chart-wrapper'>\n"
          "      <canvas id='chart_2'></canvas>\n"
          "    </div>\n"
          "    \n"
          "    <div class='table-wrapper'>\n"
          "      <table>...</table>\n"
          "    </div>\n"
          "  </section>\n\n"
          
          "═══════════════════════════════════════════════════════════════════════════════\n"
          "QUALITY CHECKLIST (Verify before output)\n"
          "═══════════════════════════════════════════════════════════════════════════════\n"
          "□ Related content is grouped together by topic (section + charts + tables)\n"
          "□ Every chart has a <canvas> with unique ID (chart_1, chart_2, etc.)\n"
          "□ Chart.js initialization code exists at end of body with matching IDs\n"
          "□ Every table has <thead> and <tbody> with complete data\n"
          "□ All KPIs are displayed with proper formatting\n"
          "□ No content from JSON is missing or truncated\n"
          "□ Pages are A4 sized (210mm × 297mm) with proper margins\n"
          "□ Template structure and CSS classes are preserved\n"
          "□ No markdown formatting in output (no ``` anywhere)\n"
          "□ Professional appearance, ready to convert to PDF\n"
          "□ Charts and tables appear immediately after their related section text\n\n"
          
          "═══════════════════════════════════════════════════════════════════════════════\n"
          "FINAL INSTRUCTION\n"
          "═══════════════════════════════════════════════════════════════════════════════\n"
          "Analyze the data carefully. Identify topics and intelligently group related\n"
          "sections, charts, and tables together. Create a professional, publication-ready\n"
          "HTML report that looks like it was designed by an expert. The report should be\n"
          "perfectly organized with related content flowing naturally together.\n"),
          
          ("user",
          "TEMPLATE/SKELETON:\n"
          "═══════════════════════════════════════════════════════════════\n"
          "{skeleton}\n"
          "═══════════════════════════════════════════════════════════════\n\n"
          
          "COMPLETE DATA (JSON):\n"
          "═══════════════════════════════════════════════════════════════\n"
          "{data}\n"
          "═══════════════════════════════════════════════════════════════\n\n"
          
          "Instructions:\n"
          "1. Analyze the data structure carefully\n"
          "2. Identify which sections, charts, and tables are related by topic\n"
          "3. Group them together in the output\n"
          "4. Follow the template structure\n"
          "5. Include ALL data\n"
          "6. Generate complete HTML code\n\n"
          
          "Generate the complete, publication-ready HTML report now.\n"
          "Output ONLY the HTML code with no markdown formatting:")
      ])

    # 3. Invoke LLM (Using a larger context model if available is better here, strictly following your config though)
    # We use a slightly higher temperature here for creative layout, but keep it low for data accuracy.
    

    chain = prompt | html_gen_llm | StrOutputParser()

    try:
        print("-> Generating HTML with LLM (this may take a moment)...")
        # Convert data to string for the prompt
        data_str = json.dumps(final_data, ensure_ascii=False)
         
        html_output = chain.invoke({
            "skeleton": html_skeleton,
            "data": data_str
        })

        # Clean up if LLM accidentally added markdown fences
        html_output = html_output.replace("```html", "").replace("```", "")

        print(f"-> HTML Generated successfully ({len(html_output)} characters)")

        # Save locally for verification
        # os.makedirs("output_reports", exist_ok=True)
        # filename = f"output_reports/LLM_Report_{state['institute_id']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
        # with open(filename, "w", encoding="utf-8") as f:
        #     f.write(html_output)
        # print(f"-> 💾 Saved local copy: {filename}")

        return {"html_report": html_output}

    except Exception as e:
        error_msg = f"LLM HTML Rendering failed: {str(e)}"
        print(f"-> ✗ {error_msg}")
        return {"errors": [error_msg]}


# --- Helper Functions ---



# --- Build Graph ---
def create_report_agent():
    """Creates the optimized agent graph"""
    graph = StateGraph(GraphState)
    
    # Add nodes
    graph.add_node("validate_input", validate_input_node)
    graph.add_node("process_files", process_files_node)
    graph.add_node("analyze_report_requirements", analyze_report_requirements_node)
    graph.add_node("summarize_context", summarize_context_node)
    graph.add_node("plan_report", plan_report_node)
    graph.add_node("generate_kpis", generate_kpis_node)
    graph.add_node("generate_sections", generate_sections_node)
    graph.add_node("generate_charts", generate_charts_node)
    graph.add_node("generate_tables", generate_tables_node)
    graph.add_node("compile_final_report", compile_final_report_node)
    graph.add_node("render_html_report", render_html_report_node)
    
    # Define flow
    graph.set_entry_point("validate_input")
    graph.add_edge("validate_input", "process_files")
    graph.add_edge("process_files", "analyze_report_requirements")
    graph.add_edge("analyze_report_requirements", "summarize_context")
    graph.add_edge("summarize_context", "plan_report")
    graph.add_edge("plan_report", "generate_kpis")
    graph.add_edge("generate_kpis", "generate_sections")
    graph.add_edge("generate_sections", "generate_charts")
    graph.add_edge("generate_charts", "generate_tables")
    graph.add_edge("generate_tables", "compile_final_report")
    graph.add_edge("compile_final_report", "render_html_report")
    graph.add_edge("render_html_report", END)
    
    return graph.compile()


# --- Main Agent ---
app_graph = create_report_agent()


def generate_report(
  file_paths: List[str],
  institute_id: int,
  project_id: int,
  user_role: str = "admin",
  report_year: Optional[str] = None,
  output_format: str = "html",
  language: str = "en",
  report_name : str = "",
  report_desc : str = ""
) -> Dict[str, Any]:
  """Main entry point for report generation"""
  
  initial_state: GraphState = {
    "file_paths": file_paths or [],
    "institute_id": institute_id or 0,
    "project_id": project_id or 0,
    "user_role": user_role or "viewer",
    "report_year": report_year or str(datetime.now().year),
    "sections_to_include": [],
    "output_format": output_format or "html",
    "language": language or "en",
    "report_desc": report_desc,
    "report_name" : report_name
  }
  
  print("=" * 80)
  print("🚀 ANNUAL REPORT GENERATION AGENT")
  print("=" * 80)
  print(f"Institute: {institute_id} | Project: {project_id}")
  print(f"Files: {len(file_paths)}")
  print("=" * 80)
  
  try:
    final_state = app_graph.invoke(initial_state)
  except Exception as e:
    tb = traceback.format_exc()
    print(f"\n-> ✗ Error during generation: {e}\n{tb}")
    return {
      "final_report_data": None,
      "html_report": None,
      "metadata": None,
      "errors": [str(e)],
      "warnings": [],
      "traceback": tb
    }
  
  print("\n" + "=" * 80)
  print("✅ GENERATION COMPLETE")
  print("=" * 80)
  
  result = {
    "final_report_data": final_state.get("final_report_data") if final_state else None,
    "html_report": final_state.get("html_report") if final_state else None,
    "metadata": final_state.get("report_metadata") if final_state else None,
    "errors": final_state.get("errors", []) if final_state else ["Agent did not return a final state."],
    "warnings": final_state.get("validation_results", {}).get("warnings", []) if final_state else []
  }

  return result