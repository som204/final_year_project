import React, { useState, useEffect, useMemo, useContext, } from 'react';
import { UserContext } from '../Context/user.context';
import { Search, Filter, Edit, Trash2, FileText, PlusCircle, Loader, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../pages/Admin/InstituteAdmin.css'; // Reusing the Institute Admin CSS

const ReportManagement = () => {
    // --- State Management ---
    const [activeTab, setActiveTab] = useState('list');
    const { user, token } = useContext(UserContext);

    // State for "All Reports" tab
    const [reports, setReports] = useState([]);
    const [isReportsLoading, setIsReportsLoading] = useState(true);
    const [reportsError, setReportsError] = useState(null);
    const [reportSearchTerm, setReportSearchTerm] = useState('');
    const navigate = useNavigate();

    // State for "Create Report" tab
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [selectedFileIds, setSelectedFileIds] = useState(new Set());
    const [isFilesLoading, setIsFilesLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationMessage, setGenerationMessage] = useState('');
    const [fileSearchTerm, setFileSearchTerm] = useState('');
    const [fileFilterDept, setFileFilterDept] = useState('all');

    // --- Data Fetching ---
    const fetchInitialData = async () => {
        setIsReportsLoading(true);
        try {
            const [reportsRes, projectsRes] = await Promise.all([
                fetch(`http://localhost:8000/reports/institute/${user.institute_id}`, { credentials: 'include', method: 'GET' }),
                fetch(`http://localhost:8000/projects/institute/${user.institute_id}`, { credentials: 'include', method: 'GET' })
            ]);
            if (!reportsRes.ok) throw new Error('Failed to fetch reports.');
            if (!projectsRes.ok) throw new Error('Failed to fetch projects.');
            const reportsData = await reportsRes.json();
            const projectsData = await projectsRes.json();
            setReports(reportsData);
            setProjects(projectsData);
        } catch (err) {
            setReportsError(err.message);
        } finally {
            setIsReportsLoading(false);
        }
    };

    useEffect(() => {
        if (user && token) {
            fetchInitialData();
        }
    }, [user, token]);

    // Fetch uploaded files when a project is selected
    useEffect(() => {
        const fetchUploadedFiles = async () => {
            if (!selectedProject) {
                setUploadedFiles([]);
                return;
            }
            setIsFilesLoading(true);
            try {
                const response = await fetch(`http://localhost:8000/uploads/projects/${selectedProject}`, {
                    credentials: 'include',
                    method: 'GET'
                });
                if (!response.ok) throw new Error('Failed to fetch uploaded files for this project.');
                const data = await response.json();
                setUploadedFiles(data);
            } catch (err) {
                setReportsError(err.message); // Reuse error state
            } finally {
                setIsFilesLoading(false);
            }
        };
        fetchUploadedFiles();
    }, [selectedProject, token]);

    // --- Memoized Filtering for UI performance ---
    const filteredReports = useMemo(() => {
        return reports.filter(report =>
            report.file_name.toLowerCase().includes(reportSearchTerm.toLowerCase())
        );
    }, [reports, reportSearchTerm]);

    const filteredAndSearchedFiles = useMemo(() => {
        return uploadedFiles
            .filter(file => {
                // Filter by department
                if (fileFilterDept === 'all') return true;
                return file.department_id === parseInt(fileFilterDept);
            })
            .filter(file => {
                // Filter by search term
                const searchLower = fileSearchTerm.toLowerCase();
                return (
                    file.name.toLowerCase().includes(searchLower) ||
                    (file.faculty_name || '').toLowerCase().includes(searchLower) ||
                    (file.department_name || '').toLowerCase().includes(searchLower)
                );
            });
    }, [uploadedFiles, fileSearchTerm, fileFilterDept]);

    const uniqueDepartments = useMemo(() => {
        const depts = new Map();
        uploadedFiles.forEach(file => {
            if (file) {
                depts.set(file.department_id, file.department_name);
            }
        });
        return Array.from(depts, ([id, name]) => ({ id, name }));
    }, [uploadedFiles]);

    // --- Event Handlers ---
    const handleFileSelection = (fileId) => {
        setSelectedFileIds(prevSelectedIds => {
            const newSelectedIds = new Set(prevSelectedIds); // Create a new copy to avoid state mutation
            if (newSelectedIds.has(fileId)) {
                newSelectedIds.delete(fileId);
            } else {
                newSelectedIds.add(fileId);
            }
            return newSelectedIds;
        });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allVisibleIds = new Set(filteredAndSearchedFiles.map(f => f.id));
            setSelectedFileIds(allVisibleIds);
        } else {
            setSelectedFileIds(new Set());
        }
    };

    const handleGenerateReport = async () => {
        if (selectedFileIds.size === 0) {
            setGenerationMessage({ type: 'error', text: 'Please select at least one file to generate the report.' });
            return;
        }
        setIsGenerating(true);
        setGenerationMessage({ type: 'loading', text: 'Initializing AI agent... This may take a moment.' });

        const sourceFileIds = Array.from(selectedFileIds);
        
        try {
            console.log("Selected Project ID:", selectedProject);
            console.log("Source File IDs:", sourceFileIds);
            // This is the endpoint for your AI agent
            const response = await fetch('http://localhost:8000/reports/create', {
                method: 'POST',
                credentials: "include",
                headers: { 'Content-Type': 'application/json',},
                body: JSON.stringify({ project_id: selectedProject, source_file_ids: sourceFileIds }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Report generation failed.');
            }
            const result= await response.json();
            // console.log(result)
            
            navigate(`/report`, { state: 
                { 
                title: result.title,
                    kpis: result.kpis,
                    sections: result.sections,
                    chart: result.chart
                } });
            setGenerationMessage({ type: 'success', text: 'Report generated successfully! Refreshing list...' });
            // Refresh the reports list and switch back to the list tab
            fetchInitialData();
            setActiveTab('list');

        } catch (err) {
            setGenerationMessage({ type: 'error', text: err.message });
        } finally {
            setIsGenerating(false);
            
            setTimeout(() => setGenerationMessage(''), 7000);
        }
    };


    return (
        <div className="management-page">
            <h1>Report Management</h1>

            <div className="tabs">
                <button onClick={() => setActiveTab('list')} className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}>
                    <FileText size={16} /> All Reports
                </button>
                <button onClick={() => setActiveTab('create')} className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}>
                    <PlusCircle size={16} /> Create New Report
                </button>
            </div>

            <div className="tab-content">
                {/* LIST VIEW */}
                {activeTab === 'list' && (
                    <div className="list-view">
                        <div className="list-controls">
                            <div className="search-bar">
                                <Search size={20} />
                                <input type="text" placeholder="Search by report title..." value={reportSearchTerm} onChange={(e) => setReportSearchTerm(e.target.value)} />
                            </div>
                        </div>
                        {isReportsLoading && <p>Loading reports...</p>}
                        {reportsError && <p className="form-message error">{reportsError}</p>}
                        {!isReportsLoading && !reportsError && (
                            <table className="data-table ia-data-table">
                                <thead>
                                    <tr>
                                        <th>Report Title</th>
                                        <th>Project</th>
                                        <th>Date Generated</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReports.length > 0 ? filteredReports.map(report => (
                                        <tr key={report.id}>
                                            <td>{report.file_name}</td>
                                            <td>{projects.find(p => p.id === report.project_id)?.name || 'N/A'}</td>
                                            <td>{new Date(report.created_at).toLocaleString()}</td>
                                            <td className="actions-cell">
                                                <button className="action-button view">View</button>
                                                <button className="action-button delete"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    )) : <tr><td colSpan="5">No reports found.</td></tr>}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* CREATE VIEW */}
                {activeTab === 'create' && (
                    <div className="create-report-view">
                        <div className="ia-form">
                            <label>1. Select a Project</label>
                            <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} disabled={isReportsLoading}>
                                <option value="" disabled>Choose a project to begin...</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        
                        {selectedProject && (
                            <div className="file-selection-panel">
                                <label className="panel-label">2. Select Source Files for the Report</label>

                                <div className="list-controls">
                                    <div className="search-bar">
                                        <Search size={20} />
                                        <input type="text" placeholder="Search files by name, uploader, or department..." value={fileSearchTerm} onChange={(e) => setFileSearchTerm(e.target.value)} />
                                    </div>
                                    <div className="filter-bar">
                                        <Filter size={20} />
                                        <select value={fileFilterDept} onChange={(e) => setFileFilterDept(e.target.value)}>
                                            <option value="all">All Departments</option>
                                            {uniqueDepartments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                
                                {isFilesLoading && <p><Loader size={18} className="spinner" /> Loading files for this project...</p>}
                                
                                {!isFilesLoading && (
                                    <div className="file-selection-list">
                                        <div className="file-selection-header">
                                            <input
                                                type="checkbox"
                                                id="select-all"
                                                onChange={handleSelectAll}
                                                checked={filteredAndSearchedFiles.length > 0 && selectedFileIds.size === filteredAndSearchedFiles.length}
                                            />
                                            <label htmlFor="select-all">Select All Visible</label>
                                        </div>
                                        {filteredAndSearchedFiles.length > 0 ? filteredAndSearchedFiles.map(file => (
                                            
                                            <div key={file.id} className="file-selection-item">
                                                <input type="checkbox" id={`file-${file.id}`} checked={selectedFileIds.has(file.id)} onChange={() => handleFileSelection(file.id)} />
                                                <label htmlFor={`file-${file.id}`} className="file-details">
                                                    <span className="file-name">{file.name}</span>
                                                    <span className="file-meta">
                                                        <span>By: <strong>{file.faculty_name || 'N/A'}</strong></span>
                                                        <span>Dept: <strong>{file.department_name || 'N/A'}</strong></span>
                                                        <span>On: <strong>{new Date(file.upload_time).toLocaleDateString()}</strong></span>
                                                    </span>
                                                </label>
                                            </div>
                                        )) : <p className="no-files-message">No files found matching your criteria.</p>}
                                    </div>
                                )}
                                
                                {generationMessage && (
                                    <p className={`form-message ${generationMessage.type}`}>
                                        {generationMessage.type === 'loading' && <Loader size={18} className="spinner" />}
                                        {generationMessage.type === 'error' && <AlertCircle size={18} />}
                                        {generationMessage.text}
                                    </p>
                                )}

                                <button onClick={handleGenerateReport} className="button button-accent generate-button" disabled={isGenerating || selectedFileIds.size === 0}>
                                    {isGenerating ? 'Generating Report...' : `Generate Report from ${selectedFileIds.size} Selected File(s)`}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportManagement;

