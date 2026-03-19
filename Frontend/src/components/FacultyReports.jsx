import React, { useState, useEffect, useContext } from "react";
import { API_BASE_URL } from "../config";
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

import { UserContext } from '../Context/user.context';

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
        const response = await fetch(`${API_BASE_URL}/reports/institute/${user.institute_id}`, { 
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
      const response = await fetch(`${API_BASE_URL}/reports/comment`, {
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
      const res = await axios.get(`${API_BASE_URL}/reports/${reportId}`, {
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
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-8 md:mb-10 animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Faculty Reports</h1>
            <p className="text-slate-500 mt-2 font-medium">View reports and submit your feedback.</p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search reports..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium placeholder:font-normal placeholder:text-slate-400"
            />
          </div>
        </header>

        {/* Loading / Error States */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-slate-100 shadow-sm animate-in fade-in duration-500">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Loading reports...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 px-6 py-4 rounded-xl font-medium shadow-sm flex items-start gap-3">
             <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             {error}
          </div>
        ) : (
          /* Reports Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
            {filteredReports.filter(r => r.share === 'shared' || r.share === 'public').length > 0 ? (
              filteredReports
                .filter(r => r.share === 'shared' || r.share === 'public')
                .map((report) => (
                  <div key={report.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-100 transition-all duration-300 overflow-hidden flex flex-col group hover:-translate-y-1">
                    <div className="p-6 flex-1 flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                          <FileText size={24} />
                        </div>
                        <div className="flex gap-2">
                          <button 
                            className="p-2 text-indigo-500 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors focus:ring-2 focus:ring-indigo-200 outline-none" 
                            onClick={() => handleViewPdf(report.id)}
                            title="View Report"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors focus:ring-2 focus:ring-emerald-200 outline-none" 
                            onClick={() => setSelectedReport(report)}
                            title="Give Feedback"
                          >
                            <MessageSquare size={18} />
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-2" title={report.file_name || report.title || `Report #${report.id}`}>
                          {report.file_name || report.title || `Report #${report.id}`}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col gap-2 text-sm text-slate-500 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        <span>{new Date(report.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      {report.author_name && (
                        <div className="flex items-center gap-2 line-clamp-1" title={report.author_name}>
                          <User size={14} className="text-slate-400" />
                          <span>{report.author_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <FileText className="mx-auto mb-4 text-slate-200 w-12 h-12" />
                <p className="font-medium text-lg text-slate-400">No shared reports found.</p>
              </div>
            )}
          </div>
        )}

        {/* COMMENTS MODAL */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800">My Feedback</h3>
                <button 
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors focus:ring-2 focus:ring-slate-200 outline-none" 
                  onClick={() => setSelectedReport(null)}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Subheader */}
              <div className="px-6 py-3 bg-indigo-50 border-b border-indigo-100/50">
                <p className="text-sm font-medium text-indigo-800 break-all line-clamp-2">
                  <span className="opacity-75 mr-1">Report:</span>
                  <strong>{selectedReport.file_name || selectedReport.title}</strong>
                </p>
              </div>

              {/* Comments Body */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                {currentComments.length > 0 ? (
                  <div className="space-y-4">
                    {currentComments.map((comment, index) => (
                      <div key={comment.id || index} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm relative">
                        {/* Tail pointer effect */}
                        <div className="absolute -left-2 top-4 border-[6px] border-transparent border-r-white z-10 w-0 h-0 filter drop-shadow-[-1px_0px_1px_rgba(0,0,0,0.02)]"></div>
                        <div className="absolute -left-2.5 top-4 border-[6px] border-transparent border-r-slate-100 w-0 h-0"></div>
                        
                        <div className="flex justify-between items-start mb-2 gap-4">
                          <div>
                            <span className="font-bold text-slate-800 text-sm">{comment.user?.full_name || "You"}</span>
                            <span className="text-xs text-slate-500 ml-2 font-medium bg-slate-100 px-2 py-0.5 rounded-full">{comment.user?.department?.name || "N/A"}</span>
                          </div>
                          <span className="text-xs text-slate-400 font-medium shrink-0">
                            {comment.created_at ? new Date(comment.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : "Just now"}
                          </span>
                        </div>
                        <div className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                          {comment.comment || comment.comment_text || comment.text}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center text-slate-500">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <MessageSquare size={32} className="text-slate-300" />
                    </div>
                    <p className="font-medium text-slate-600">You haven't submitted any feedback yet.</p>
                    <p className="text-sm text-slate-400 mt-1">Add your comments below.</p>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Type your feedback here..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium placeholder:font-normal placeholder:text-slate-400 disabled:opacity-70 disabled:bg-slate-100"
                  />
                  <button 
                    onClick={handleAddComment} 
                    disabled={isSubmitting || !newComment.trim()}
                    className="px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center shrink-0 shadow-sm shadow-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <Loader className="animate-spin" size={20} /> : <Send size={20} className="mr-1 -ml-1.5" /> }
                    <span className="font-semibold ml-1 hidden sm:inline">Send</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyReports;