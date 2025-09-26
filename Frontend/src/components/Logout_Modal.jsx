import React from 'react';
import './Logout_Modal.css'; // We'll create this CSS file

const Logout_Modal = ({ isOpen, onClose, onConfirm, title, children }) => {
  // Don't render the modal if it's not open
  if (!isOpen) {
    return null;
  }

  return (
    // The semi-transparent backdrop
    <div className="modal-backdrop" onClick={onClose}>
      {/* The modal content itself, stopPropagation prevents closing when clicking inside */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="button button-secondary">Cancel</button>
          <button onClick={onConfirm} className="button button-danger">Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default Logout_Modal;