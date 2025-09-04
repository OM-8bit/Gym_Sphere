import { createContext, useContext, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, faExclamationTriangle, 
  faTimesCircle, faInfoCircle, faTimes 
} from '@fortawesome/free-solid-svg-icons';

// Create a context for global toast management
export const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (type, message, duration = 3000) => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, type, message }]);
    
    if (duration !== null) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2 max-h-screen overflow-hidden w-80">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

const Toast = ({ toast, onClose }) => {
  const { type, message } = toast;
  
  const getToastClass = () => {
    switch (type) {
      case 'success':
        return 'bg-success text-success-content';
      case 'error':
        return 'bg-error text-error-content';
      case 'warning':
        return 'bg-warning text-warning-content';
      default:
        return 'bg-info text-info-content';
    }
  };
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return faCheckCircle;
      case 'error':
        return faTimesCircle;
      case 'warning':
        return faExclamationTriangle;
      default:
        return faInfoCircle;
    }
  };

  return (
    <div 
      className={`${getToastClass()} shadow-lg rounded-lg p-3 flex items-start w-full animate-slide-up`}
      style={{ animation: 'slideIn 0.3s ease-out' }}
    >
      <FontAwesomeIcon icon={getIcon()} className="mt-1 mr-3 flex-shrink-0" />
      <div className="flex-1 mr-2">
        <p className="font-medium">{message}</p>
      </div>
      <button 
        onClick={onClose}
        className="p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
  );
};

export default ToastContainer;