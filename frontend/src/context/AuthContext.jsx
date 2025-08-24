import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('gym_user')
    return raw ? JSON.parse(raw) : null
  })

  const login = (payload) => {
    // payload from /api/auth/login should be: { access_token, user: {...} }
    localStorage.setItem('gym_user', JSON.stringify(payload.user))
    localStorage.setItem('gym_token', payload.access_token)
    setUser(payload.user)
  }

  const logout = () => {
    localStorage.removeItem('gym_user')
    localStorage.removeItem('gym_token')
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
