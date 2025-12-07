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