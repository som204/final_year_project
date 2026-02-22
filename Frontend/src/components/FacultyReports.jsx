import React, { useState, useEffect, useContext } from "react";
import { 
  FileText, 
  Search, 
  Eye, 
  MessageSquare, 
  Send, 
  X, 
  Calendar,
  User,
  Loader
} from "lucide-react";
import '../pages/Faculty/InstituteFaculty.css';
import { UserContext } from '../Context/user.context';
import axios from "axios";

const FacultyReports = () => {
  const { user } = useContext(UserContext);
  
  // State for API Data
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Fetch Reports (Now contains comments nested inside) ---
  useEffect(() => {
    const fetchReports = async () => {
      if (!user?.institute_id) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/reports/institute/${user.institute_id}`, { 
          credentials: 'include' 
        });

        if (!response.ok) throw new Error("Failed to fetch reports");
        
        const reportsData = await response.json();
        console.log("Fetched reports with comments:", reportsData);
        setReports(reportsData);

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [user?.institute_id]);

  // --- Filter Logic ---
  const filteredReports = reports.filter(r => 
    (r.file_name || r.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // FIX: Filter comments to ONLY show ones matching the logged-in user's ID
  const currentComments = (selectedReport?.comments || []).filter(
    (comment) => comment.user_id === user.id || (comment.user && comment.user.id === user.id)
  );

  // --- Handlers ---
  const handleAddComment = async () => {
    if (!newComment.trim() || isSubmitting) return;
    console.log("Submitting comment:", newComment, "for report ID:", selectedReport.id);
    setIsSubmitting(true);
    try {
      // POST new comment to backend using report_id, user_id, and comment text
      const response = await fetch(`http://localhost:8000/reports/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          report_id: selectedReport.id,
          user_id: user.id,
          comment_text: newComment
        })
      });

      if (!response.ok) throw new Error("Failed to submit feedback");
      
      const savedComment = await response.json();
      
      // Attach the context user's info to the comment immediately 
      const enrichedComment = {
        ...savedComment,
        user_id: user.id, // Explicitly set this so our filter above catches it immediately
        user: {
          id: user.id,
          full_name: user?.full_name || user?.username || "You",
          department: {
            name: user?.department?.name || user?.department_name || "Your Department"
          }
        }
      };
      
      // Update the local state to show the new comment immediately
      const updatedReports = reports.map(r => {
        if (r.id === selectedReport.id) {
          return { ...r, comments: [...(r.comments || []), enrichedComment] };
        }
        return r;
      });
      
      setReports(updatedReports);
      
      // Update the selected report in the modal so it triggers a re-render of the comment list
      setSelectedReport(prev => ({ 
        ...prev, 
        comments: [...(prev.comments || []), enrichedComment] 
      }));
      
      setNewComment("");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewPdf = async (reportId) => {
    console.log("Attempting to view report with ID:", reportId);
    try {
      // Fetch the generated PDF from the backend
      const res = await axios.get(`http://localhost:8000/reports/${reportId}`, {
        withCredentials: true,
        headers: { Accept: "application/json" },
      });
      const data = res.data;
      const html = data.html_report;
      if (html) {
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        return;
      }
      throw new Error("No viewable report content returned from server.");
    } catch (err) {
      alert("Error opening report: " + err.message);
    }
  };

  return (
    <div className="faculty-layout">
      <div className="faculty-content">
        <h1>Faculty Reports</h1>
        <p className="page-subheading">View reports and submit your feedback.</p>

        {/* Search Bar */}
        <div className="list-controls">
          <div className="search-bar">
            <Search size={20} color="#6c757d" />
            <input 
              type="text" 
              placeholder="Search reports..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Loading / Error States */}
          {isLoading ? (
            <div style={{display: 'flex', alignItems: 'center', gap: 10, color: '#6c757d', padding: '2rem'}}>
              <Loader className="spinner" size={24} /> Loading reports...
            </div>
          ) : error ? (
            <div className="form-message error">{error}</div>
          ) : (
            /* Reports Grid */
            <div className="faculty-reports-grid">
              {filteredReports.filter(r => r.share === 'shared' || r.share === 'public').length > 0 ? (
                filteredReports
            .filter(r => r.share === 'shared' || r.share === 'public')
            .map((report) => (
            <div key={report.id} className="faculty-report-card">
              <div className="report-icon-wrapper">
                <FileText size={32} color="#563D7C" />
              </div>
              <div className="report-details">
                <h3>{report.file_name || report.title || `Report #${report.id}`}</h3>
                <div className="report-meta">
                  <span><Calendar size={14}/> {new Date(report.created_at).toLocaleDateString()}</span>
                  {report.author_name && <span><User size={14}/> {report.author_name}</span>}
                </div>
              </div>
              <div className="report-actions">
                <button 
                  className="icon-btn view-btn" 
                  onClick={() => handleViewPdf(report.id)}
                  title="View Report"
                >
                  <Eye size={18} />
                </button>
                <button 
                  className="icon-btn comment-btn" 
                  onClick={() => setSelectedReport(report)}
                  title="Give Feedback"
                >
                  <MessageSquare size={18} />
                </button>
              </div>
            </div>
                ))
              ) : (
                <p style={{ color: '#6c757d', gridColumn: '1 / -1' }}>No reports found.</p>
              )}
            </div>
          )}

          {/* COMMENTS MODAL */}
        {selectedReport && (
          <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
            <div className="modal-content faculty-modal" onClick={e => e.stopPropagation()}>
              
              <div className="modal-header">
                <h3>My Feedback</h3>
                <button className="close-btn" onClick={() => setSelectedReport(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-subheader">
                Report: <strong>{selectedReport.file_name || selectedReport.title}</strong>
              </div>

              <div className="comments-body">
                {currentComments.length > 0 ? (
                  <div className="comments-list">
                    {currentComments.map((comment, index) => (
                      <div key={comment.id || index} className="comment-item">
                        <div className="comment-header">
                          <div className="user-info">
                            <span className="comment-author">{comment.user?.full_name || "You"}</span>
                            <span className="comment-dept">{comment.user?.department?.name || "N/A"}</span>
                          </div>
                          <span className="comment-time">
                            {comment.created_at ? new Date(comment.created_at).toLocaleString() : "Just now"}
                          </span>
                        </div>
                        <div className="comment-content">
                          {comment.comment || comment.comment_text || comment.text}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-comments">
                    <MessageSquare size={48} strokeWidth={1} />
                    <p>You haven't submitted any feedback for this report yet.</p>
                  </div>
                )}
              </div>

              <div className="comment-input-area">
                <input 
                  type="text" 
                  placeholder="Type your feedback here..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  disabled={isSubmitting}
                />
                <button onClick={handleAddComment} className="send-btn" disabled={isSubmitting}>
                  {isSubmitting ? <Loader className="spinner" size={18} /> : <Send size={18} />}
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyReports;