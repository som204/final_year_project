import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Building, Users, LogOut, Menu, X } from "lucide-react";
import NotificationBell from "./NotificationBell";

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-4 px-4 py-3 rounded-lg transition-colors duration-200 ${
    isActive
      ? "bg-indigo-600 text-white font-medium"
      : "text-slate-300 hover:bg-slate-800 hover:text-white"
  }`;

const Sidebar = ({ onLogoutClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col shrink-0 md:h-full relative z-40">
      <div className="p-4 md:p-6 border-b border-slate-800 flex justify-between items-center">
        <h2 className="text-xl md:text-2xl font-semibold m-0">Super Admin</h2>
        <button 
          className="md:hidden p-2 text-slate-300 hover:text-white focus:outline-none" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE DROPDOWN + DESKTOP NAV */}
      <div className={`${isOpen ? 'flex' : 'hidden'} md:flex flex-col absolute md:relative top-full md:top-auto left-0 md:left-auto w-full md:w-auto bg-slate-900 md:grow md:h-auto h-[calc(100vh-73px)] border-b border-slate-800 md:border-0`}>
        <nav className="flex flex-col gap-2 p-4 grow overflow-y-auto">
          <NavLink to="/admin/dashboard" className={navLinkClass} onClick={() => setIsOpen(false)}>
            <LayoutDashboard size={20} className="shrink-0" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/register-institute" className={navLinkClass} onClick={() => setIsOpen(false)}>
            <Building size={20} className="shrink-0" />
            <span>Institute</span>
          </NavLink>
          <NavLink to="/admin/departments" className={navLinkClass} onClick={() => setIsOpen(false)}>
            <Building size={20} className="shrink-0" />
            <span>Departments</span>
          </NavLink>
          <NavLink to="/admin/users" className={navLinkClass} onClick={() => setIsOpen(false)}>
            <Users size={20} className="shrink-0" />
            <span>Users</span>
          </NavLink>
          <div className="mt-auto md:mt-0 pt-4 md:pt-0">
             <NotificationBell to="/admin/notifications" onClick={() => setIsOpen(false)} />
          </div>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button 
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-slate-300 hover:bg-rose-600 hover:text-white transition-colors duration-200 text-left" 
            onClick={() => {
              setIsOpen(false);
              onLogoutClick();
            }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
