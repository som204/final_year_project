import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { Building, Users, UserCheck } from 'lucide-react';


const DashboardPage = () => {
  // 1. Refactored state: The stats object is now three separate state variables
  const [totalInstitutes, setTotalInstitutes] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const [recentInstitutes, setRecentInstitutes] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchDashboardData = async () => {

      try {
        const [studentsResponse, institutesResponse, reportsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/user/all`, {
            credentials: 'include',
            method: 'GET',
          }),
          fetch(`${API_BASE_URL}/institute/all`, {
            credentials: 'include',
            method: 'GET',
          }),
          fetch(`${API_BASE_URL}/reports/all`, {
            credentials: 'include',
            method: 'GET',
          }),
        ]);

        if (!studentsResponse.ok || !institutesResponse.ok || !reportsResponse.ok) {
          throw new Error('Failed to fetch dashboard data.');
        }

        const studentsData = await studentsResponse.json();
        const institutesData = await institutesResponse.json();
        const reportsData = await reportsResponse.json();

        setTotalReports(reportsData.length);

        const totalStudentsCount = studentsData.filter(student => {
          return student.role === 'STUDENT';
        }).length;
        const totalInstitutesCount = institutesData.length;

        // Calculate recent institutes (added within last 7 days)
        const now = new Date();
        const recentInstitutesList = institutesData.filter(inst => {
          const createdAt = new Date(inst.created_at);
          const diffInMs = now.getTime() - createdAt.getTime();
          const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
          return diffInDays <= 7;
        });

        setTotalInstitutes(totalInstitutesCount);
        setTotalStudents(totalStudentsCount);
        setRecentInstitutes(recentInstitutesList);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500 min-h-screen bg-slate-50">
        <div className="animate-spin mr-3 text-indigo-600 w-8 h-8 border-b-2 border-indigo-600 rounded-full"></div>
        <span className="font-medium text-lg">Loading Dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-4 rounded-xl font-medium max-w-2xl mx-auto flex items-center shadow-sm">
          <AlertCircle className="w-6 h-6 mr-3" />
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 md:mb-10">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Super Admin Dashboard</h1>
          <p className="text-slate-500 mt-2 font-medium">Platform overview and recent activity</p>
        </header>
        
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-5 hover:border-indigo-100 hover:shadow-md transition-all group overflow-hidden relative">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 z-10 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Building size={28} />
            </div>
            <div className="z-10">
              <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Total Institutes</p>
              <span className="text-3xl font-bold text-slate-800">{totalInstitutes}</span>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-5 hover:border-emerald-100 hover:shadow-md transition-all group overflow-hidden relative">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 z-10 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Users size={28} />
            </div>
            <div className="z-10">
              <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Total Students</p>
              <span className="text-3xl font-bold text-slate-800">{totalStudents}</span>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-5 hover:border-violet-100 hover:shadow-md transition-all group overflow-hidden relative">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-violet-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
            <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 z-10 group-hover:bg-violet-600 group-hover:text-white transition-colors">
              <UserCheck size={28} />
            </div>
            <div className="z-10">
              <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Total Reports</p>
              <span className="text-3xl font-bold text-slate-800">{totalReports}</span>
            </div>
          </div>
        </div>
        
        {/* RECENT INSTITUTES SECTION */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Recently Added Institutes</h2>
              <p className="text-sm font-medium text-slate-500 mt-0.5">Institutes registered in the last 7 days</p>
            </div>
          </div>
          
          <div className="p-0">
            {/* DESKTOP VIEW */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="py-4 px-6 bg-slate-50/30 text-slate-500 font-semibold text-sm border-b border-slate-100 whitespace-nowrap">Institute Name</th>
                    <th className="py-4 px-6 bg-slate-50/30 text-slate-500 font-semibold text-sm border-b border-slate-100 whitespace-nowrap w-48">Code</th>
                    <th className="py-4 px-6 bg-slate-50/30 text-slate-500 font-semibold text-sm border-b border-slate-100 whitespace-nowrap">Contact Email</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {recentInstitutes.length > 0 ? (
                    recentInstitutes.map((inst) => (
                      <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6 border-b border-slate-50 font-bold text-slate-800 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex flex-col justify-center items-center text-xs tracking-tighter shrink-0 border border-indigo-100/50">
                            {inst.code?.substring(0, 3)}
                          </div>
                          <span>{inst.name}</span>
                        </td>
                        <td className="py-4 px-6 border-b border-slate-50 text-slate-600 font-medium">
                          <span className="inline-flex py-1 px-3 rounded-lg bg-slate-100 text-slate-600 text-xs tracking-widest">{inst.code}</span>
                        </td>
                        <td className="py-4 px-6 border-b border-slate-50 text-slate-600">{inst.contact_email || 'N/A'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Building className="w-10 h-10 text-slate-200" />
                          <p>No recent institutes found.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE VIEW */}
            <div className="md:hidden flex flex-col p-4 gap-4 bg-slate-50/30">
              {recentInstitutes.length > 0 ? (
                recentInstitutes.map((inst) => (
                  <div key={inst.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex flex-col justify-center items-center font-bold text-xs tracking-tighter shrink-0 border border-indigo-100/50">
                        {inst.code?.substring(0, 3)}
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-bold text-slate-800 leading-tight">{inst.name}</h3>
                        <span className="text-xs font-medium text-slate-400 mt-0.5 tracking-widest uppercase">{inst.code}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 text-sm bg-slate-50 p-3 rounded-xl">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Contact Email</span>
                      <span className="text-slate-700 font-medium break-all">{inst.contact_email || 'N/A'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-100">
                  <Building className="mx-auto mb-3 text-slate-200 w-10 h-10" />
                  <p className="font-medium text-sm">No recent institutes found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;