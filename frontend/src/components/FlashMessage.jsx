// frontend/src/components/FlashMessage.jsx
import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, faExclamationTriangle, faTimesCircle, faInfoCircle 
} from '@fortawesome/free-solid-svg-icons';

const FlashMessage = ({ message, onClose }) => {
  useEffect(() => {
    // Reduced time to 3 seconds
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
    <div className={`alert ${getAlertClass()} py-2 px-3 sm:py-3 sm:px-4 shadow-md flex items-center text-sm relative mb-4`}>
      <FontAwesomeIcon icon={getIcon()} className="mr-2 flex-shrink-0" />
      <span className="pr-6">{message.message}</span>
      <button 
        className="btn btn-ghost btn-xs absolute right-1 top-1/2 transform -translate-y-1/2" 
        onClick={() => onClose()}
      >
        ✕
      </button>
    </div>
  );
};

export default FlashMessage;