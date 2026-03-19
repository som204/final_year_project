import React, {useState , useEffect, useContext } from 'react';
import { Book, User, Users, FileUp, FileCheck2, Loader, AlertCircle } from 'lucide-react';

import { UserContext } from '../Context/user.context';
import { API_BASE_URL } from '../config';

const InstituteDashboard = () => {
  // State management for API data, loading, and errors
  const [departments, setDepartments] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [projects, setprojects] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [generatedReports, setGeneratedReports] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user, token } = useContext(UserContext);

  // useEffect to fetch all data concurrently when the component mounts
   useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !token) {
        setIsLoading(false);
        setError("Authentication required.");
        return;
      }

      try {
        const [
          departmentsResponse,
          facultyResponse,
          projectsResponse,
          uploadsResponse,
          reportsResponse
        ] = await Promise.all([
          // 1. Fetch Departments
          fetch(`${API_BASE_URL}/department/institute/${user.institute_id}`, {
            credentials: 'include',
            method: 'GET',
          }),
          // 2. Fetch Faculty
          fetch(`${API_BASE_URL}/user/institute/${user.institute_id}`, {
            credentials: 'include',
            method: 'GET',
            
          }),
          // 3. Fetch projects
          fetch(`${API_BASE_URL}/projects/institute/${user.institute_id}`, {
            credentials: 'include',
            method: 'GET',
          }),
          // 4. Fetch Uploaded Files
          fetch(`${API_BASE_URL}/uploads/institute/${user.institute_id}`, {
            credentials: 'include',
            method: 'GET',
          }),
          // 5. Fetch Generated Reports
          fetch(`${API_BASE_URL}/reports/institute/${user.institute_id}`, {
            credentials: 'include',
            method: 'GET',
          })
        ]);

        // Check if any request failed
        if (!departmentsResponse.ok) throw new Error('Failed to fetch departments.');
        if (!facultyResponse.ok) throw new Error('Failed to fetch faculty.');
        if (!projectsResponse.ok) throw new Error('Failed to fetch Projects.');
        if (!uploadsResponse.ok) throw new Error('Failed to fetch uploaded files.');
        if (!reportsResponse.ok) throw new Error('Failed to fetch generated reports.');

        // Parse the JSON for each successful response
        const deptsData = await departmentsResponse.json();
        const facultyData = await facultyResponse.json();
        const projectsData = await projectsResponse.json();
        const uploadsData = await uploadsResponse.json();
        const reportsData = await reportsResponse.json();

        // Update state with the fetched data
        setDepartments(deptsData);
        setFaculty(facultyData.filter(user => user.role === 'FACULTY'));
        setprojects(projectsData);
        setUploadedFiles(uploadsData);
        setGeneratedReports(reportsData);

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, token]);// Re-run this effect if the user or token changes

  // Display a loading message while data is being fetched
  if (isLoading) {
    return (
      <div className="loading-message">
        <Loader className="spinner" /> Loading Dashboard Data...
      </div>
    );
  }

  // Display an error message if the API calls failed
  if (error) {
    return (
      <div className="form-message error">
        <AlertCircle /> {error}
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Institute Dashboard</h1>
          <p className="text-slate-500 mt-2 font-medium">Overview for {user.institute_name}</p>
        </header>
        
        {/* Key Performance Indicator (KPI) Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {/* KPIs are calculated directly from the .length of the fetched arrays */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
              <Book size={28} />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Departments</p>
            <span className="text-3xl font-extrabold text-slate-800">{departments.length}</span>
          </div>
          
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
              <User size={28} />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total Faculty</p>
            <span className="text-3xl font-extrabold text-slate-800">{faculty.length}</span>
          </div>
          
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
              <Users size={28} />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total Projects</p>
            <span className="text-3xl font-extrabold text-slate-800">{projects.length}</span>
          </div>
          
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mb-4">
              <FileUp size={28} />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Files Uploaded</p>
            <span className="text-3xl font-extrabold text-slate-800">{uploadedFiles.length}</span>
          </div>
          
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
              <FileCheck2 size={28} />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Reports Gen'd</p>
            <span className="text-3xl font-extrabold text-slate-800">{generatedReports.length}</span>
          </div>
        </div>

        {/* Latest Data Submissions Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-800">Latest Data Submissions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-4 px-8 bg-slate-50 text-slate-500 font-semibold text-sm">File Name</th>
                  <th className="py-4 px-8 bg-slate-50 text-slate-500 font-semibold text-sm">Project</th>
                  <th className="py-4 px-8 bg-slate-50 text-slate-500 font-semibold text-sm">Uploaded By</th>
                  <th className="py-4 px-8 bg-slate-50 text-slate-500 font-semibold text-sm">Department</th>
                  <th className="py-4 px-8 bg-slate-50 text-slate-500 font-semibold text-sm">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {uploadedFiles.length > 0 ? (
                  [...uploadedFiles]
                    .sort((a, b) => new Date(b.upload_time) - new Date(a.upload_time))
                    .slice(0, 5)
                    .map((upload) => (
                      <tr key={upload.id} className="hover:bg-slate-50/80 transition-colors border-t border-slate-100 group">
                        <td className="py-4 px-8 font-medium text-slate-800">{upload.name}</td>
                        <td className="py-4 px-8 text-slate-600">{upload.project_name || 'N/A'}</td>
                        <td className="py-4 px-8 text-slate-600">{upload.faculty_name || 'N/A'}</td>
                        <td className="py-4 px-8 text-slate-600">
                          <span className="inline-flex py-1 px-3 rounded-full bg-slate-100 text-slate-600 font-medium text-xs">
                            {upload.department_name || 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-8 text-slate-500">{new Date(upload.upload_time).toLocaleDateString()}</td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <FileUp className="w-12 h-12 text-slate-200" />
                        <p>No files have been uploaded yet.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstituteDashboard;
