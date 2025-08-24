import React from 'react'
import { NavLink } from 'react-router-dom'
import { Dumbbell, Home, Users, UserPlus, QrCode, ScanLine, FileText, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const linkBase = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 12px',
  borderRadius: 8,
  textDecoration: 'none'
}

export default function Layout({ children }) {
  const { logout } = useAuth()
  const nav = [
    { to: '/', label: 'Dashboard', icon: Home },
    { to: '/members', label: 'Members', icon: Users },
    { to: '/add-member', label: 'Add Member', icon: UserPlus },
    { to: '/qr-generator', label: 'QR Generator', icon: QrCode },
    { to: '/scanner', label: 'Scanner', icon: ScanLine },
    { to: '/access-logs', label: 'Access Logs', icon: FileText },
    { to: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 240, borderRight: '1px solid #e5e7eb', background: '#fff' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:14 }}>
          <Dumbbell size={26} color="#2563eb" /><b>GymSphere</b>
        </div>
        <nav style={{ display:'flex', flexDirection:'column', padding: 8, gap: 4 }}>
          {nav.map(item => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  ...linkBase,
                  color: isActive ? '#1d4ed8' : '#374151',
                  background: isActive ? '#e0e7ff' : 'transparent',
                  fontWeight: isActive ? 700 : 500
                })}
              >
                <Icon size={18} /> {item.label}
              </NavLink>
            )
          })}
        </nav>
        <div style={{ padding: 8, position:'absolute', bottom:10 }}>
          <button className="btn btn-secondary" onClick={logout} style={{ width: 220 }}>
            <LogOut size={16}/> Logout
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, background: '#f6f7fb' }}>
        <header style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'10px 16px' }}>
          <b>Gym Management</b>
        </header>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:20 }}>
          {children}
        </div>
      </main>
    </div>
  )
}
