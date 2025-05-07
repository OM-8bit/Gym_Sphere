// frontend/src/components/SearchFilter.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import ViewToggle from './ViewToggle';

const SearchFilter = ({ searchTerm, onSearchChange, onFilterSelect, viewMode, onViewChange }) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5 sm:mb-8">
      <div className="flex-1 relative">
        <div className="input-group w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <FontAwesomeIcon icon={faSearch} />
          </span>
          <input
            type="text"
            placeholder="Search members..."
            className="input input-bordered w-full h-10 pl-10 pr-4 text-sm"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <ViewToggle currentView={viewMode} onViewChange={onViewChange} />
        
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-sm sm:btn-md btn-ghost">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faFilter} className="mr-2" /> 
              <span className="hidden xs:inline">Filter</span>
            </div>
          </div>
          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li><a onClick={() => onFilterSelect('Active')}>Active Members</a></li>
            <li><a onClick={() => onFilterSelect('Near Expiry')}>Near Expiry</a></li>
            <li><a onClick={() => onFilterSelect('Expired')}>Expired Members</a></li>
            <li><a onClick={() => onFilterSelect('All')}>All Members</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;