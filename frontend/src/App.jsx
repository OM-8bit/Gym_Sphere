// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import EditMember from './pages/EditMember';
import Sidebar from './components/Sidebar';

function App() {
  // Get sidebar state from localStorage or default to open on desktop and closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem('sidebarOpen');
    // If there's a saved state, use it; otherwise, base it on screen width
    if (savedState !== null) {
      return savedState === 'true';
    }
    return window.innerWidth >= 1024; // Default to open on desktop (lg breakpoint)
  });
  
  // Update useEffect for theme handling
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Add event listener for window resize to manage sidebar state
  useEffect(() => {
    const handleResize = () => {
      // Auto-close sidebar on small screens
      if (window.innerWidth < 768 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    // Save state to localStorage
    localStorage.setItem('sidebarOpen', newState.toString());
  };
  
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-base-200">
            <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/edit/:id" element={<EditMember />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;