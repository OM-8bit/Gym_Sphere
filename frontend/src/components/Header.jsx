// frontend/src/components/Header.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faPlus } from '@fortawesome/free-solid-svg-icons';

const Header = ({ theme, toggleTheme, openAddModal }) => {
  return (
    <div className="bg-base-100 rounded-xl shadow-md p-4 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="navbar-start">
          <div className="flex items-center">
            <div className="avatar placeholder mr-3">
            </div>
            <div>
              <h1 className="text-xl font-bold">Gym Membership Manager</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            className="btn btn-ghost btn-circle bg-base-200 hover:bg-base-300" 
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <FontAwesomeIcon 
              icon={theme === 'dark' ? faMoon : faSun} 
              className={`text-lg ${theme === 'dark' ? 'text-yellow-400' : 'text-orange-400'}`} 
            />
          </button>
          <button 
            className="btn btn-primary btn-md hover:shadow-lg group transition-all duration-300"
            onClick={openAddModal}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2 group-hover:rotate-90 transition-transform duration-300" /> 
            <span>Add Member</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;