import React,{useState,useContext} from 'react';
import { UserContext } from '../../Context/user.context';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import FacultySidebar from '../../components/FacultySidebar';
import './InstituteFaculty.css'; // New dedicated CSS file
import Logout_Modal from '../../components/Logout_Modal';

const InstituteFaculty = () => {
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
    <div className="faculty-layout">
      <FacultySidebar onLogoutClick={() => setIsModalOpen(true)} />
      <main className="faculty-content">
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

export default InstituteFaculty;