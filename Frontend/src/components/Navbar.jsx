import React from 'react';
import { BookOpenCheck } from 'lucide-react';

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
    // console.log(user);
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <a href="/" className="flex items-center gap-2 text-2xl font-bold text-indigo-900 group">
          <BookOpenCheck className="w-8 h-8 text-indigo-600 group-hover:scale-110 transition-transform duration-300" />
          <span>Reportify</span>
        </a>
        <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600">
          <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
          <a href="#contact" className="hover:text-indigo-600 transition-colors">Contact</a>
        </nav>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <button
                className="px-5 py-2.5 rounded-lg font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                onClick={() => navigate(getDashboardRoute())}
              >
                Dashboard
              </button>
              <button className="px-5 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors" onClick={handleLogout}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <button className="hidden sm:block px-5 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors" onClick={() => navigate('/login')}>
                Log In
              </button>
              <button className="px-6 py-2.5 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" onClick={() => navigate('/register')}>
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