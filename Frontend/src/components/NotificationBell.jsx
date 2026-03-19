import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { NotificationContext } from '../Context/notification.context';

const NotificationBell = ({ to, onClick }) => {
  const { unreadCount } = useContext(NotificationContext);

  return (
    <NavLink 
      to={to} 
      onClick={onClick}
      className={({ isActive }) => 
        `flex items-center gap-4 px-4 py-3 rounded-lg mx-3 font-medium transition-colors duration-200 ${
          isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`
      }
    >
      <div className="relative inline-flex">
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-4 h-4 leading-none border-2 border-slate-900">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
      <span>Notifications</span>
    </NavLink>
  );
};

export default NotificationBell;
