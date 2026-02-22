import React, { useState, useMemo, useEffect, useContext } from "react";
import { 
  Search, 
  Edit, 
  Trash2, 
  X, 
  Filter,
  Loader
} from "lucide-react";
import '../pages/Admin/InstituteAdmin.css'; 
import { UserContext } from '../Context/user.context';

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
          fetch(`http://localhost:8000/user/institute/${user.institute_id}`, { credentials: 'include', method: 'GET' }),
          fetch(`http://localhost:8000/department/institute/${user.institute_id}`, { credentials: 'include', method: 'GET' })
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
      await fetch(`http://localhost:8000/user/${id}`, {
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
      await fetch(`http://localhost:8000/user/${currentStudent.id}`, {
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
    <div className="management-page">
      <h1>Student Management</h1>

      {/* CONTROLS */}
      <div className="list-controls">
        <div className="search-bar">
          <Search size={20} color="#6c757d" />
          <input 
            type="text" 
            placeholder="Search by Name, Roll No, or Phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-bar">
          <Filter size={20} color="#6c757d" />
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="all">All Departments</option>
            {Object.entries(departments).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ERROR OR LOADING STATE */}
      {isLoading ? (
        <div style={{display: 'flex', alignItems: 'center', gap: 10, color: '#6c757d', padding: '2rem'}}>
          <Loader className="spinner" size={24} /> Loading students data...
        </div>
      ) : error ? (
        <div className="form-message error">{error}</div>
      ) : (
        /* TABLE */
        <table className="data-table ia-data-table">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Contact Info</th>
              <th>Department</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td style={{fontWeight: '600', color: '#333'}}>{student.username}</td>
                  <td style={{fontWeight: '500'}}>{student.full_name}</td>
                  <td>
                    <div style={{display:'flex', flexDirection:'column'}}>
                      <span style={{fontSize:'0.9rem'}}>{student.phone}</span>
                      <span style={{fontSize:'0.8rem', color:'#6c757d'}}>{student.email}</span>
                    </div>
                  </td>
                  <td>{departments[student.department_id] || "Unknown"}</td>
                  <td>
                    <span className={`status-badge ${student.is_approved === true || student.is_approved === 'true' ? 'status-completed' : 'status-on_hold'}`}>
                      {STATUSES[student.is_approved]}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="action-button view" onClick={() => handleEditClick(student)} title="Edit">
                      <Edit size={16} />
                    </button>
                    <button className="action-button delete" onClick={() => handleDeleteClick(student.id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '2rem', color: '#6c757d'}}>
                  No students found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* --- EDIT MODAL --- */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content small-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Student</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20}/>
              </button>
            </div>
            
            <form onSubmit={handleModalSubmit} className="ia-form" style={{boxShadow: 'none', padding: '1.5rem', margin: 0}}>
              
              <div className="form-row">
                <div>
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={currentStudent.full_name}
                    onChange={(e) => setCurrentStudent({...currentStudent, full_name: e.target.value})}
                  />
                </div>
                <div>
                  <label>Roll Number (Username)</label>
                  <input 
                    type="text" 
                    required 
                    disabled // Usually, usernames/roll numbers shouldn't be edited easily
                    style={{backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed'}}
                    value={currentStudent.username}
                  />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    required 
                    disabled // Emails are also generally tied to identity
                    style={{backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed'}}
                    value={currentStudent.email}
                  />
                </div>
                <div>
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    required 
                    value={currentStudent.phone}
                    onChange={(e) => setCurrentStudent({...currentStudent, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label>Department</label>
                  <select 
                    value={currentStudent.department_id || 0} 
                    onChange={(e) => setCurrentStudent({...currentStudent, department_id: parseInt(e.target.value)})}
                  >
                    <option value={0}>Select Department</option>
                    {Object.entries(departments).map(([id, name]) => (
                      <option key={id} value={id}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Status</label>
                  <select 
                    value={String(currentStudent.is_approved)} 
                    onChange={(e) => setCurrentStudent({...currentStudent, is_approved: e.target.value === 'true'})}
                  >
                    {Object.entries(STATUSES).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-actions" style={{marginTop: '1.5rem', borderTop: 'none', padding: 0}}>
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)} style={{marginRight: '1rem'}}>Cancel</button>
                <button type="submit" className="button button-accent" style={{width: 'auto'}}>
                  Update Student
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentManagement;