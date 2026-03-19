import React, { useState } from "react";
import { 
  FolderOpen, 
  Search, 
  UploadCloud, 
  X, 
  Send, 
  Paperclip,
  CheckCircle
} from "lucide-react";


// Projects asking for student data
const MOCK_PROJECTS = [
  { 
    id: 201, 
    title: "Student Research & Innovation Survey", 
    deadline: "2025-02-28", 
    status: "Open",
    description: "Submit your final year project abstracts and team details."
  },
  { 
    id: 202, 
    title: "Tech Fest 2025 Registrations", 
    deadline: "2025-03-05", 
    status: "Open",
    description: "Upload payment proof and participant list for the hackathon."
  },
  { 
    id: 203, 
    title: "Alumni Database Update", 
    deadline: "2025-01-30", 
    status: "Closed",
    description: "Submit contact details for the alumni network."
  },
];

const StudentUpload = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadModal, setUploadModal] = useState(null); // Selected Project
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");

  const filteredProjects = MOCK_PROJECTS.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }
    // API Call logic here
    alert(`File "${file.name}" uploaded successfully for project: ${uploadModal.title}`);
    setUploadModal(null);
    setFile(null);
    setNotes("");
  };

  return (
    <div className="student-layout">
      <div className="student-content">
        
        <div className="page-header">
          <h1>Upload Data</h1>
          <p>Submit documents and data for ongoing institute projects.</p>
        </div>

        {/* SEARCH */}
        <div className="list-controls">
          <div className="search-bar">
            <Search size={20} color="#64748b" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* PROJECTS GRID */}
        <div className="student-reports-grid">
          {filteredProjects.map((project) => (
            <div key={project.id} className="student-report-card">
              <div className="report-header">
                <div className={`icon-wrapper ${project.status === 'Open' ? 'active' : ''}`}>
                  <FolderOpen size={28} />
                </div>
                <span className={`contribution-badge ${project.status === 'Closed' ? 'closed' : ''}`} 
                      style={project.status === 'Closed' ? {background:'#f1f5f9', color:'#64748b', border:'none'} : {}}>
                  {project.status === 'Open' ? 'Accepting Data' : 'Closed'}
                </span>
              </div>
              
              <div className="report-body">
                <h3>{project.title}</h3>
                <p className="report-desc">{project.description}</p>
                <div className="report-meta">
                  <span>Deadline: {project.deadline}</span>
                </div>
              </div>

              <div className="report-footer">
                <button 
                  className="action-btn contribute" 
                  onClick={() => setUploadModal(project)}
                  disabled={project.status === 'Closed'}
                  style={project.status === 'Closed' ? {opacity: 0.6, cursor:'not-allowed'} : {}}
                >
                  <UploadCloud size={16} /> {project.status === 'Open' ? 'Upload Data' : 'Submission Closed'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* UPLOAD MODAL */}
        {uploadModal && (
          <div className="modal-overlay" onClick={() => setUploadModal(null)}>
            <div className="modal-content student-modal" onClick={e => e.stopPropagation()}>
              
              <div className="modal-header">
                <h3>Submit Data</h3>
                <button className="close-btn" onClick={() => setUploadModal(null)}><X size={20} /></button>
              </div>
              
              <div className="modal-subheader">
                Project: <strong>{uploadModal.title}</strong>
              </div>

              <div className="modal-body">
                {/* File Drop Zone */}
                <label className="input-label">Select File</label>
                <div className="upload-box-placeholder" style={{borderColor: file ? '#3b82f6' : '#e2e8f0', background: file ? '#eff6ff' : 'transparent'}}>
                   <input type="file" id="file-upload" style={{display:'none'}} onChange={handleFileChange} />
                   <label htmlFor="file-upload" style={{cursor:'pointer', width:'100%', display:'flex', flexDirection:'column', alignItems:'center'}}>
                      {file ? (
                        <>
                          <CheckCircle size={32} color="#3b82f6" />
                          <span style={{marginTop:8, color:'#1e40af', fontWeight:500}}>{file.name}</span>
                          <span style={{fontSize:'0.8rem', color:'#64748b'}}>Click to change</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud size={32} />
                          <span style={{marginTop:8}}>Click to Upload File</span>
                          <span style={{fontSize:'0.8rem', color:'#94a3b8'}}>PDF, DOCX, CSV (Max 10MB)</span>
                        </>
                      )}
                   </label>
                </div>

                <label className="input-label" style={{marginTop:'1.5rem'}}>Additional Notes (Optional)</label>
                <textarea 
                  className="contribution-input" 
                  placeholder="Describe your data..."
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setUploadModal(null)}>Cancel</button>
                <button className="btn-submit" onClick={handleSubmit}>
                  <Send size={16} /> Submit
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentUpload;