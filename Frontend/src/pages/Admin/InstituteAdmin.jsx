
import React,{useState,useContext} from 'react';
import { UserContext } from '../../Context/user.context';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import InstituteSidebar from '../../components/InstituteSidebar';
import './InstituteAdmin.css'; // New dedicated CSS file
import Logout_Modal from '../../components/Logout_Modal';

const InstituteAdmin = () => {
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
    <div className="ia-layout">
      <InstituteSidebar onLogoutClick={() => setIsModalOpen(true)} />
      <main className="ia-content">
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

export default InstituteAdmin;