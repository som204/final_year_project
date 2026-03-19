import React,{useState,useContext} from 'react';
import { UserContext } from '../../Context/user.context';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import StudentSidebar from '../../components/StudentSidebar';
import Logout_Modal from '../../components/Logout_Modal';
import { 
  FileText, 
  Search, 
  Eye, 
  UploadCloud, 
  Send, 
  X, 
  Calendar,
  Building2,
  AlertCircle
} from "lucide-react";

const Student = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
    const { logout } = useContext(UserContext);
    const navigate = useNavigate();
  
    // 2. The logout logic now lives in the layout
    const handleLogoutConfirm = () => {
      logout();
      navigate('/login');
      setIsModalOpen(false); // Close modal after action
    };
  return (
     <>
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-50">
      <StudentSidebar onLogoutClick={() => setIsModalOpen(true)} />
      <main className="flex-1 h-full overflow-y-auto w-full p-4 md:p-8">
        <Outlet />
      </main>
    </div>
    <Logout_Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="Confirm Logout"
      >
        <p>Are you sure you want to log out?</p>
      </Logout_Modal>
      </>
  );
};

export default Student;