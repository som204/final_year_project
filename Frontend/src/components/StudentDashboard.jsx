import React, { useState, useEffect, useContext } from "react";
import { 
  FileCheck2, 
  Users, 
  User, 
  FileText,
  Calendar,
  Eye,
  Download,
  Loader,
  Building2
} from "lucide-react";

import { UserContext } from '../Context/user.context';
import { API_BASE_URL } from '../config';

const StudentDashboard = () => {
  const { user, token } = useContext(UserContext);

  // API Data State
  const [reports, setReports] = useState([]);
  const [studentsCount, setStudentsCount] = useState(0);
  const [facultyCount, setFacultyCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !token) {
        setIsLoading(false);
        setError("Authentication required.");
        return;
      }

      try {
        const [reportsRes, usersRes] = await Promise.all([
          // 1. Fetch Reports for the institute
          fetch(`${API_BASE_URL}/reports/institute/${user.institute_id}`, {
            credentials: 'include',
            method: 'GET',
          }),
          // 2. Fetch Users for the institute (to count students & faculty in dept)
          fetch(`${API_BASE_URL}/user/institute/${user.institute_id}`, {
            credentials: 'include',
            method: 'GET',
          }),
        ]);

        if (!reportsRes.ok) throw new Error('Failed to fetch reports.');
        if (!usersRes.ok) throw new Error('Failed to fetch users.');

        const reportsData = await reportsRes.json();
        const usersData = await usersRes.json();

        // Filter reports to only "public" ones (visible to students)
        const publicReports = reportsData.filter(r => r.share === 'public');
        setReports(publicReports);

        // Filter users by the student's own department
        const deptUsers = usersData.filter(u => u.department_id === user.department_id);
        setStudentsCount(deptUsers.filter(u => u.role === 'STUDENT').length);
        setFacultyCount(deptUsers.filter(u => u.role === 'FACULTY').length);

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, token]);

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">Loading Dashboard Data...</p>
          </div>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-rose-50 border border-rose-200 text-rose-600 px-6 py-4 rounded-xl font-medium shadow-sm flex items-start gap-3">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {error}
          </div>
        </div>
      </div>
    );
  }

  // Recent reports (sorted newest first, top 5)
  const recentReports = [...reports]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  // Stats cards data
  const stats = [
    { label: "Total Reports", value: reports.length, icon: <FileCheck2 size={24} />, bgColor: "bg-blue-50", textColor: "text-blue-600" },
    { label: "Students in Dept", value: studentsCount, icon: <Users size={24} />, bgColor: "bg-purple-50", textColor: "text-purple-600" },
    { label: "Faculty in Dept", value: facultyCount, icon: <User size={24} />, bgColor: "bg-emerald-50", textColor: "text-emerald-600" },
  ];

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER CARD */}
        <div className="bg-indigo-600 rounded-3xl p-8 md:p-10 text-white shadow-lg relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Welcome back, {user?.full_name || 'Student'}</h1>
              <p className="text-indigo-200 font-medium text-lg flex flex-wrap items-center gap-2">
                <span>{user?.dept_name || 'Your Department'}</span>
                <span className="hidden md:inline">•</span>
                <span className="bg-indigo-500/50 px-3 py-1 rounded-full text-sm">ID: {user?.username || 'N/A'}</span>
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/20 self-start md:self-auto">
              <Building2 size={24} className="text-indigo-100" />
              <span className="font-semibold text-indigo-50">{user?.institute_name || 'Your Institute'}</span>
            </div>
          </div>
          
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-5 mix-blend-overlay"></div>
          <div className="absolute bottom-0 right-32 -mb-20 w-48 h-48 rounded-full bg-indigo-400 opacity-20 mix-blend-overlay"></div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-75 fill-mode-both">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 ${stat.bgColor} ${stat.textColor}`}>
                {stat.icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{stat.value}</h3>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* RECENT REPORTS SECTION */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-800">Recent Reports</h2>
          </div>
          
          {/* DESKTOP TABLE */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100">Report Name</th>
                  <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100">Visibility</th>
                  <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100 text-right">Created On</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentReports.length > 0 ? (
                  recentReports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50/80 transition-colors group border-b border-slate-50 last:border-0">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                            <FileText size={18} />
                          </div>
                          <span className="font-bold text-slate-800">{report.file_name || report.title || `Report #${report.id}`}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200">
                          {report.share || 'Public'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-medium text-right">
                        {new Date(report.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileCheck2 className="w-10 h-10 text-slate-200" />
                        <p className="font-medium">No public reports available yet.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE LIST */}
          <div className="md:hidden flex flex-col divide-y divide-slate-100">
            {recentReports.length > 0 ? (
              recentReports.map((report) => (
                <div key={report.id} className="p-5 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 leading-tight truncate">{report.file_name || report.title || `Report #${report.id}`}</h3>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="inline-flex items-center py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200">
                      {report.share || 'Public'}
                    </span>
                    <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                      <Calendar size={14} />
                      {new Date(report.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-slate-500">
                <FileCheck2 className="mx-auto mb-3 text-slate-300 w-10 h-10" />
                <p className="font-medium px-4">No public reports available yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;