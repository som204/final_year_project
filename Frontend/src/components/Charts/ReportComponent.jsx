import React, { useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Chart from 'chart.js/auto';
// 1. Import the CSS module file
import styles from './ReportComponent.module.css';

const ReportComponent = () => {
    const location = useLocation();
    const { title, kpis, sections, chart } = location.state || {};
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        // Ensure the chart data and canvas ref are available
        if (chart && chart.data && chartRef.current) {
            // Destroy any existing chart instance to prevent memory leaks and rendering issues
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            const ctx = chartRef.current.getContext('2d');
            try {
                // Create the new Chart instance
                chartInstance.current = new Chart(ctx, {
                    type: 'bar',
                    data: chart.data,
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: false // Title is handled by the H3 tag
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        let label = context.dataset.label || '';
                                        if (label) {
                                            label += ': ';
                                        }
                                        if (context.parsed.y !== null) {
                                            // Format large numbers for tooltips (e.g., $1.2M)
                                            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(context.parsed.y);
                                        }
                                        return label;
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        // Format Y-axis labels (e.g., 1M, 500K)
                                        return new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value);
                                    }
                                }
                            }
                        }
                    }
                });
            } catch (e) {
                console.error("Could not render chart:", e);
            }
        }

        // Cleanup function: destroy chart instance when the component unmounts
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [chart]); // Rerun this effect only if the chart data changes

    if (!title) {
        return (
            // Apply class names using the 'styles' object
            <div className={styles.container}>
                <h1>No Report Data</h1>
                <p>Report data was not provided. Please go back and generate a report first.</p>
                <Link to="/institute-admin/report">Go Back</Link>
            </div>
        );
    }

    return (
        // Apply the scoped class names to all your elements
        <div className={styles.reportBody}>
            <div className={styles.container}>
                <h1>{title}</h1>

                {kpis && kpis.length > 0 && (
                    <div className={styles.statsGrid}>
                        {kpis.map((card, index) => (
                            <div className={styles.statCard} key={index}>
                                <div className={styles.value}>{card.value}</div>
                                <div className={styles.label}>{card.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {sections && sections.length > 0 && (
                    sections.map((section, index) => (
                        <section key={index}>
                            <h2>{section.title}</h2>
                            <p dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br />') }} />
                        </section>
                    ))
                )}

                {chart && chart.data && (
                    <section>
                        <div className={styles.chartContainer}>
                            <h3>{chart.title}</h3>
                            <canvas ref={chartRef} id="financialChart"></canvas>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default ReportComponent;

