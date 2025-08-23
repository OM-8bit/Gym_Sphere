import React from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Settings() {
  const { user } = useAuth()
  return (
    <div className="card">
      <h2 style={{marginBottom:12}}>Settings</h2>
      <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(user, null, 2)}</pre>
    </div>
  )
}
