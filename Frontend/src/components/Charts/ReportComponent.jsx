// import React, { useEffect, useRef } from 'react';
// import { useLocation, Link } from 'react-router-dom';
// import Chart from 'chart.js/auto';
// import styles from './ReportComponent.module.css';

// const ReportComponent = () => {
//     // 1. Get the nested report data from the navigation state
//     const location = useLocation();
//     const { final_report_data, metadata } = location.state || {};

//     // Create a ref to hold an array of chart instances for cleanup
//     const chartInstances = useRef([]);

//     // This useEffect hook handles the creation and destruction of MULTIPLE charts
//     useEffect(() => {
//         // Ensure we have charts data before proceeding
//         if (final_report_data?.charts && final_report_data.charts.length > 0) {
            
//             // Cleanup previous charts before creating new ones
//             chartInstances.current.forEach(instance => instance.destroy());
//             chartInstances.current = []; // Reset the array

//             final_report_data.charts.forEach((chart, index) => {
//                 const canvasId = `chart-${index}`;
//                 const ctx = document.getElementById(canvasId)?.getContext('2d');
                
//                 if (ctx) {
//                     try {
//                         const newChartInstance = new Chart(ctx, {
//                             type: chart.type || 'bar', // Use the type from the data
//                             data: chart.data,
//                             options: {
//                                 responsive: true,
//                                 plugins: {
//                                     title: { display: false },
//                                     legend: {
//                                         position: chart.type === 'pie' || chart.type === 'doughnut' ? 'top' : 'bottom',
//                                     },
//                                     tooltip: {
//                                         callbacks: {
//                                             label: function(context) {
//                                                 let label = context.dataset.label || context.label || '';
//                                                 if (label) label += ': ';
//                                                 const value = context.parsed.y ?? context.parsed;
//                                                 if (value !== null) {
//                                                     label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'CAD', notation: 'compact', maximumFractionDigits: 2 }).format(value);
//                                                 }
//                                                 return label;
//                                             }
//                                         }
//                                     }
//                                 },
//                                 // Conditionally add scales for bar and line charts
//                                 scales: (chart.type === 'bar' || chart.type === 'line') ? {
//                                     y: {
//                                         beginAtZero: true,
//                                         ticks: {
//                                             callback: function(value) {
//                                                 return new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value);
//                                             }
//                                         }
//                                     }
//                                 } : {}
//                             }
//                         });
//                         chartInstances.current.push(newChartInstance);
//                     } catch (e) {
//                         console.error(`Could not render chart #${index}:`, e);
//                     }
//                 }
//             });
//         }

//         // Cleanup function to destroy all chart instances when the component unmounts
//         return () => {
//             chartInstances.current.forEach(instance => instance.destroy());
//         };
//     }, [final_report_data?.charts]); // Rerun this effect if the chart data changes

//     if (!final_report_data) {
//         return (
//             <div className={styles.container}>
//                 <h1>No Report Data Found</h1>
//                 <p>Please go back and generate a report first.</p>
//                 <Link to="/institute-admin/report">Go Back</Link>
//             </div>
//         );
//     }

//     const formatTimestamp = (ts) => {
//         if (!ts) return '';
//         return new Date(ts).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
//     };

//     return (
//         <div className={styles.reportBody}>
//             <div className={styles.container}>
//                 <h1>{final_report_data.title}</h1>
//                 <h2 className={styles.reportSubtitle}>
//                     {final_report_data.institute_name} | {final_report_data.report_year}
//                 </h2>

//                 {final_report_data.kpis?.length > 0 && (
//                     <>
//                         <h2>Key Highlights</h2>
//                         <div className={styles.kpiGrid}>
//                             {final_report_data.kpis.map((kpi, index) => (
//                                 <div className={styles.kpiCard} key={index}>
//                                     <span className={styles.kpiIcon}>{kpi.icon}</span>
//                                     <span className={styles.kpiValue}>{kpi.value}</span>
//                                     <span className={styles.kpiMetric}>{kpi.metric}</span>
//                                 </div>
//                             ))}
//                         </div>
//                     </>
//                 )}

//                 {final_report_data.sections?.length > 0 && (
//                     <div className={styles.toc}>
//                         <h3>Table of Contents</h3>
//                         <ol>
//                             {final_report_data.sections.map((section, index) => (
//                                 <li key={index}><a href={`#section-${index}`}>{section.title}</a></li>
//                             ))}
//                         </ol>
//                     </div>
//                 )}

//                 {final_report_data.sections?.length > 0 && (
//                     final_report_data.sections.map((section, index) => (
//                         <section key={index} id={`section-${index}`}>
//                             <h2>{section.title}</h2>
//                             <div className={styles.sectionContent} dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br />') }} />
//                         </section>
//                     ))
//                 )}
                
//                 {final_report_data.tables?.length > 0 && (
//                     <section>
//                         <h2>Data Tables</h2>
//                         {final_report_data.tables.map((table, index) => (
//                             <div className={styles.tableContainer} key={index}>
//                                 <h3>{table.title}</h3>
//                                 <table className={styles.appendixTable}>
//                                     <thead>
//                                         <tr>
//                                             {table.data.headers.map((header, hIndex) => <th key={hIndex}>{header}</th>)}
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {table.data.rows.map((row, rIndex) => (
//                                             <tr key={rIndex}>
//                                                 {row.map((cell, cIndex) => <td key={cIndex}>{cell}</td>)}
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         ))}
//                     </section>
//                 )}

//                 {final_report_data.charts?.length > 0 && (
//                     <section>
//                         <h2>Data Visualizations</h2>
//                         <div className={styles.chartsGrid}>
//                             {final_report_data.charts.map((chart, index) => (
//                                 <div className={styles.chartContainer} key={index}>
//                                     <h3>{chart.title}</h3>
//                                     <canvas id={`chart-${index}`}></canvas>
//                                 </div>
//                             ))}
//                         </div>
//                     </section>
//                 )}
                
                
//                 {metadata && (
//                      <footer>
//                         <p>Report generated on: {formatTimestamp(metadata.generation_timestamp)}</p>
//                         <p>Powered by the Automated Reporting Agent</p>
//                     </footer>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ReportComponent;


import React from 'react';
import { useLocation } from 'react-router-dom';

const ReportComponent = () => {
    const location = useLocation();
    // Ensure fallback to empty string if data is missing to prevent crash
    const { final_report_data = '' } = location.state || {};

    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <iframe
                title="Generated Report"
                srcDoc={final_report_data}
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block' // Removes default inline iframe spacing
                }}
                // Optional: sandbox for extra security if you don't trust the HTML entirely
                // sandbox="allow-scripts allow-same-origin" 
            />
        </div>
    );
};

export default ReportComponent;
