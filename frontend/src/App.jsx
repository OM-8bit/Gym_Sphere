import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AuthProvider from './context/AuthContext.jsx';

import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Members from './pages/Members.jsx';
import AddMember from './pages/AddMember.jsx';
import EditMember from './pages/EditMember.jsx';
import QRGenerator from './pages/QRGenerator.jsx';
import Scanner from './pages/Scanner.jsx';
import AccessLogs from './pages/AccessLogs.jsx';
import Settings from './pages/Settings.jsx';

import Sidebar from './components/Sidebar.jsx';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    if (saved !== null) return saved === 'true';
    return window.innerWidth >= 1024;
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem('sidebarOpen', newState.toString());
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex h-screen overflow-hidden">
          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
            <main className="flex-1 overflow-y-auto overflow-x-hidden bg-base-200">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                <Route path="/members" element={<ProtectedRoute><Layout><Members /></Layout></ProtectedRoute>} />
                <Route path="/add-member" element={<ProtectedRoute><Layout><AddMember /></Layout></ProtectedRoute>} />
                <Route path="/edit/:id" element={<ProtectedRoute><Layout><EditMember /></Layout></ProtectedRoute>} />
                <Route path="/qr-generator" element={<ProtectedRoute><Layout><QRGenerator /></Layout></ProtectedRoute>} />
                <Route path="/scanner" element={<ProtectedRoute><Layout><Scanner /></Layout></ProtectedRoute>} />
                <Route path="/access-logs" element={<ProtectedRoute><Layout><AccessLogs /></Layout></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
                <Route path="*" element={<Navigate replace to="/" />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}