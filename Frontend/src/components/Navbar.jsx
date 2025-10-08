import React from 'react';
import { BookOpenCheck } from 'lucide-react';
import '../pages/Home/HomePage.css';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../Context/user.context';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useContext(UserContext);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Determine dashboard route based on user role
  const getDashboardRoute = () => {
    console.log(user);
    if (!user || !user.role) return '/';
    switch (user.role) {
      case 'SUPER_ADMIN':
        return '/admin';
      case 'ADMIN':
        return '/institute-admin';
      case 'FACULTY':
        return '/faculty';
      default:
        return '/';
    }
  };

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        <a href="/" className="logo">
          <BookOpenCheck className="logo-icon" />
          Reportify
        </a>
        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <button
                className="button button-secondary"
                
                onClick={() => navigate(getDashboardRoute())}
              >
                Dashboard
              </button >
              <button className="button button-secondary" onClick={handleLogout}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <button className="button button-ghost" onClick={() => navigate('/login')}>
                Log In
              </button>
              <button className="button button-primary" onClick={() => navigate('/register')}>
                Sign Up Free
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;