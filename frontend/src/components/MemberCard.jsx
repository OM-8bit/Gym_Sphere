// frontend/src/components/MemberCard.jsx
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEllipsisV, faEnvelope, faPhone, faCalendarDay, 
  faCalendarTimes, faEdit, faTrash
} from '@fortawesome/free-solid-svg-icons';
import ConfirmationModal from './ConfirmationModal';

const MemberCard = ({ member, onDelete, onEdit }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = () => {
    setShowDeleteModal(true);
  };
  
  const confirmDelete = () => {
    onDelete(member.id);
    setShowDeleteModal(false);
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Active':
        return {
          badge: 'bg-success text-white',
          border: 'border-success',
          shadowHover: 'hover:shadow-success/20',
          icon: 'text-success'
        };
      case 'Near Expiry':
        return {
          badge: 'bg-warning text-white',
          border: 'border-warning',
          shadowHover: 'hover:shadow-warning/20',
          icon: 'text-warning'
        };
      default: // Expired
        return {
          badge: 'bg-error text-white',
          border: 'border-error',
          shadowHover: 'hover:shadow-error/20',
          icon: 'text-error'
        };
    }
  };

  const statusStyles = getStatusStyles(member.status);

  // Generate initials for the avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <div className={`card transform transition-transform duration-300 hover:scale-105 bg-base-100 shadow-md ${statusStyles.shadowHover} hover:shadow-xl ${statusStyles.border}`}>
        <div className="card-body p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-full bg-base-200 flex items-center justify-center text-lg font-bold mr-3 ${statusStyles.icon}`}>
                {getInitials(member.name)}
              </div>
              <div>
                <h3 className="font-bold text-lg">{member.name}</h3>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs ${statusStyles.badge}`}>
                  {member.status}
                </span>
              </div>
            </div>
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-sm btn-ghost btn-circle">
                <FontAwesomeIcon icon={faEllipsisV} />
              </div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52">
                <li>
                  <a onClick={onEdit} className="flex items-center gap-2 text-info hover:bg-info hover:bg-opacity-10">
                    <FontAwesomeIcon icon={faEdit} />
                    Edit
                  </a>
                </li>
                <li>
                  <a onClick={handleDelete} className="flex items-center gap-2 text-error hover:bg-error hover:bg-opacity-10">
                    <FontAwesomeIcon icon={faTrash} />
                    Delete
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <FontAwesomeIcon icon={faEnvelope} className={`w-4 ${statusStyles.icon}`} />
              <span className="truncate">{member.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <FontAwesomeIcon icon={faPhone} className={`w-4 ${statusStyles.icon}`} />
              <span>{member.phone}</span>
            </div>          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-base-200 rounded-lg p-3">
              <div className="text-xs opacity-70">Joined</div>
              <div className="flex items-center gap-2 mt-1">
                <FontAwesomeIcon icon={faCalendarDay} className="text-success w-3" />
                <span className="font-medium text-sm">{member.join_date}</span>
              </div>
            </div>
            <div className="bg-base-200 rounded-lg p-3">
              <div className="text-xs opacity-70">Expires</div>
              <div className="flex items-center gap-2 mt-1">
                <FontAwesomeIcon icon={faCalendarTimes} className="text-error w-3" />
                <span className="font-medium text-sm">{member.end_date}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Member"
        message={`Are you sure you want to delete ${member.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
};

export default MemberCard;