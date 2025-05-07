import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThLarge, faList } from '@fortawesome/free-solid-svg-icons';

const ViewToggle = ({ currentView, onViewChange }) => {
  return (
    <div className="btn-group hidden sm:flex">
      <button 
        className={`btn btn-sm sm:btn-md ${currentView === 'grid' ? 'btn-active btn-primary' : ''}`}
        onClick={() => onViewChange('grid')}
      >
        <FontAwesomeIcon icon={faThLarge} className="mr-2" />
        <span className="hidden xs:inline">Grid</span>
      </button>
      <button 
        className={`btn btn-sm sm:btn-md ${currentView === 'list' ? 'btn-active btn-primary' : ''}`}
        onClick={() => onViewChange('list')}
      >
        <FontAwesomeIcon icon={faList} className="mr-2" />
        <span className="hidden xs:inline">List</span>
      </button>
    </div>
  );
};

export default ViewToggle;