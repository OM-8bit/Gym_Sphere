import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AuthProvider from './context/AuthContext.jsx'

import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Members from './pages/Members.jsx'
import AddMember from './pages/AddMember.jsx'
import QRGenerator from './pages/QRGenerator.jsx'
import Scanner from './pages/Scanner.jsx'
import AccessLogs from './pages/AccessLogs.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout><Dashboard/></Layout></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute><Layout><Members/></Layout></ProtectedRoute>} />
          <Route path="/add-member" element={<ProtectedRoute><Layout><AddMember/></Layout></ProtectedRoute>} />
          <Route path="/qr-generator" element={<ProtectedRoute><Layout><QRGenerator/></Layout></ProtectedRoute>} />
          <Route path="/scanner" element={<ProtectedRoute><Layout><Scanner/></Layout></ProtectedRoute>} />
          <Route path="/access-logs" element={<ProtectedRoute><Layout><AccessLogs/></Layout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Layout><Settings/></Layout></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
