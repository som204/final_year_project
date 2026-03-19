import React, { useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../config';
import { FileText, FolderGit2, FileCheck2 } from 'lucide-react';

import { UserContext } from '../Context/user.context';

const FacultyDashboard = () => {
  // State for each statistic
  const [uploadsCount, setUploadsCount] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);
  const [reportsCount, setReportsCount] = useState(0);
  
  // State for the list of active projects to display in the table
  const [activeProjects, setActiveProjects] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useContext(UserContext);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) {
        setIsLoading(false);
        setError("Authentication required.");
        return;
      }
      try {
        // 1. Fetch the FULL LISTS for uploads, projects, and reports concurrently
        const [uploadsRes, projectsRes, reportsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/uploads/${user.id}`, { // Fetches the user's uploaded files list
            credentials: 'include',
            method: 'GET',
          }),
          fetch(`${API_BASE_URL}/projects/institute/${user.institute_id}`, { // Fetches the user's projects list
            credentials: 'include',
            method: 'GET',
          }),
          fetch(`${API_BASE_URL}/reports/institute/${user.institute_id}`, { // Fetches the all reports list
            credentials: 'include',
            method: 'GET',
          })
        ]);

        if (!uploadsRes.ok || !projectsRes.ok || !reportsRes.ok) {
          throw new Error('Failed to fetch dashboard data.');
        }

        const uploadsData = await uploadsRes.json();
        const projectsData = await projectsRes.json();
        const reportsData = await reportsRes.json();

        // 2. Calculate counts from the length of the returned arrays
        setUploadsCount(uploadsData.length);
        setReportsCount(reportsData.length);

        // 3. Filter the full projects list to find and count the "ONGOING" ones
        const ongoingProjects = projectsData.filter(project => project.status === 'ONGOING');
        setProjectsCount(projectsData.length);
        setActiveProjects(ongoingProjects); // Set the list for the table

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

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

  if (error) {
    return (
      <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-rose-50 border border-rose-200 text-rose-600 px-6 py-4 rounded-xl font-medium shadow-sm">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="animate-in fade-in slide-in-from-bottom-3 duration-500">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Welcome, <span className="text-indigo-600">{user?.full_name || 'Faculty Member'}</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">
            Department of {user?.dept_name || 'your department'}
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
          
          {/* Stat Card 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner">
              <FileText size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">My Total Uploads</p>
              <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{uploadsCount}</h3>
            </div>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-inner">
              <FolderGit2 size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Institute Projects</p>
              <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{projectsCount}</h3>
            </div>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-inner">
              <FileCheck2 size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Reports Generated</p>
              <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{reportsCount}</h3>
            </div>
          </div>

        </div>

        {/* Active Projects Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500 delay-200 fill-mode-both">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-800">Total Active Projects</h2>
          </div>
          
          {/* DESKTOP TABLE */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100">Project Name</th>
                  <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100">Status</th>
                  <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100 text-right">Start Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {activeProjects.length > 0 ? (
                  activeProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-slate-50/80 transition-colors group border-b border-slate-50 last:border-0">
                      <td className="py-4 px-6 font-bold text-slate-800">{project.name}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wider
                          ${project.status === 'ONGOING' ? 'bg-amber-50 text-amber-600 border border-amber-200' : ''}
                          ${project.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : ''}
                          ${!['ONGOING', 'COMPLETED'].includes(project.status) ? 'bg-slate-100 text-slate-600 border border-slate-200' : ''}
                        `}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-medium text-right">
                        {new Date(project.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FolderGit2 className="w-8 h-8 text-slate-300" />
                        <p className="font-medium">You have no active projects.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE LIST */}
          <div className="md:hidden flex flex-col divide-y divide-slate-100">
            {activeProjects.length > 0 ? (
              activeProjects.map((project) => (
                <div key={project.id} className="p-5 flex flex-col gap-3">
                  <h3 className="font-bold text-slate-800 text-lg leading-tight">{project.name}</h3>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className={`inline-flex items-center py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wider
                      ${project.status === 'ONGOING' ? 'bg-amber-50 text-amber-600 border border-amber-200' : ''}
                      ${project.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : ''}
                      ${!['ONGOING', 'COMPLETED'].includes(project.status) ? 'bg-slate-100 text-slate-600 border border-slate-200' : ''}
                    `}>
                      {project.status.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-medium text-slate-500">
                      {new Date(project.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-slate-500">
                <FolderGit2 className="mx-auto mb-3 text-slate-300 w-10 h-10" />
                <p className="font-medium px-4">You have no active projects.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;