import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, faTrash, faEllipsisV, faEnvelope, 
  faPhone, faCalendarDay, faCalendarTimes 
} from '@fortawesome/free-solid-svg-icons';

const MemberListItem = ({ member, onDelete, onEdit }) => {
  const handleDelete = () => {
    if (confirm('Are you sure?')) {
      onDelete(member.id);
    }
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case 'Active':
        return 'badge-success';
      case 'Near Expiry':
        return 'badge-warning';
      default:
        return 'badge-error';
    }
  };

  return (
    <div className="card-hover card bg-base-100 w-full mb-2">
      <div className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          {/* Member name and status */}
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-semibold">{member.name}</h3>
            <span className={`badge ${getBadgeClass(member.status)} text-xs mt-1`}>
              {member.status}
            </span>
          </div>
          
          {/* Contact info */}
          <div className="flex-1 flex flex-col text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faEnvelope} className="w-4 text-gray-500" />
              <span className="truncate">{member.email}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <FontAwesomeIcon icon={faPhone} className="w-4 text-gray-500" />
              <span>{member.phone}</span>
            </div>
          </div>
          
          {/* Dates */}
          <div className="flex-1 flex flex-col text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendarDay} className="w-4 text-gray-500" />
              <span>Joined: {member.join_date}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <FontAwesomeIcon icon={faCalendarTimes} className="w-4 text-gray-500" />
              <span>Expires: {member.end_date}</span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <button 
              className="btn btn-sm btn-ghost" 
              onClick={onEdit}
            >
              <FontAwesomeIcon icon={faEdit} className="text-info" />
            </button>
            <button 
              className="btn btn-sm btn-ghost" 
              onClick={handleDelete}
            >
              <FontAwesomeIcon icon={faTrash} className="text-error" />
            </button>
            <div className="dropdown dropdown-end dropdown-hover sm:hidden">
              <div tabIndex={0} role="button" className="btn btn-sm btn-ghost">
                <FontAwesomeIcon icon={faEllipsisV} />
              </div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                <li>
                  <a onClick={onEdit}>
                    <FontAwesomeIcon icon={faEdit} className="text-info" /> Edit
                  </a>
                </li>
                <li>
                  <a onClick={handleDelete}>
                    <FontAwesomeIcon icon={faTrash} className="text-error" /> Delete
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberListItem;