import React from 'react';


const Logout_Modal = ({ isOpen, onClose, onConfirm, title, children }) => {
  // Don't render the modal if it's not open
  if (!isOpen) {
    return null;
  }

  return (
    // The semi-transparent backdrop
    <div className="fixed inset-0 w-full min-h-screen bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-1000" onClick={onClose}>
      {/* The modal content itself, stopPropagation prevents closing when clicking inside */}
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-5">
          <h2 className="m-0 text-xl font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="bg-transparent border-none text-3xl font-light cursor-pointer text-slate-400 hover:text-slate-600 transition-colors">&times;</button>
        </div>
        <div className="mb-8 text-slate-600 leading-relaxed text-[1.05rem]">
          {children}
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg font-medium cursor-pointer transition-colors bg-slate-100 text-slate-700 hover:bg-slate-200">Cancel</button>
          <button onClick={onConfirm} className="px-5 py-2.5 rounded-lg font-medium cursor-pointer transition-colors bg-rose-600 text-white hover:bg-rose-700">Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default Logout_Modal;