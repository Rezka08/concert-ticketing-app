// import React from 'react';
import { HiX } from 'react-icons/hi';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true 
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  return (
    <div className="modal modal-open">
      <div className={`modal-box ${sizeClasses[size]} relative`}>
        {showCloseButton && (
          <button 
            onClick={onClose}
            className="btn btn-sm btn-circle absolute right-2 top-2"
          >
            <HiX className="w-4 h-4" />
          </button>
        )}
        
        {title && (
          <h3 className="font-bold text-lg mb-4">{title}</h3>
        )}
        
        <div className="py-4">
          {children}
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default Modal;