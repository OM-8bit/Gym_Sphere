// frontend/src/components/Header.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faPlus } from '@fortawesome/free-solid-svg-icons';

const Header = ({ theme, toggleTheme, openAddModal }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Gym Membership Manager</h1>
      <div className="flex items-center gap-4">
        <button className="btn btn-ghost btn-circle" onClick={toggleTheme}>
          <FontAwesomeIcon 
            icon={theme === 'dark' ? faMoon : faSun} 
            className="text-lg" 
          />
        </button>
        <button className="btn btn-primary" onClick={openAddModal}>
          <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Member
        </button>
      </div>
    </div>
  );
};

export default Header;