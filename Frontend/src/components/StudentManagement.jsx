import React, { useState, useMemo, useEffect, useContext } from "react";
import { 
  Search, 
  Edit, 
  Trash2, 
  X, 
  Filter,
  Loader
} from "lucide-react";
 
import { UserContext } from '../Context/user.context';
import { API_BASE_URL } from '../config';

const STATUSES = {true: 'Approved', false: 'Pending'};  

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Added "phone" to the current student state
  const [currentStudent, setCurrentStudent] = useState({ 
    id: null, full_name: "", username: "", email: "", phone: "", department_id: 0, is_approved: false 
  });
  
  const { user } = useContext(UserContext);
  const [departments, setDepartments] = useState({});

  // --- Fetch Dummy Data ---
  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const [usersResponse, deptsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/user/institute/${user.institute_id}`, { credentials: 'include', method: 'GET' }),
          fetch(`${API_BASE_URL}/department/institute/${user.institute_id}`, { credentials: 'include', method: 'GET' })
        ]);

        if (!usersResponse.ok || !deptsResponse.ok) throw new Error("Failed to fetch data");

        const users = await usersResponse.json();
        const deptsData = await deptsResponse.json();

        // Create dept map for quick lookup
        const deptMap = deptsData.reduce((acc, dept) => {
          acc[dept.id] = dept.name;
          return acc;
        }, {});
        setDepartments(deptMap);
        
        const formattedStudents = users
          .filter(u => u.role === 'STUDENT')
          .map((u) => ({
            id: u.id,
            full_name: u.full_name,
            email: u.email,
            username: u.username,
            phone: u.phone || "N/A", // Added phone mapping
            department_id: u.department_id,
            is_approved: u.is_approved
          }));
        setStudents(formattedStudents);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.institute_id) {
        fetchStudents();
    }
  }, [user?.institute_id]);

  // --- Filtering Logic ---
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = 
        (student.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.phone || "").includes(searchTerm);
      const matchesDept = deptFilter === "all" || String(student.department_id) === deptFilter;
      return matchesSearch && matchesDept;
    });
  }, [students, searchTerm, deptFilter]);

  // --- Handlers ---
  const handleEditClick = (student) => {
    setCurrentStudent({ ...student });
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student record?")) return;
    
    try {
      await fetch(`${API_BASE_URL}/user/${id}`, {
        method: 'DELETE',
      });
      setStudents(students.filter(s => s.id !== id));
    } catch (err) {
      alert("Failed to delete student.");
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log("Updating student with data:", currentStudent);
      await fetch(`${API_BASE_URL}/user/${currentStudent.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          full_name: currentStudent.full_name,
          phone: currentStudent.phone, // Include phone in update payload
          department_id: currentStudent.department_id,
          is_approved: currentStudent.is_approved
        }),
        credentials: 'include',
        headers: { 'Content-type': 'application/json; charset=UTF-8' },
      });
      setStudents(students.map(s => s.id === currentStudent.id ? currentStudent : s));
      setIsModalOpen(false);
    } catch (err) {
      alert("Failed to update student.");
    }
  };

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Student Management</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage student records and approvals</p>
        </header>

        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by Name, Roll No, or Phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium placeholder:font-normal placeholder:text-slate-400"
            />
          </div>
          
          <div className="relative w-full md:w-64 group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" size={20} />
            <select 
              value={deptFilter} 
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium appearance-none cursor-pointer text-slate-700"
            >
              <option value="all">All Departments</option>
              {Object.entries(departments).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ERROR OR LOADING STATE */}
        {isLoading ? (
          <div className="flex items-center justify-center p-12 text-slate-500">
            <Loader className="animate-spin mr-3 text-indigo-600" size={24} /> 
            <span className="font-medium">Loading students data...</span>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl mb-6 font-medium">{error}</div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100 whitespace-nowrap">Roll No</th>
                      <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100 whitespace-nowrap">Name</th>
                      <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100 min-w-[150px]">Contact Info</th>
                      <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100 whitespace-nowrap">Department</th>
                      <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100 whitespace-nowrap">Status</th>
                      <th className="py-4 px-6 bg-slate-50/50 text-slate-500 font-semibold text-sm border-b border-slate-100 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="py-4 px-6 border-b border-slate-50 font-bold text-slate-800 whitespace-nowrap">{student.username}</td>
                          <td className="py-4 px-6 border-b border-slate-50 font-medium text-slate-700 whitespace-nowrap">{student.full_name}</td>
                          <td className="py-4 px-6 border-b border-slate-50">
                            <div className="flex flex-col gap-0.5 whitespace-nowrap">
                              <span className="text-slate-700 font-medium">{student.phone}</span>
                              <span className="text-xs text-slate-500">{student.email}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 border-b border-slate-50 text-slate-600 whitespace-nowrap">
                            <span className="inline-flex py-1 px-3 rounded-full bg-slate-100 text-slate-600 font-medium text-xs">
                              {departments[student.department_id] || "Unknown"}
                            </span>
                          </td>
                          <td className="py-4 px-6 border-b border-slate-50 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                              student.is_approved === true || student.is_approved === 'true' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {STATUSES[student.is_approved]}
                            </span>
                          </td>
                          <td className="py-4 px-6 border-b border-slate-50 text-right whitespace-nowrap">
                            <button 
                              className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors mr-2 focus:ring-2 focus:ring-indigo-200 outline-none" 
                              onClick={() => handleEditClick(student)} 
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors focus:ring-2 focus:ring-rose-200 outline-none" 
                              onClick={() => handleDeleteClick(student.id)} 
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <Search className="w-10 h-10 text-slate-200" />
                            <p>No students found matching your criteria.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MOBILE CARD VIEW */}
            <div className="md:hidden flex flex-col gap-4">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <div key={student.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4 relative">
                    <div className="flex justify-between items-start gap-2 pr-16">
                      <div className="flex flex-col">
                        <h3 className="font-bold text-slate-800 text-lg leading-tight">{student.full_name}</h3>
                        <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider">{student.username}</p>
                      </div>
                    </div>
                    
                    <div className="absolute top-5 right-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        student.is_approved === true || student.is_approved === 'true' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {STATUSES[student.is_approved]}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium text-xs uppercase">Department</span>
                        <span className="font-medium text-slate-700">{departments[student.department_id] || "Unknown"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium text-xs uppercase">Phone</span>
                        <span className="font-medium text-slate-700">{student.phone}</span>
                      </div>
                      <div className="flex flex-col gap-0.5 mt-1 border-t border-slate-200 pt-2 break-all">
                        <span className="text-slate-400 font-medium text-xs uppercase">Email</span>
                        <span className="font-medium text-slate-700">{student.email}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between gap-3 pt-2">
                       <button 
                          className="flex-1 flex justify-center items-center gap-2 py-2.5 text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 rounded-xl transition-colors font-medium text-sm" 
                          onClick={() => handleEditClick(student)}
                        >
                          <Edit size={16} /> Edit
                        </button>
                        <button 
                          className="flex-1 flex justify-center items-center gap-2 py-2.5 text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded-xl transition-colors font-medium text-sm" 
                          onClick={() => handleDeleteClick(student.id)}
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-slate-500 bg-white rounded-2xl border border-slate-100">
                  <Search className="mx-auto mb-3 text-slate-200 w-12 h-12" />
                  <p className="font-medium">No students found matching your criteria.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* --- EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="px-5 md:px-6 py-4 md:py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 shrink-0">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">Edit Student</h3>
              <button className="text-slate-400 hover:text-slate-600 transition-colors p-1" onClick={() => setIsModalOpen(false)}>
                <X size={24}/>
              </button>
            </div>
            
            <div className="p-5 md:p-6 overflow-y-auto">
              <form onSubmit={handleModalSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      value={currentStudent.full_name}
                      onChange={(e) => setCurrentStudent({...currentStudent, full_name: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Roll Number (Username)</label>
                    <input 
                      type="text" 
                      required 
                      disabled // Usually, usernames/roll numbers shouldn't be edited easily
                      value={currentStudent.username}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-500 bg-slate-100 cursor-not-allowed font-medium shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      disabled // Emails are also generally tied to identity
                      value={currentStudent.email}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-500 bg-slate-100 cursor-not-allowed font-medium shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                    <input 
                      type="tel" 
                      required 
                      value={currentStudent.phone}
                      onChange={(e) => setCurrentStudent({...currentStudent, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
                    <select 
                      value={currentStudent.department_id || 0} 
                      onChange={(e) => setCurrentStudent({...currentStudent, department_id: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium appearance-none shadow-sm cursor-pointer"
                    >
                      <option value={0}>Select Department</option>
                      {Object.entries(departments).map(([id, name]) => (
                        <option key={id} value={id}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                    <select 
                      value={String(currentStudent.is_approved)} 
                      onChange={(e) => setCurrentStudent({...currentStudent, is_approved: e.target.value === 'true'})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium appearance-none shadow-sm cursor-pointer"
                    >
                      {Object.entries(STATUSES).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-100">
                  <button type="button" className="px-5 md:px-6 py-2.5 text-slate-600 font-medium rounded-xl hover:bg-slate-100 transition-colors w-full md:w-auto" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="px-5 md:px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5 transition-all w-full md:w-auto">
                    Update Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentManagement;