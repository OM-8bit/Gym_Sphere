// frontend/src/components/Header.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faPlus } from '@fortawesome/free-solid-svg-icons';

const Header = ({ theme, toggleTheme, openAddModal }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4 sm:mb-6">
      <h1 className="text-xl sm:text-2xl font-bold">Gym Membership Manager</h1>
      <div className="flex items-center gap-3 sm:gap-4">
        <button className="btn btn-ghost btn-circle" onClick={toggleTheme}>
          <FontAwesomeIcon 
            icon={theme === 'dark' ? faMoon : faSun} 
            className="text-lg" 
          />
        </button>
        <button className="btn btn-primary btn-sm sm:btn-md" onClick={openAddModal}>
          <FontAwesomeIcon icon={faPlus} className="mr-2" /> 
          <span className="hidden xs:inline">Add Member</span>
          <span className="xs:hidden">Add</span>
        </button>
      </div>
    </div>
  );
};

export default Header;