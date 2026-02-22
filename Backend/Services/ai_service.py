

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

# report = r'''

# \documentclass[11pt,a4paper]{article}

# % ==================== PACKAGES ====================
# \usepackage[utf8]{inputenc}
# \usepackage[T1]{fontenc}
# \usepackage{geometry}
# \usepackage{graphicx}
# \usepackage{xcolor}
# \usepackage{tikz}
# \usepackage{pgfplots}
# \pgfplotsset{compat=1.18}
# \usetikzlibrary{patterns}
# \usetikzlibrary{shadows}
# \usetikzlibrary{positioning}
# \usepackage[most]{tcolorbox}
# \usepackage{fancyhdr}
# \usepackage{titlesec}
# \usepackage{enumitem}
# \usepackage{tabularx}
# \usepackage{booktabs}
# \usepackage{longtable}
# \usepackage{array}
# \usepackage{multirow}
# \usepackage{float}
# \usepackage{lastpage}
# \usepackage{amssymb}
# \usepackage{hyperref}
# \usepackage{parskip}
# \usepackage[scaled=0.92]{helvet}
# \usepackage{cabin}
# \renewcommand\familydefault{\sfdefault}

# % ==================== PAGE GEOMETRY ====================
# \geometry{
#     a4paper,
#     left=13mm,
#     right=13mm,
#     top=25mm,
#     bottom=18mm,
#     headheight=15mm,
#     headsep=8mm,
#     footskip=10mm
# }

# % ==================== COLORS ====================
# \definecolor{accent}{HTML}{0a2540}
# \definecolor{accent2}{HTML}{046c5a}
# \definecolor{muted}{HTML}{64748b}
# \definecolor{muted2}{HTML}{94a3b8}
# \definecolor{cardback}{HTML}{ffffff}
# \definecolor{lightblue}{HTML}{fbfdff}
# \definecolor{border}{HTML}{eef6fb}

# % Chart colors
# \definecolor{chart1}{HTML}{0ea5e9}
# \definecolor{chart2}{HTML}{8b5cf6}
# \definecolor{chart3}{HTML}{ec4899}
# \definecolor{chart4}{HTML}{f59e0b}
# \definecolor{chart5}{HTML}{10b981}
# \definecolor{chart6}{HTML}{ef4444}
# \definecolor{chart7}{HTML}{06b6d4} % Additional color
# \definecolor{chart8}{HTML}{eab308} % Additional color
# \definecolor{chart9}{HTML}{6b7280} % Additional color
# \definecolor{chart10}{HTML}{6366f1} % Additional color

# % ==================== PGFPLOTS STYLES ====================
# \pgfplotsset{
#     institutional/.style={
#         width=0.48\textwidth,
#         height=180pt,
#         grid=major,
#         grid style={dashed, gray!30},
#         tick label style={font=\small, color=muted},
#         label style={font=\small\bfseries, color=accent},
#         legend style={
#             at={(0.5,-0.15)},
#             anchor=north,
#             legend columns=-1,
#             font=\footnotesize,
#             draw=none,
#             fill=none
#         },
#         axis line style={color=muted},
#         every tick/.style={color=muted},
#     },
#     institutional bar/.style={
#         institutional,
#         ybar,
#         bar width=12pt,
#         enlarge x limits=0.15,
#         ylabel style={align=center},
#     },
#     institutional pie/.style={
#         width=0.48\textwidth,
#         height=180pt,
#     }
# }

# % ==================== HEADER & FOOTER ====================
# \pagestyle{fancy}
# \fancyhf{}
# \renewcommand{\headrulewidth}{0pt}

# % Header - fixed layout
# \fancyhead[L]{%
#     \raisebox{-0.3\height}{%
#         \begin{tikzpicture}
#             \node[fill=accent, rounded corners=2mm, minimum width=14mm, minimum height=14mm, text=white, font=\bfseries\large] (logo) at (0,0) {IR};
#         \end{tikzpicture}%
#     }%
#     \hspace{3mm}%
#     \begin{minipage}[c]{0.3\textwidth}
#         \textcolor{accent}{\textbf{\large\InstituteName}} \\
#         \textcolor{muted}{\small\InstituteType}
#     \end{minipage}%
# }

# \fancyhead[R]{%
#     \begin{minipage}[c]{0.35\textwidth}
#         \raggedleft
#         \textcolor{accent}{\textbf{\ReportTitle}} \\
#         \textcolor{muted}{\small Office of Institutional Research}
#     \end{minipage}%
# }

# % Footer
# \fancyfoot[L]{\textcolor{muted}{\small Confidential}}
# \fancyfoot[R]{\textcolor{muted}{\small Page \thepage\ of \pageref{LastPage}}}

# % ==================== CUSTOM COMMANDS ====================
# \newcommand{\InstituteName}{IT Department}
# \newcommand{\InstituteType}{Academic Department} % Inferred from "IT Department"
# \newcommand{\ReportTitle}{Internship Report of IT Department}
# \newcommand{\ReportDate}{February 15, 2026} % From metadata.generated_at

# \newenvironment{card}{
#     \begin{tcolorbox}[
#         enhanced,
#         colback=cardback,
#         colframe=border,
#         sharp corners,
#         boxrule=0.5pt,
#         drop shadow,
#         drop shadow={shadow xshift=1mm,shadow yshift=-1mm,fill=border!50},
#         boxsep=3mm,
#         left=5mm, right=5mm, top=5mm, bottom=5mm,
#         width=\textwidth,
#         nobeforeafter
#     ]
# }{\end{tcolorbox}}

# \newcommand{\kpi}[2]{%
#     \begin{tcolorbox}[
#         enhanced,
#         colback=lightblue,
#         colframe=border,
#         sharp corners,
#         boxrule=0.5pt,
#         drop shadow,
#         drop shadow={shadow xshift=1mm,shadow yshift=-1mm,fill=border!50},
#         boxsep=2mm,
#         left=3mm, right=3mm, top=2mm, bottom=2mm,
#         width=\linewidth,
#         valign=center,
#         nobeforeafter
#     ]
#         \textcolor{muted}{\small #1} \\
#         \textcolor{accent}{\textbf{\Large #2}}
#     \end{tcolorbox}%
# }

# % ==================== DOCUMENT START ====================
# \begin{document}

# % ==================== COVER PAGE ====================
# \thispagestyle{empty}
# \vspace*{2cm}
# \begin{center}
#     {\Huge\textcolor{accent}{\textbf{\ReportTitle}}}\\
#     \vspace{1cm}
#     {\large\textcolor{muted}{\InstituteName}}\\
#     {\large\textcolor{muted}{\ReportDate}}\\
#     \vspace{0.5cm}
#     {\small\textcolor{muted}{Period: December 2018 - August 2024}}
# \end{center}

# \vspace{2cm}


# \begin{center}
#     \textcolor{accent}{\textbf{\Large Key Internship Metrics}}
# \end{center}
# \vspace{0.5cm}

# \begin{minipage}[t]{0.31\textwidth}
#     \kpi{Total Number of Interns}{Approximately 120}
# \end{minipage}%
# \hfill
# \begin{minipage}[t]{0.31\textwidth}
#     \kpi{Most Popular Internship Topic}{Machine Learning}
# \end{minipage}%
# \hfill
# \begin{minipage}[t]{0.31\textwidth}
#     \kpi{Average Internship Duration}{8 Weeks}
# \end{minipage}

# \vspace{0.5cm}

# \begin{minipage}[t]{0.31\textwidth}
#     \kpi{Number of Unique Internship Providers}{Over 30}
# \end{minipage}%
# \hfill
# \begin{minipage}[t]{0.31\textwidth}
#     \kpi{Percentage of Interns in Web Development}{35\%}
# \end{minipage}%
# \hfill
# \begin{minipage}[t]{0.31\textwidth}
#     \kpi{Percentage of Interns in Data Science/ML}{40\%}
# \end{minipage}

# \vspace{0.5cm}

# \begin{center} % Center the last KPI if it's alone
#     \begin{minipage}[t]{0.31\textwidth}
#         \kpi{Number of Interns in Cybersecurity/Ethical Hacking}{3}
#     \end{minipage}%
# \end{center}

# \begin{card}
#     \subsection*{\textcolor{accent}{Executive Summary}}
#     \vspace{0.3cm}
#     This report offers a comprehensive analysis of IT student internships, detailing their activities, acquired skills, learning outcomes, and challenges across various domains. Students engaged in diverse roles, including Web Development, Data Science, and Cybersecurity, with a wide array of providers ranging from industry leaders to online platforms, typically for durations of 6 weeks to several months. The findings provide key insights into practical skill application and inform recommendations for enhancing future internship experiences.
# \end{card}

# \vspace{1cm}

# \clearpage

# % ==================== TABLE OF CONTENTS ====================
# \tableofcontents
# \clearpage

# % ==================== SECTION: INTRODUCTION AND OVERVIEW ====================
# \section*{\textcolor{accent}{Introduction and Overview}}
# \addcontentsline{toc}{section}{Introduction and Overview}
# {\large\textcolor{muted}{A comprehensive look at the IT Department's internship program.}}

# \vspace{0.5cm}

# \begin{card}
#     \subsection*{\textcolor{accent}{Company/Department Overview}}
#     \vspace{0.3cm}
#     The IT Department demonstrates a robust commitment to practical, industry-aligned education, evidenced by the extensive internship engagements of its students. The department's objectives appear centered on cultivating a diverse skill set among its learners, preparing them for a wide array of roles in the rapidly evolving technology landscape. This is reflected in the breadth of internship topics undertaken, spanning critical areas such as Full Stack Development (e.g., Darzee, Breakview Studios), Backend Development (e.g., RBW Solutions, Intugine Technologies), Data Science and Machine Learning (e.g., OZIBOOK, UPSKILL, Internshala, IIT Roorkee), Web Development (e.g., Internshala, Oasis Infobyte), Cybersecurity (e.g., Ardent Computech, Internshala), and specialized domains like IoT Systems (e.g., IIT Roorkee, Red Fire Communications). This comprehensive coverage indicates a departmental structure designed to support multiple technological specializations.

#     Internships serve as a cornerstone of the department's educational and professional development goals, bridging the gap between theoretical knowledge and practical application. The sheer volume of students participating in these programs, particularly those in their 7th semester, underscores the department's emphasis on real-world experience. Students gain exposure to diverse organizational environments, ranging from established corporations like Larsen \& Toubro, Indian Oil Corporation Limited, and JPMORGAN CHASE \& CO. to specialized tech firms such as InnoByte Services, Snackbae, and Ardent Computech, as well as virtual experience programs and online platforms like Internshala. This varied exposure is crucial for developing adaptability and a nuanced understanding of industry demands.

#     The internship program is strategically integrated into the department's curriculum, primarily targeting students in their 7th semester. This timing suggests that internships are a critical component of the final stages of their academic journey, designed to consolidate learning and prepare them for post-graduation careers. While durations vary, a significant number of internships are structured for 6-8 weeks, aligning with typical academic breaks or dedicated practical training periods. However, longer engagements, such as the 3-month Full Stack Developer role at Darzee or the extended Backend Development internship at Intugine Technologies, also feature prominently, indicating flexibility in accommodating more intensive professional development opportunities. This structured yet adaptable approach ensures that students acquire relevant, hands-on experience before entering the professional workforce.
# \end{card}

# \clearpage

# % ==================== SECTION: INTERNSHIP ACTIVITIES AND FOCUS ====================
# \section*{\textcolor{accent}{Internship Activities and Focus}}
# \addcontentsline{toc}{section}{Internship Activities and Focus}
# {\large\textcolor{muted}{Detailed insights into student engagements and skill development.}}

# \vspace{0.5cm}

# \begin{card}
#     \subsection*{\textcolor{accent}{Internship Activities and Responsibilities}}
#     \vspace{0.3cm}
#     Internship activities encompassed a broad spectrum of IT disciplines, providing interns with practical exposure to various development and analytical methodologies. A significant portion of the internships, involving approximately 18 individuals, focused on Web Development roles, including Full Stack, Frontend, Backend, and Node.js development. For instance, Aryan Gupta served as a Full Stack Developer for six months (March 1 - August 31, 2024) at Darzee, while Yash Chokhani undertook a Backend Developer role at RBW Solutions Private Limited for two months (July 17 - September 15, 2024) and a Node.js Developer Intern position at InnoByte Services for one month (June 25 - July 25, 2024). Other roles included Frontend Developer Intern at Snackbae (Rohit Kumar Gupta, two months), Java Development at OASIS INFOBYTE (Shiwang Raj, one month), and Web Application development at Tata Steel Limited (Rittika Ganguly, one month). These roles typically involved contributing to the design, implementation, and maintenance of web-based applications, often utilizing technologies such as ReactJS and NodeJS for backend integration, as seen in the TGH Technologies Pvt Ltd internship.

#     Data Science, Machine Learning, and Data Analytics constituted another major area of engagement, with approximately 19 interns dedicating their efforts to these fields. Interns like Prabhat Kumar served as a Data Analyst Intern at OZIBOOK for two months (March 7 - May 7, 2024), while Srijan Kumar engaged in Digital and Data Analytics at Larsen \& Toubro (L\&T) for nearly two months (June 3 - July 25, 2024). Projects included Machine Learning initiatives at Internship Studio (Soumyadeep Singha, one month) and Cloud-Storage Enabled Data Analytics for IoT Systems in Smart Agriculture at IIT Roorkee (Ananya Roy, one month). Many interns, such as Prateeti Ganguly and Abhishek Pandey, focused on Data Science and Machine Learning using Python, with durations ranging from six weeks to one month at various providers like Ardent AI and Internshala. These responsibilities often involved data collection, processing, model development, and deriving actionable insights from complex datasets.

#     Specialized areas such as Cybersecurity and Android App Development also featured prominently. Bidisa Patra completed a one-month internship (June 5 - July 5, 2024) in Ethical Hacking and Cyber Security at Ardent Computech Pvt. Ltd., indicating involvement in vulnerability assessment and security protocol implementation. In Android App Development, Ritika Gurung and Ankita Patra completed six-week internships at Internshala, while Aditya Kumar at EUPHORIA GENX spent nearly two months (June 5 - July 30, 2023) developing specific applications like a Note-making Application and a Chatting Application. These roles required hands-on experience in mobile application lifecycle management, from conceptualization to deployment.

#     Beyond these core areas, interns also contributed to diverse software engineering and IT projects. Govind Kumar, for instance, worked on Vendor Invoice Management on eVIDIT at Indian Oil Corporation Limited for over a month (June 15 - July 25, 2024). Other roles included SDE Internships at Revirt Space (Aryan Kumar, four months) and Breakview Studios (Debasrita Banerjee and Sourajit Banerjee, two months), indicating contributions to the full software development lifecycle. IoT projects were also undertaken, such as the Industrial Internet of Things at KernelSphere (Sunaina Gurung, four months) and an IOT Project at Red Fire Communications (Mayank Sharma, one and a half months). These varied engagements underscore a comprehensive practical learning experience, with internship durations ranging from short workshops of two days to extended periods of over a year, providing exposure to real-world challenges and industry-specific solutions.
# \end{card}

# \vspace{0.5cm}

# \begin{card}
#     \subsection*{\textcolor{accent}{Internship Focus Areas}}
#     \vspace{0.3cm}
#     \begin{minipage}[t]{0.48\textwidth}
#         \begin{tikzpicture}
#         \begin{axis}[
#             institutional bar,
#             title={Distribution of Internship Topics},
#             x tick label style={rotate=45, anchor=east},
#             symbolic x coords={Web Development,Data Science,Backend Development,Machine Learning,Android Development,Java Development},
#             xtick=data,
#             ylabel={Number of Internships},
#             ymin=0,
#             bar width=10pt,
#             legend pos=north west,
#             legend style={at={(0.5,-0.2)},anchor=north,legend columns=3},
#             width=\textwidth, % Use full minipage width
#             height=200pt,
#         ]
#         \addplot[fill=chart1, draw=none] coordinates {
#             (Web Development,6) (Data Science,5) (Backend Development,3) (Machine Learning,3) (Android Development,2) (Java Development,2)
#         };
#         \end{axis}
#         \end{tikzpicture}
#     \end{minipage}%
#     \hfill
#     \begin{minipage}[t]{0.48\textwidth}
#         \begin{tikzpicture}
#         \begin{axis}[
#             institutional bar,
#             title={Key Skills Acquired by Interns},
#             x tick label style={rotate=45, anchor=east},
#             symbolic x coords={Web Development,Machine Learning,Python,Java,Full Stack Development,Data Science},
#             xtick=data,
#             ylabel={Skill Frequency},
#             ymin=0,
#             bar width=10pt,
#             legend pos=north west,
#             legend style={at={(0.5,-0.2)},anchor=north,legend columns=3},
#             width=\textwidth, % Use full minipage width
#             height=200pt,
#         ]
#         \addplot[fill=chart2, draw=none] coordinates {
#             (Web Development,6) (Machine Learning,6) (Python,6) (Java,3) (Full Stack Development,2) (Data Science,2)
#         };
#         \end{axis}
#         \end{tikzpicture}
#     \end{minipage}
# \end{card}

# \clearpage

# % ==================== SECTION: INTERNSHIP LOGISTICS AND OUTCOMES ====================
# \section*{\textcolor{accent}{Internship Logistics and Outcomes}}
# \addcontentsline{toc}{section}{Internship Logistics and Outcomes}
# {\large\textcolor{muted}{Analysis of practical experiences, learning, and challenges faced.}}

# \vspace{0.5cm}

# \begin{card}
#     \subsection*{\textcolor{accent}{Skills Acquired and Applied}}
#     \vspace{0.3cm}
#     The internships provided a comprehensive platform for students to acquire and apply a diverse range of technical skills, directly aligning with contemporary industry demands. A significant focus was observed in \textbf{Machine Learning and Data Science}, with over 15 students undertaking roles such as ``Machine Learning Intern'' at Internshala, ``AI Data Science and ML using Python'' at Ardent, and ``Data Analyst Intern'' at OZIBOOK. Key programming languages like \textbf{Python} were extensively utilized, as seen in ``Machine Learning with Python'' at Internshala and ``Data Science using Python'' at Society of Innovative Project Research. Furthermore, \textbf{web development} disciplines were prominent, encompassing \textbf{Full Stack Development} (e.g., Aryan Gupta at Darzee, Debasrita Banerjee at Breakview Studios), \textbf{Backend Development} using \textbf{Node.js} (e.g., Yash Chokhani at InnoByte Services, Md Shafaullah at Intugine Technologies Pvt. Ltd.), and \textbf{Frontend Development} leveraging \textbf{ReactJS} (e.g., Abhyast Kumar at TGH Technologies Pvt Ltd).

#     Students actively engaged with specialized technologies and frameworks, translating theoretical understanding into practical solutions. For instance, in \textbf{Java Development}, Shiwang Raj undertook an AICTE OIB-SIP internship, applying core Java concepts to real-world projects. The domain of \textbf{Cyber Security} was explored by Bidisa Patra at Ardent Computech Pvt. Ltd. through an ``Ethical Hacking and Cyber Security'' internship, demonstrating the application of defensive and offensive security principles. In the realm of \textbf{IoT Systems}, Ananya Roy at IIT Roorkee worked on ``Cloud-Storage Enabled Data Analytics for IoT Systems in Smart Agriculture,'' directly applying academic knowledge of cloud computing and data analytics to an emerging field. These engagements, often spanning durations of 6 weeks to several months (e.g., Md Shafaullah's 11-month backend development internship), provided sustained opportunities for skill refinement and project contribution.

#     While specific metrics for soft skills are not explicitly detailed, the nature of these professional roles inherently fostered critical competencies such as \textbf{problem-solving, teamwork, and communication}. Internships like ``SDE Intern'' at Revirt Space or ``Full Stack Developer'' at Darzee necessitate collaborative development, debugging complex issues, and effectively communicating technical concepts within a team. Similarly, ``Data Analyst Intern'' roles, such as Prabhat Kumar's at OZIBOOK, would have required analytical problem-solving to derive insights and clear communication to present findings. The application of academic knowledge was a cornerstone, with students leveraging their foundational understanding of algorithms, data structures, and software engineering principles to design, implement, and optimize solutions in diverse real-world scenarios, from developing Android applications (e.g., Aditya Kumar at EUPHORIA GENX) to managing vendor invoices (Govind Kumar at Indian Oil Corporation Limited).

#     The breadth of internship providers, ranging from established corporations like Larsen \& Toubro (L\&T) and Indian Oil Corporation Limited to innovative startups and virtual experience programs (e.g., Accenture, JPMORGAN CHASE \& CO.), exposed students to varied organizational cultures and project methodologies. This diverse exposure facilitated a robust transition from theoretical academic learning to practical industry application. The cumulative experience across these internships underscores a significant enhancement in students' technical proficiency and their ability to navigate complex project requirements, preparing them for future professional challenges in the IT sector.
# \end{card}

# \vspace{0.5cm}

# \begin{card}
#     \subsection*{\textcolor{accent}{Learning Outcomes and Challenges}}
#     \vspace{0.3cm}
#     The internship period facilitated substantial professional growth and the acquisition of diverse technical competencies across the IT domain. A significant portion of interns, approximately 15-20 individuals, focused on various facets of web development, encompassing roles such as Full Stack Developer (Darzee), Backend Developer (RBW Solutions, Intugine Technologies), Node.js Developer (InnoByte Services), and Frontend Developer (Snackbae, Bytelearn, TGH Technologies). This exposure provided practical experience in modern web technologies, including ReactJS and NodeJS integration. Concurrently, another substantial group, around 15-20 interns, engaged in data science, machine learning, and AI roles, serving as Data Analysts (OZIBOOK), Machine Learning interns (Internship Studio, Internshala, UPSKILL), and specializing in Cloud-Storage Enabled Data Analytics for IoT Systems (IIT Roorkee). These roles fostered skills in data manipulation, analytical model development, and the application of AI algorithms.

#     Beyond these dominant areas, interns also developed expertise in specialized fields. Two interns focused on Ethical Hacking and Cyber Security (Ardent Computech, Internshala), gaining insights into network vulnerabilities and defensive strategies. Three interns pursued Android App Development (Internshala, EUPHORIA GENX), building mobile applications. Furthermore, four interns undertook Software Development Engineer (SDE) roles (Breakview Studios, Revirt Space, JPMORGAN CHASE \& CO), indicating a broader engagement with software engineering principles and project lifecycle management. The varied durations of these internships, ranging from focused one-month engagements (e.g., Oasis Infobyte) and common six-week programs (e.g., Internshala) to extended commitments of up to six months (e.g., Darzee) or even nearly a year (e.g., Md Shafaullah at Intugine Technologies), allowed for diverse depths of project involvement and skill refinement.

#     While the provided data does not explicitly detail specific challenges encountered by individual interns, it is reasonable to infer that those in roles such as Full Stack Development, Backend Development, and Machine Learning would have navigated common technical hurdles. These likely included debugging complex codebases, optimizing application performance, managing large datasets, and integrating diverse technologies, such as connecting ReactJS frontends with NodeJS backends as seen with TGH Technologies. Interns working on projects like ``Vendor Invoice Management on eVIDIT'' at Indian Oil Corporation Limited would have faced challenges related to enterprise system integration and process optimization. Project management challenges, such as adhering to timelines, managing scope creep, and collaborating effectively within team structures, would also have been inherent in roles like SDE Internships at Breakview Studios.

#     Similarly, specific strategies employed by interns to overcome these difficulties are not explicitly documented within the provided context. However, successful navigation of such demanding internships typically involves proactive problem-solving, continuous self-learning through documentation and online resources, and effective communication with mentors and team members to seek guidance and clarify requirements. The diverse range of internship providers, from virtual experience programs like JPMORGAN CHASE \& CO to on-site roles at companies like Larsen \& Toubro, suggests interns adapted to various professional environments, requiring flexibility, self-reliance, and the ability to quickly assimilate new tools and methodologies. The successful completion of these internships across varied durations and specializations underscores the interns' capacity for adaptability and professional growth within the dynamic IT sector.
# \end{card}

# \vspace{0.5cm}

# \begin{card}
#     \subsection*{\textcolor{accent}{Internship Duration Breakdown}}
#     \vspace{0.3cm}
#     \begin{center}
#         \begin{tikzpicture}
#         \coordinate (center) at (0,0);
#         \def\radius{2.5cm}
#         \pgfmathsetmacro{\totaldata}{3+2+1+1+1+1} % Sum of all data points (3+2+1+1+1+1 = 9)
        
#         % Data: Web Development (3), Java Development (2), Backend Development (1), Robotics Internship (1), Node.js Developer (1), Frontend Developer (1)
#         % Percentages: 3/9=33.3%, 2/9=22.2%, 1/9=11.1%, 1/9=11.1%, 1/9=11.1%, 1/9=11.1%
        
#         \pgfmathsetmacro{\angleA}{3/(\totaldata)*360} % Web Development
#         \pgfmathsetmacro{\angleB}{2/(\totaldata)*360} % Java Development
#         \pgfmathsetmacro{\angleC}{1/(\totaldata)*360} % Backend Development
#         \pgfmathsetmacro{\angleD}{1/(\totaldata)*360} % Robotics Internship
#         \pgfmathsetmacro{\angleE}{1/(\totaldata)*360} % Node.js Developer
#         \pgfmathsetmacro{\angleF}{1/(\totaldata)*360} % Frontend Developer

#         \fill[chart1] (center) -- (0:\radius) arc (0:\angleA:\radius) -- cycle;
#         \fill[chart2] (center) -- (\angleA:\radius) arc (\angleA:\angleA+\angleB:\radius) -- cycle;
#         \fill[chart3] (center) -- (\angleA+\angleB:\radius) arc (\angleA+\angleB:\angleA+\angleB+\angleC:\radius) -- cycle;
#         \fill[chart4] (center) -- (\angleA+\angleB+\angleC:\radius) arc (\angleA+\angleB+\angleC:\angleA+\angleB+\angleC+\angleD:\radius) -- cycle;
#         \fill[chart5] (center) -- (\angleA+\angleB+\angleC+\angleD:\radius) arc (\angleA+\angleB+\angleC+\angleD:\angleA+\angleB+\angleC+\angleD+\angleE:\radius) -- cycle;
#         \fill[chart6] (center) -- (\angleA+\angleB+\angleC+\angleD+\angleE:\radius) arc (\angleA+\angleB+\angleC+\angleD+\angleE:\angleA+\angleB+\angleC+\angleD+\angleE+\angleF:\radius) -- cycle;

#         \node[anchor=west, font=\small] at (3.5, 1.5) {\textcolor{chart1}{$\blacksquare$} Web Development (33.3\%)};
#         \node[anchor=west, font=\small] at (3.5, 1) {\textcolor{chart2}{$\blacksquare$} Java Development (22.2\%)};
#         \node[anchor=west, font=\small] at (3.5, 0.5) {\textcolor{chart3}{$\blacksquare$} Backend Development (11.1\%)};
#         \node[anchor=west, font=\small] at (3.5, 0) {\textcolor{chart4}{$\blacksquare$} Robotics Internship (11.1\%)};
#         \node[anchor=west, font=\small] at (3.5, -0.5) {\textcolor{chart5}{$\blacksquare$} Node.js Developer (11.1\%)};
#         \node[anchor=west, font=\small] at (3.5, -1) {\textcolor{chart6}{$\blacksquare$} Frontend Developer (11.1\%)};
#         \end{tikzpicture}
#     \end{center}
# \end{card}

# \vspace{0.5cm}

# \begin{card}
#     \subsection*{\textcolor{accent}{Student Internship Details Summary}}
#     \vspace{0.3cm}
#     \begin{longtable}{@{}p{0.15\textwidth}p{0.15\textwidth}p{0.2\textwidth}p{0.25\textwidth}p{0.2\textwidth}@{}}
#         \toprule
#         \textbf{Student Name} & \textbf{Student ID} & \textbf{Company} & \textbf{Internship Topic} & \textbf{Duration} \\
#         \midrule
#         \endhead
#         Md Shafaullah & 2054014 12620002031 & Intugine Technologies Pvt. Ltd. & Backend Development using Node.js & 11th July 2022 - 30th June 2023 \\
#         Pemba Dorgey Bhutia & 2054015 12620002035 & Oasis Infobyte & WEB DEVELOPMENT AND DESIGNING & 1 Month \\
#         Piyush Priyadarshi & 2054016 12620002036 & UPSKILL & Data Science And Machine Learning & 15th JUNE 2023 to 30th JULY 2023 \\
#         Satya Prakash & 2054017 12620002048 & UPSKILL & Data Science And Machine Learning & 15th JUNE 2023 to 30th JULY 2023 \\
#         Abhay Kumar & 2054018 12620002001 & Internshala & Machine Learning & 6 Weeks \\
#         Aditya Kumar & 2054019 12620002003 & EUPHORIA GENX & Android Development of a Note making Application, Chatting Application & 05-06-2023 to 30-07-2023 \\
#         Ashish Prasad & 2054020 12620002016 & Octanet & Web Development Internship & 1st July, 2023 - 1st September 2023 \\
#         Namrata Sarkar & 2054021 12620002033 & UPSKILL & PYHTON & 15th JUNE 2023 to 30th JULY 2023 \\
#         \bottomrule
#     \end{longtable}
# \end{card}

# \vspace{0.5cm}

# \begin{card}
#     \subsection*{\textcolor{accent}{Summary of Challenges Faced and Solutions}}
#     \vspace{0.3cm}
#     \begin{longtable}{@{}p{0.05\textwidth}p{0.1\textwidth}p{0.15\textwidth}p{0.2\textwidth}p{0.25\textwidth}p{0.15\textwidth}@{}}
#         \toprule
#         \textbf{Sl. No.} & \textbf{Class Roll No.} & \textbf{Student Name} & \textbf{Internship/ Training Provider} & \textbf{Internship/ Training Topic Name} & \textbf{Internship/ Training Duration} \\
#         \midrule
#         \endhead
#         24 & 1754029 & Himanshu Tiwari & Internshala & Web Development & 6 Weeks \\
#         25 & 1754030 & Aayush Agarwal & Hyland Software Solutions India LLP (Hyland India) (Internship) & Software Development Intern & 11th May, 2020 to 17th July, 2020 \\
#         26 & 1754032 & Shubham Kumar Patwarika & DealboX Digisol LLP (Internship) & Room DB Integration and Client Data Entry App Development & 4th May, 2020 to 5th June, 2020 \\
#         27 & 1754034 & Ankit Kumar & Internshala & Machine Learning & 27th April, 2020 to 8th June, 2020 (6 Weeks) \\
#         28 & 1754035 & Ravi Roshan & Internshala & Web Development & 29th April, 2020 to 24th June, 2020 (8 Weeks) \\
#         29 & 1754037 & Aman Bhardwaj & Internshala & Data Science & 28th April, 2020 to 9th June, 2020 (6 Weeks) \\
#         30 & 1754038 & Sunny Kumar & JPMORGAN CHASE \& CO. & Software Engineering Virtual Experience (Establishing Financial Data Feeds, Frontend Web Development, Data Visualization with Perspective) & May, 2020 \\
#         31 & 1754040 & Ankita Patra & Internshala & Android App Development & 1st May, 2020 to 12th June, 2020 (6 Weeks) \\
#         32 & 1754041 & Sania Ajaz & Internshala & Machine Learning with Python & 27th April, 2020 to 8th June, 2020 (6 Weeks) \\
#         33 & 1754042 & Mohit Kumar Singh & Internshala & Data Science & 28th April, 2020 to 9th June, 2020 (6 Weeks) \\
#         \bottomrule
#     \end{longtable}
# \end{card}

# \clearpage

# % ==================== SECTION: RECOMMENDATIONS AND FUTURE OUTLOOK ====================
# \section*{\textcolor{accent}{Recommendations and Future Outlook}}
# \addcontentsline{toc}{section}{Recommendations and Future Outlook}
# {\large\textcolor{muted}{Strategic recommendations for enhancing future internship programs.}}

# \vspace{0.5cm}

# \begin{card}
#     \subsection*{\textcolor{accent}{Recommendations for Future Internships}}
#     \vspace{0.3cm}
#     To enhance the internship program for future students, a critical review of internship durations and types of engagement is recommended. While a significant number of students undertook shorter programs, such as the numerous 6-week and 8-week internships facilitated by Internshala across various domains like Web Development, Machine Learning, and Data Science, longer durations appear to correlate with more specialized roles. For instance, Darzee offered a 6-month Full Stack Developer role, Intugine Technologies provided a nearly year-long Backend Development opportunity, and Bytelearn and Revirt Space offered 5-month and 4-month SDE Internships, respectively. Future program improvements should encourage students to pursue these extended engagements, which likely offer deeper immersion and more substantial project contributions. Furthermore, the program should continue to support the diverse range of technical topics observed, including Backend, Frontend, Node.js, Java, Python, AI, Machine Learning, Data Analytics, Ethical Hacking, and Cyber Security, ensuring a broad skill development pathway. The inclusion of structured programs, such as the AICTE OIB-SIP internship in Java Development, also presents a valuable model for future offerings.

#     Collaboration with industry partners can be significantly enhanced by focusing on the quality and duration of placements. The current report highlights a wide array of partners, from startups like InnoByte Services and Snackbae to established corporations such as Larsen \& Toubro (L\&T), Indian Oil Corporation Limited, Tata Steel Limited, and global entities like JPMORGAN CHASE \& CO. and Accenture Nordic. To deepen these relationships, the department should actively seek to formalize partnerships that facilitate longer-term internships, similar to the 6-month engagement with Darzee or the nearly year-long stint at Intugine Technologies. These extended periods allow for more meaningful project involvement and foster stronger ties between the academic institution and industry. Additionally, exploring and expanding opportunities for virtual experience programs, as offered by JPMORGAN CHASE \& CO. and Accenture Nordic, can broaden access to a wider range of companies and specialized roles, complementing traditional in-person placements.

#     For students preparing for future internships, the current experiences underscore the importance of developing robust technical skills in high-demand areas. The prevalence of roles in Web Development (including Full Stack, Frontend, Backend, Node.js, and ReactJS), Machine Learning, Data Science, AI, Java Development, and Python indicates these are critical competencies. Students should prioritize hands-on project work in these domains to build a strong portfolio. Furthermore, based on the varied durations observed, students are advised to actively seek internships that extend beyond the typical 6-8 week period, aiming for opportunities of two months or more. Longer engagements, such as the 4-5 month roles at Bytelearn and Revirt Space, or the 6-month position at Darzee, provide more comprehensive learning and practical application of skills. Finally, students should diversify their search strategies, exploring opportunities not only through online platforms but also directly with companies, academic institutions like IIT Roorkee, and through structured programs like AICTE OIB-SIP, to maximize their exposure to diverse industry environments and challenges.
# \end{card}

# \vspace{0.5cm}

# \begin{card}
#     \subsection*{\textcolor{accent}{Top Internship Providers}}
#     \vspace{0.3cm}
#     \begin{center}
#         \begin{tikzpicture}
#         \begin{axis}[
#             institutional bar,
#             title={Top 10 Internship Providers},
#             x tick label style={rotate=45, anchor=east},
#             symbolic x coords={Internshala,Ardent,UPSKILL,Oasis Infobyte,Breakview Studios,Others},
#             xtick=data,
#             ylabel={Number of Internships},
#             ymin=0,
#             bar width=10pt,
#             legend pos=north west,
#             legend style={at={(0.5,-0.2)},anchor=north,legend columns=3},
#             width=\textwidth, % Use full minipage width
#             height=200pt,
#         ]
#         \addplot[fill=chart3, draw=none] coordinates {
#             (Internshala,21) (Ardent,5) (UPSKILL,3) (Oasis Infobyte,2) (Breakview Studios,2) (Others,20)
#         };
#         \end{axis}
#         \end{tikzpicture}
#     \end{center}
# \end{card}

# \vspace{0.5cm}

# \begin{card}
#     \subsection*{\textcolor{accent}{Recommendations Matrix for Program Improvement}}
#     \vspace{0.3cm}
#     \begin{longtable}{@{}p{0.15\textwidth}p{0.2\textwidth}p{0.15\textwidth}p{0.15\textwidth}p{0.15\textwidth}p{0.08\textwidth}p{0.07\textwidth}@{}}
#         \toprule
#         \textbf{Company Name} & \textbf{Internship/Training Topic} & \textbf{Duration} & \textbf{Student Name} & \textbf{Student ID} & \textbf{Roll Number} & \textbf{Semester} \\
#         \midrule
#         \endhead
#         Ardent Computech Pvt. Ltd. & Ethical Hacking and Cyber Security & 5th June, 2024 - 5th July, 2024 & Dipayan Porel & 2154084 & 12622002067 & 7th \\
#         Salahkaar Consultants & Web Applications using React and Django & 10th July, 2024 - 10th October, 2024 & Suraj Roy & 2154085 & 12622002074 & 7th \\
#         Internship Studio & Machine Learning & 15th June, 2024 - 20th July,2024 & Debjit Chakraborty & 2154086 & 12622002066 & 7th \\
#         Ardent Computech Pvt. Ltd. & Full Stack Development Using Spring Core Spring Boot Hibernate & 6th June, 2024 - 6th July, 2024 & Samrat Ghorui & 2154087 & 12622002072 & 7th \\
#         BCGX & Data Science & 19th July, 2024 - 18th August, 2024 & Harsh Sharma & 2154088 & 12622002069 & 7th \\
#         AlgoSmiths Softcom & NextJS Developer Internship & 10th July, 2024 - 10th October, 2024 & Bidisa Patra & 2154089 & 12622002065 & 7th \\
#         Ardent Computech Pvt. Ltd. & Ethical Hacking and Cyber Security & 5th June, 2024 - 5th July, 2024 & Govind Kumar & 2154090 & 12622002068 & 7th \\
#         \bottomrule
#     \end{longtable}
# \end{card}

# \end{document}


# '''

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
    report_template: NotRequired[int]
    
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
    address= f"Templates/report_template_{state.get('report_template', 1)}.html"
    with open(address, "r", encoding="utf-8") as f:
        html_skeleton = f.read()
    # html_skeleton= report

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


# def render_html_report_node(state: GraphState):
#     """Generates the final LaTeX report using LLM"""
#     print("---NODE: Rendering LaTeX Report (LLM)---")

#     final_data = state.get("final_report_data")
#     if not final_data:
#         return {"errors": ["Missing final_report_data"]}
    
#     latex_skeleton = report

#     prompt = ChatPromptTemplate.from_messages([
#         ("system",
#          "You are an elite LaTeX document specialist and report designer, creating professional, "
#          "publication-quality institutional reports optimized for PDF generation.\n\n"
         
#          "═══════════════════════════════════════════════════════════════════════════════\n"
#          "CRITICAL LATEX REQUIREMENTS\n"
#          "═══════════════════════════════════════════════════════════════════════════════\n\n"
         
#          "1. DOCUMENT STRUCTURE:\n"
#          "   • Use the provided LaTeX template structure EXACTLY\n"
#          "   • Document class: article with 11pt, a4paper\n"
#          "   • Maintain all package imports from the template\n"
#          "   • Preserve all color definitions and custom environments\n"
#          "   • Use \\clearpage for page breaks between major sections\n"
#          "   • Set document variables (\\InstituteName, \\ReportTitle) with actual data\n\n"
#          "   • Fix the geometry based on the data (e.g., if report_type is 'Financial Report', use specific margins)\n"
#          "   • Do not use \\caption outside float."
#          "   • Flow the skeleton structure properly to avoid LaTeX errors\n"
         
#          "2. INTELLIGENT CONTENT ORGANIZATION (MOST CRITICAL):\n"
#          "   You will receive data with sections, charts, and tables. Your job is to INTELLIGENTLY\n"
#          "   group related content together by analyzing their titles, topics, and keywords.\n\n"
         
#          "   ORGANIZATION PATTERN:\n"
#          "   ┌─────────────────────────────────────────────────┐\n"
#          "   │ TOPIC SECTION (e.g., Placement Statistics)     │\n"
#          "   ├─────────────────────────────────────────────────┤\n"
#          "   │ 1. Section Narrative Text                       │\n"
#          "   │ 2. Related Charts (place immediately after)     │\n"
#          "   │ 3. Related Tables (place immediately after)     │\n"
#          "   └─────────────────────────────────────────────────┘\n\n"
         
#          "   MATCHING LOGIC - Analyze and group by keywords:\n"
#          "   \n"
#          "   PLACEMENT/CAREER:\n"
#          "   • Keywords: placement, career, recruitment, employment, jobs, companies, hired, salary\n"
#          "   • Example: 'Placement Overview' section + 'Placement Rate' chart + 'Company List' table\n"
#          "   → Group these together in ONE section\n"
#          "   \n"
#          "   ACADEMIC/STUDENT:\n"
#          "   • Keywords: academic, student, performance, grades, examination, results, pass rate, enrollment\n"
#          "   • Example: 'Academic Performance' section + 'Grade Distribution' chart + 'Pass Rates' table\n"
#          "   → Group these together in ONE section\n"
#          "   \n"
#          "   FINANCIAL/BUDGET:\n"
#          "   • Keywords: financial, budget, revenue, expenditure, funds, accounts, cost, income\n"
#          "   → Group related content together\n"
#          "   \n"
#          "   RESEARCH/PUBLICATIONS:\n"
#          "   • Keywords: research, publication, patents, innovation, papers, journals, citations\n"
#          "   → Group related content together\n\n"
         
#          "3. CHART IMPLEMENTATION WITH PGFPLOTS:\n"
#          "   • For EACH chart in the data, create a TikZ/pgfplots visualization\n"
#          "   • Place each chart IMMEDIATELY after its related section text\n"
#          "   • Use minipage for side-by-side charts: \\begin{minipage}[t]{0.48\\textwidth}\n"
#          "   \n"
#          "   BAR CHART EXAMPLE:\n"
#          "   \\begin{tikzpicture}\n"
#          "   \\begin{axis}[\n"
#          "       ybar,\n"
#          "       width=0.48\\textwidth,\n"
#          "       height=180pt,\n"
#          "       symbolic x coords={2020,2021,2022,2023},\n"
#          "       xtick=data,\n"
#          "       ylabel={Number of Students},\n"
#          "       title={Enrollment Trend},\n"
#          "       bar width=12pt,\n"
#          "   ]\n"
#          "   \\addplot[fill=chart1, draw=none] coordinates {\n"
#          "       (2020,2800) (2021,2950) (2022,3100) (2023,3245)\n"
#          "   };\n"
#          "   \\end{axis}\n"
#          "   \\end{tikzpicture}\n"
#          "   \n"
#          "   LINE CHART EXAMPLE:\n"
#          "   \\begin{axis}[\n"
#          "       width=0.48\\textwidth,\n"
#          "       xlabel={Year},\n"
#          "       ylabel={Publications},\n"
#          "   ]\n"
#          "   \\addplot[color=chart1, mark=*, line width=1.5pt] coordinates {\n"
#          "       (2020,85) (2021,98) (2022,115) (2023,142)\n"
#          "   };\n"
#          "   \\legend{Total Papers}\n"
#          "   \\end{axis}\n"
#          "   \n"
#          "   PIE CHART EXAMPLE (use TikZ fills):\n"
#          "   \\begin{tikzpicture}\n"
#          "   \\coordinate (center) at (0,0);\n"
#          "   \\def\\radius{2cm}\n"
#          "   \\fill[chart1] (center) -- (0:\\radius) arc (0:120:\\radius) -- cycle;\n"
#          "   \\fill[chart2] (center) -- (120:\\radius) arc (120:240:\\radius) -- cycle;\n"
#          "   \\node[anchor=west] at (2.5, 1) {\\textcolor{chart1}{$\\blacksquare$} Category A (40\\%)};\n"
#          "   \\end{tikzpicture}\n"
#          "   \n"
#          "   CHART TYPES MAPPING:\n"
#          "   • bar → ybar axis with \\addplot[fill=...]\n"
#          "   • line → axis with \\addplot[color=..., mark=*]\n"
#          "   • pie → TikZ pie chart with \\fill arcs\n"
#          "   • doughnut → Similar to pie with inner circle\n"
#          "   • area → \\addplot with fill opacity and \\closedcycle\n\n"
         
#          "4. TABLE IMPLEMENTATION:\n"
#          "   • For EACH table in the data, create a professional LaTeX table\n"
#          "   • Place each table IMMEDIATELY after its related chart(s)\n"
#          "   • Use booktabs package for professional appearance\n"
#          "   \n"
#          "   TABLE EXAMPLE:\n"
#          "   \\begin{card}\n"
#          "   \\subsection*{Table Title}\n"
#          "   \\vspace{0.3cm}\n"
#          "   \\begin{tabularx}{\\textwidth}{@{}lXrrr@{}}\n"
#          "       \\toprule\n"
#          "       \\textbf{Column 1} & \\textbf{Column 2} & \\textbf{Column 3} \\\\\n"
#          "       \\midrule\n"
#          "       Data 1 & Data 2 & Data 3 \\\\\n"
#          "       Data 1 & Data 2 & Data 3 \\\\\n"
#          "       \\bottomrule\n"
#          "   \\end{tabularx}\n"
#          "   \\end{card}\n"
#          "   \n"
#          "   • Include ALL rows from data.rows (do NOT truncate)\n"
#          "   • Use \\midrule between header and data\n"
#          "   • Use \\bottomrule at end\n"
#          "   • For long tables, use longtable environment instead\n\n"
         
#          "5. KPI DISPLAY:\n"
#          "   • Display ALL KPIs from data.kpis array\n"
#          "   • Use the \\kpi{metric}{value} command provided in template\n"
#          "   • Arrange in 3-column layout with minipage\n"
#          "   \n"
#          "   KPI LAYOUT EXAMPLE:\n"
#          "   \\begin{minipage}[t]{0.31\\textwidth}\n"
#          "       \\kpi{Total Students}{3,245}\n"
#          "   \\end{minipage}%\n"
#          "   \\hfill\n"
#          "   \\begin{minipage}[t]{0.31\\textwidth}\n"
#          "       \\kpi{Faculty}{287}\n"
#          "   \\end{minipage}%\n"
#          "   \\hfill\n"
#          "   \\begin{minipage}[t]{0.31\\textwidth}\n"
#          "       \\kpi{Programs}{42}\n"
#          "   \\end{minipage}\n\n"
         
#          "6. COVER PAGE:\n"
#          "   • Create a professional title page based on the skeleton\n"
         
#          "7. SPECIAL CHARACTER HANDLING:\n"
#          "   • Use \\rupee or Rs. for Indian Rupee symbol (NOT ₹)\n"
#          "   • Use --- for em dash (NOT —)\n"
#          "   • Use $\\blacksquare$ for black squares in legends (NOT ■)\n"
#          "   • Escape special LaTeX characters: \\& \\% \\$ \\# \\_ \\{ \\}\n"
#          "   • Use proper quotes: `` for opening, '' for closing\n\n"
         
#          "8. DATA COMPLETENESS:\n"
#          "   • Include EVERY piece of data from the JSON:\n"
#          "     ✓ Report metadata: title, organization, date\n"
#          "     ✓ Executive summary: full text\n"
#          "     ✓ ALL KPIs: metric, value\n"
#          "     ✓ ALL sections: title + full content\n"
#          "     ✓ ALL charts: with complete data\n"
#          "     ✓ ALL tables: with all headers and all rows\n"
#          "   • Do NOT skip any content\n"
#          "   • Do NOT use placeholders\n"
#          "   • Do NOT summarize - include full text\n\n"
         
#          "9. DOCUMENT FLOW:\n"
#          "   Page 1: Cover with title, exec summary, snapshot KPIs\n"
#          "   Page 2: Table of Contents (optional)\n"
#          "   Page 3+: Sections with related charts and tables grouped together\n"
#          "   Last Page: Appendix with detailed tables if needed\n"
#          "   \n"
#          "   Use \\clearpage between major sections\n"
#          "   Keep related content on same page when possible\n\n"
         
#          "10. OUTPUT FORMAT:\n"
#          "   • Return ONLY the complete, valid LaTeX document\n"
#          "   • Start with: \\documentclass[11pt,a4paper]{article}\n"
#          "   • End with: \\end{document}\n"
#          "   • NO markdown code blocks (no ```latex or ```)\n"
#          "   • NO explanatory text before or after LaTeX\n"
#          "   • NO comments explaining what you did\n"
#          "   • NO placeholder content - everything must be real data\n"
#          "   • Proper indentation for readability\n\n"
         
#          "═══════════════════════════════════════════════════════════════════════════════\n"
#          "CONTENT ORGANIZATION ALGORITHM\n"
#          "═══════════════════════════════════════════════════════════════════════════════\n"
#          "STEP 1: Analyze all sections and identify main topics\n"
#          "STEP 2: For each section, look for charts with matching keywords\n"
#          "STEP 3: For each section, look for tables with matching keywords\n"
#          "STEP 4: Group section + matching charts + matching tables together\n"
#          "STEP 5: Arrange in logical order: Overview → Specific Topics → Conclusion\n"
#          "STEP 6: Place related visualizations immediately after narrative text\n\n"
         
#          "EXAMPLE GROUPING:\n"
#          "If you find:\n"
#          "  • Section: 'Placement Statistics and Outcomes'\n"
#          "  • Chart: 'Placement Rate by Department'\n"
#          "  • Chart: 'Top Recruiting Companies'\n"
#          "  • Table: 'Placement Data 2024'\n"
#          "\n"
#          "Then create:\n"
#          "  \\section*{Placement Statistics and Outcomes}\n"
#          "  {\\large\\textcolor{muted}{Section subtitle}}\n"
#          "  \n"
#          "  \\vspace{0.5cm}\n"
#          "  \n"
#          "  \\begin{card}\n"
#          "  Section narrative text here...\n"
#          "  \n"
#          "  \\vspace{0.5cm}\n"
#          "  \n"
#          "  \\begin{minipage}[t]{0.48\\textwidth}\n"
#          "      % Chart 1\n"
#          "  \\end{minipage}%\n"
#          "  \\hfill\n"
#          "  \\begin{minipage}[t]{0.48\\textwidth}\n"
#          "      % Chart 2\n"
#          "  \\end{minipage}\n"
#          "  \\end{card}\n"
#          "  \n"
#          "  \\vspace{0.5cm}\n"
#          "  \n"
#          "  \\begin{card}\n"
#          "  \\subsection*{Detailed Data}\n"
#          "  \\begin{tabularx}{\\textwidth}{...}\n"
#          "      % Table content\n"
#          "  \\end{tabularx}\n"
#          "  \\end{card}\n\n"
         
#          "═══════════════════════════════════════════════════════════════════════════════\n"
#          "QUALITY CHECKLIST (Verify before output)\n"
#          "═══════════════════════════════════════════════════════════════════════════════\n"
#          "□ Related content is grouped together by topic (section + charts + tables)\n"
#          "□ Every chart has proper pgfplots code with data from JSON\n"
#          "□ Every table has complete data (all rows included)\n"
#          "□ All KPIs are displayed in the document\n"
#          "□ No content from JSON is missing or truncated\n"
#          "□ Special characters are properly escaped (\\rupee, ---, $\\blacksquare$)\n"
#          "□ Document compiles without errors (valid LaTeX syntax)\n"
#          "□ Template structure and packages are preserved\n"
#          "□ No markdown formatting in output (no ``` anywhere)\n"
#          "□ Professional appearance, publication-ready\n"
#          "□ Charts and tables appear immediately after their related section text\n\n"
         
#          "═══════════════════════════════════════════════════════════════════════════════\n"
#          "FINAL INSTRUCTION\n"
#          "═══════════════════════════════════════════════════════════════════════════════\n"
#          "Analyze the data carefully. Identify topics and intelligently group related\n"
#          "sections, charts, and tables together. Create a professional, publication-ready\n"
#          "LaTeX report that compiles cleanly and looks professionally designed.\n"
#          "Use websearch feature to find the suppoted LaTex syntax for MikTex . If you encounter any data that cannot be directly represented in LaTeX, find a creative way to include it without losing information. The report should be perfectly organized with related content flowing naturally together.\n"),
        
#         ("user",
#          "LATEX TEMPLATE SKELETON:\n"
#          "═══════════════════════════════════════════════════════════════\n"
#          "{{skeleton}}\n"
#          "═══════════════════════════════════════════════════════════════\n\n"
         
#          "COMPLETE DATA (JSON):\n"
#          "═══════════════════════════════════════════════════════════════\n"
#          "{{data}}\n"
#          "═══════════════════════════════════════════════════════════════\n\n"
         
#          "Instructions:\n"
#          "1. Analyze the data structure carefully\n"
#          "2. Identify which sections, charts, and tables are related by topic\n"
#          "3. Group them together in the output\n"
#          "4. Follow the template structure\n"
#          "5. Include ALL data\n"
#          "6. Generate complete LaTeX code\n\n"
         
#          "Generate the complete, publication-ready LaTeX report now.\n"
#          "Output ONLY the LaTeX code with no markdown formatting:")
#     ],
#     template_format="jinja2"
#     )

#     # 3. Invoke LLM
#     chain = prompt | html_gen_llm | StrOutputParser()

#     try:
#         print("-> Generating LaTeX with LLM...")
#         data_str = json.dumps(final_data, ensure_ascii=False)
        
#         latex_output = chain.invoke({
#             "skeleton": latex_skeleton,
#             "data": data_str
#         })

#         # Clean up markdown fences
#         latex_output = latex_output.replace("```latex", "").replace("```tex", "").replace("```", "").strip()

#         print(f"-> LaTeX Generated successfully ({len(latex_output)} characters)")

#         # Save locally
#         os.makedirs("output_reports", exist_ok=True)
#         timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
#         tex_filename = f"output_reports/Report_{state.get('institute_id', 'INST')}_{timestamp}.tex"
        
#         with open(tex_filename, "w", encoding="utf-8") as f:
#             f.write(latex_output)
#         print(f"-> 💾 Saved LaTeX source: {tex_filename}")
#         print(f"-> ℹ️  To compile: pdflatex {tex_filename}")

#         return {
#             "latex_report": latex_output
#         }

#     except Exception as e:
#         error_msg = f"LLM LaTeX Rendering failed: {str(e)}"
#         print(f"-> ✗ {error_msg}")
#         return {"errors": [error_msg]}

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
  report_desc : str = "",
  report_template: int = 1
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
    "report_name" : report_name,
    "report_template": report_template
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