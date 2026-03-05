import React from 'react'
import { Navigate } from 'react-router-dom'

export default function GuestRoute({ children }) {
  const token = localStorage.getItem('gym_token')
  
  // If user is logged in (has token), redirect to dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />
  }
  
  // If not logged in, show the auth page (login/signup)
  return children
}
