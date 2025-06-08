// import React from 'react';
import { HiExclamationCircle, HiRefresh } from 'react-icons/hi';

const ErrorMessage = ({ 
  message = 'Something went wrong', 
  onRetry = null,
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className="text-error mb-4">
        <HiExclamationCircle className="w-16 h-16" />
      </div>
      <h3 className="text-lg font-semibold text-error mb-2">Error</h3>
      <p className="text-base-content/70 text-center mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary btn-sm">
          <HiRefresh className="w-4 h-4 mr-2" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;