// frontend/src/components/MemberCard.jsx
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEllipsisV, faEnvelope, faPhone, faCalendarDay, 
  faCalendarTimes, faEdit, faTrash 
} from '@fortawesome/free-solid-svg-icons';

const MemberCard = ({ member, onDelete, onEdit }) => {
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
    <div className="card-hover card bg-base-100 relative">
      <div className="card-body p-4">
        <div className="flex justify-between items-start mb-2">
          <h2 className="card-title text-lg">{member.name}</h2>
          <div className="dropdown dropdown-end dropdown-hover">
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
        <div className="space-y-1.5 text-sm">
          <p className="flex items-center gap-2">
            <FontAwesomeIcon icon={faEnvelope} className="w-4" />
            <span className="truncate">{member.email}</span>
          </p>
          <p className="flex items-center gap-2">
            <FontAwesomeIcon icon={faPhone} className="w-4" />
            {member.phone}
          </p>
          <p className="flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendarDay} className="w-4" />
            Joined: {member.join_date}
          </p>
          <p className="flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendarTimes} className="w-4" />
            Expires: {member.end_date}
          </p>
        </div>
        <div className="mt-3 flex justify-end">
          <span className={`badge ${getBadgeClass(member.status)}`}>
            {member.status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MemberCard;