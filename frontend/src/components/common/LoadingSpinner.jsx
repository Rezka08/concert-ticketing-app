// import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <span className={`loading loading-spinner loading-primary ${sizeClasses[size]}`}></span>
      {text && <p className="mt-4 text-base-content/70">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;