// frontend/src/components/SearchFilter.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';

const SearchFilter = ({ searchTerm, onSearchChange, onFilterSelect }) => {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="flex-1 relative">
        <div className="input-group">
          <span className="absolute left-3 top-3.5 text-gray-400">
            <FontAwesomeIcon icon={faSearch} />
          </span>
          <input
            type="text"
            placeholder="Search members..."
            className="input input-bordered w-full pl-10 pr-4"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div className="dropdown">
        <div tabIndex={0} role="button" className="btn btn-ghost">
          <FontAwesomeIcon icon={faFilter} className="mr-2" /> Filter
        </div>
        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
          <li><a onClick={() => onFilterSelect('Active')}>Active Members</a></li>
          <li><a onClick={() => onFilterSelect('Near Expiry')}>Near Expiry</a></li>
          <li><a onClick={() => onFilterSelect('Expired')}>Expired</a></li>
          <li><a onClick={() => onFilterSelect('All')}>All Members</a></li>
        </ul>
      </div>
    </div>
  );
};

export default SearchFilter;