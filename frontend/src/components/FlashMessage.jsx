// frontend/src/components/FlashMessage.jsx
import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, faExclamationTriangle, faTimesCircle, faInfoCircle 
} from '@fortawesome/free-solid-svg-icons';

const FlashMessage = ({ message, onClose }) => {
  useEffect(() => {
    // Reduced time to 3 seconds (from 5)
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onClose]);

  const getAlertClass = () => {
    switch (message.category) {
      case 'success':
        return 'alert-success text-green-800 bg-green-100';
      case 'error':
        return 'alert-error text-red-800 bg-red-100';
      case 'warning':
        return 'alert-warning text-yellow-800 bg-yellow-100';
      default:
        return 'alert-info text-blue-800 bg-blue-100';
    }
  };
  
  const getIcon = () => {
    switch (message.category) {
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
    <div className={`alert ${getAlertClass()} mb-4 shadow-md flex items-center`}>
      <FontAwesomeIcon icon={getIcon()} className="mr-2" />
      <span>{message.message}</span>
      <button 
        className="btn btn-ghost btn-xs absolute right-2" 
        onClick={() => onClose()}
      >
        ✕
      </button>
    </div>
  );
};

export default FlashMessage;