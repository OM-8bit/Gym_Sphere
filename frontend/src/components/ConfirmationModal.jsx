import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const ConfirmationModal = ({ 
  isOpen, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  type = "warning", 
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;
  
  const getTypeClasses = () => {
    switch (type) {
      case 'danger':
        return {
          icon: faExclamationTriangle,
          buttonClass: 'btn-error',
          iconClass: 'text-error'
        };
      case 'warning':
        return {
          icon: faExclamationTriangle,
          buttonClass: 'btn-warning',
          iconClass: 'text-warning'
        };
      default:
        return {
          icon: faExclamationTriangle,
          buttonClass: 'btn-primary',
          iconClass: 'text-primary'
        };
    }
  };
  
  const { icon, buttonClass, iconClass } = getTypeClasses();
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onCancel}></div>
        
        <div className="relative transform overflow-hidden rounded-lg bg-base-100 text-left shadow-xl transition-all sm:my-8 sm:max-w-lg sm:w-full">
          <div className="p-4 sm:p-6">
            <div className="text-center sm:text-left">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-base-200 sm:mx-0">
                <FontAwesomeIcon icon={icon} className={`h-6 w-6 ${iconClass}`} />
              </div>
              <div className="mt-3 text-center sm:mt-5 sm:text-left">
                <h3 className="text-lg font-medium leading-6">{title}</h3>
                <div className="mt-2">
                  <p className="text-sm opacity-80">{message}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button
                type="button"
                className={`btn ${buttonClass} sm:col-start-2`}
                onClick={onConfirm}
              >
                {confirmText}
              </button>
              <button
                type="button"
                className="btn mt-3 sm:mt-0 sm:col-start-1"
                onClick={onCancel}
              >
                {cancelText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;