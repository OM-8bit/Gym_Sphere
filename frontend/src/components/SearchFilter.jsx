// frontend/src/components/SearchFilter.jsx
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faFilter, faTimesCircle, faList, 
  faThLarge, faChevronDown
} from '@fortawesome/free-solid-svg-icons';

const ViewToggle = ({ currentView, onViewChange }) => {
  return (
    <div className="btn-group">
      <button 
        className={`btn btn-sm ${currentView === 'grid' ? 'btn-active' : ''}`} 
        onClick={() => onViewChange('grid')}
      >
        <FontAwesomeIcon icon={faThLarge} className="mr-1" />
        <span className="hidden xs:inline">Grid</span>
      </button>
      <button 
        className={`btn btn-sm ${currentView === 'list' ? 'btn-active' : ''}`} 
        onClick={() => onViewChange('list')}
      >
        <FontAwesomeIcon icon={faList} className="mr-1" />
        <span className="hidden xs:inline">List</span>
      </button>
    </div>
  );
};

const SearchFilter = ({ 
  searchTerm, 
  onSearchChange, 
  onFilterSelect, 
  activeFilters = [], 
  viewMode, 
  onViewChange,
  onClearFilters 
}) => {
  return (
    <div className="bg-base-100 rounded-lg shadow-md p-3 mb-5">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 relative">
          <div className="input-group w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
              type="text"
              placeholder="Search members by name, email, or phone..."
              className="input input-bordered w-full h-10 pl-10 pr-4 text-sm"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => onSearchChange('')}
              >
                <FontAwesomeIcon icon={faTimesCircle} />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ViewToggle currentView={viewMode} onViewChange={onViewChange} />
          
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-sm sm:btn-md">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faFilter} className="mr-2" /> 
                <span className="hidden xs:inline">Filter</span>
                {activeFilters.length > 0 && (
                  <span className="badge badge-sm badge-primary ml-1">{activeFilters.length}</span>
                )}
                <FontAwesomeIcon icon={faChevronDown} className="ml-2 opacity-70 text-xs" />
              </div>
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-60">
              <li><a onClick={() => onFilterSelect('All')}>All Members</a></li>
              <li><a onClick={() => onFilterSelect('Active')}>Active Members</a></li>
              <li><a onClick={() => onFilterSelect('Near Expiry')}>Near Expiry</a></li>
              <li><a onClick={() => onFilterSelect('Expired')}>Expired Members</a></li>
              
              {activeFilters.length > 0 && (
                <li>
                  <a onClick={onClearFilters}>
                    <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
                    Clear All Filters
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Active Filter Tags */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {activeFilters.map((filter, index) => (
            <div key={index} className="badge badge-outline gap-1 p-3">
              {filter}
              <button onClick={() => onFilterSelect(filter)}>
                <FontAwesomeIcon icon={faTimesCircle} className="ml-1" />
              </button>
            </div>
          ))}
          
          {activeFilters.length > 1 && (
            <button 
              onClick={onClearFilters}
              className="badge badge-error gap-1 p-3"
            >
              Clear All Filters
              <FontAwesomeIcon icon={faTimesCircle} className="ml-1" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;