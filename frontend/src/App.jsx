import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AuthProvider from './context/AuthContext.jsx'
import './styles/responsive.css'
import './styles/laptop.css'

import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Members from './pages/Members.jsx'
import AddMember from './pages/AddMember.jsx'
import AccessControl from './pages/AccessControl.jsx'
import AccessLogs from './pages/AccessLogs.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true
        }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<ProtectedRoute><Layout><Dashboard/></Layout></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard/></Layout></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute><Layout><Members/></Layout></ProtectedRoute>} />
          <Route path="/add-member" element={<ProtectedRoute><Layout><AddMember/></Layout></ProtectedRoute>} />
          <Route path="/access-control" element={<ProtectedRoute><Layout><AccessControl/></Layout></ProtectedRoute>} />
          <Route path="/access-logs" element={<ProtectedRoute><Layout><AccessLogs/></Layout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Layout><Settings/></Layout></ProtectedRoute>} />
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
