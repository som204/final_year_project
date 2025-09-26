import React,{useState,useContext} from 'react';
import { UserContext } from '../../Context/user.context';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Logout_Modal from '../../components/Logout_Modal';
import './SuperAdmin.css'; // New CSS file for the entire admin section

const SuperAdmin = () => {
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
    <div className="admin-layout">
      <Sidebar onLogoutClick={() => setIsModalOpen(true)} />
      <main className="admin-content">
        <Outlet /> {/* Child pages will be rendered here */}
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

export default SuperAdmin;