import React from 'react';
import './Loading.css';

/**
 * Loading spinner component
 */
export const Loading = ({ message = 'Loading...' }) => (
  <div className="loading-container">
    <div className="spinner"></div>
    <p>{message}</p>
  </div>
);

/**
 * Alert component for error/success messages
 */
export const Alert = ({ type = 'info', message, onClose }) => (
  <div className={`alert alert-${type}`}>
    <span>{message}</span>
    <button onClick={onClose} className="alert-close">×</button>
  </div>
);

/**
 * Toast notification component
 */
export const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast toast-${type}`}>
      {message}
    </div>
  );
};
