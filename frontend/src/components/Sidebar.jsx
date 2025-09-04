import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, faBars
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'bg-primary text-white' : '';
  };

  return (
    <>
      {/* Mobile sidebar toggle button */}
      <div className="lg:hidden fixed bottom-4 left-4 z-30">
        <button 
          onClick={toggleSidebar} 
          className="btn btn-primary btn-circle shadow-lg"
        >
          <FontAwesomeIcon icon={isOpen ? faHome : faBars} />
        </button>
      </div>
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" 
          onClick={toggleSidebar}
        ></div>
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-base-200 shadow-xl
        transition-all duration-300 ease-in-out z-30
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-64 lg:sticky lg:z-10
      `}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="px-4 py-6 border-b border-base-300">
            <h1 className="text-xl font-bold flex items-center">
              <span className="text-primary">Gym</span>Sphere
            </h1>
          </div>
          
          {/* Navigation Items */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            <Link
              to="/"
              className={`flex items-center px-4 py-3 text-sm rounded-lg hover:bg-base-300 ${isActive('/')}`}
              title="Dashboard"
            >
              <FontAwesomeIcon icon={faHome} className="w-5 h-5 mr-3" />
              <span>Dashboard</span>
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;