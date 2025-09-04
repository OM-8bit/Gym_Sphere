// frontend/src/contexts/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

// Define available themes
const themes = {
  light: {
    name: 'light',
    icon: 'sun',
    label: 'Light Mode'
  },
  dark: {
    name: 'dark',
    icon: 'moon',
    label: 'Dark Mode'
  },
  gym: {
    name: 'gym',
    icon: 'dumbbell',
    label: 'Gym Theme'
  }
};

// Create the context
const ThemeContext = createContext();

// Custom hook for accessing the theme context
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Get theme from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Toggle through available themes
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    // Initialize theme on mount
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;