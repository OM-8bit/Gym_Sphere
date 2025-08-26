import React from 'react'
import { NavLink } from 'react-router-dom'
import { Dumbbell, Home, Users, UserPlus, QrCode, ScanLine, FileText, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import logoImage from '../assets/logo_image_dashboard.png'

const linkBase = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '14px 16px',
  borderRadius: 10,
  textDecoration: 'none',
  fontSize: '15px',
  fontWeight: 500,
  transition: 'all 0.3s ease',
  position: 'relative'
}

export default function Layout({ children }) {
  const { logout } = useAuth()
  const nav = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/members', label: 'Customers', icon: Users },
    { to: '/add-member', label: 'Add Member', icon: UserPlus },
    { to: '/qr-generator', label: 'QR Generator', icon: QrCode },
    { to: '/scanner', label: 'Scanner', icon: ScanLine },
    { to: '/access-logs', label: 'Access Logs', icon: FileText },
    { to: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#1a1a1a' }}>
      <aside style={{ 
        width: 280, 
        background: '#2d2d2d', 
        borderRight: '1px solid #404040',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Logo/Brand Section */}
        <div style={{ 
          display:'flex', 
          alignItems:'center', 
          justifyContent:'center',
          // padding: '12px 8px',
          borderBottom: '1px solid #404040',
          minHeight: '60px'
        }}>
          <img 
            src={logoImage} 
            alt="GymSphere Logo" 
            style={{
              // height: '40px',
              width: 'auto',
              maxWidth: '200px',
              objectFit: 'contain',
              filter: 'invert(1) brightness(1.2) contrast(1.1)',
              backgroundColor: 'transparent'
            }}
          />
        </div>

        {/* Navigation */}
        <nav style={{ 
          display:'flex', 
          flexDirection:'column', 
          padding: '20px 16px', 
          gap: 8,
          flex: 1
        }}>
          {nav.map(item => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  ...linkBase,
                  color: isActive ? '#ffffff' : '#a0a0a0',
                  background: isActive ? '#ff6b35' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  transform: isActive ? 'translateX(4px)' : 'translateX(0)',
                  boxShadow: isActive ? '0 4px 12px rgba(255, 107, 53, 0.3)' : 'none'
                })}
                onMouseEnter={(e) => {
                  if (!e.target.closest('a').classList.contains('active')) {
                    e.target.closest('a').style.background = '#3a3a3a'
                    e.target.closest('a').style.color = '#ffffff'
                    e.target.closest('a').style.transform = 'translateX(2px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.target.closest('a').classList.contains('active')) {
                    e.target.closest('a').style.background = 'transparent'
                    e.target.closest('a').style.color = '#a0a0a0'
                    e.target.closest('a').style.transform = 'translateX(0)'
                  }
                }}
              >
                <Icon size={20} /> {item.label}
              </NavLink>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div style={{ padding: '16px', borderTop: '1px solid #404040' }}>
          <button 
            className="btn btn-secondary" 
            onClick={logout} 
            style={{ 
              width: '100%',
              background: '#3a3a3a',
              border: '1px solid #555',
              color: '#a0a0a0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '12px 20px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#ff6b35'
              e.target.style.color = '#ffffff'
              e.target.style.borderColor = '#ff6b35'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#3a3a3a'
              e.target.style.color = '#a0a0a0'
              e.target.style.borderColor = '#555'
            }}
          >
            <LogOut size={16}/> Log out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ 
        flex: 1, 
        background: '#1a1a1a',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <header style={{ 
          background: '#2d2d2d', 
          borderBottom: '1px solid #404040', 
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px' 
          }}>
            <div style={{
              background: '#3a3a3a',
              padding: '8px 16px',
              borderRadius: '25px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid #555'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#4ade80'
              }}></div>
              <input 
                type="text"
                placeholder="Search"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: '14px',
                  width: '200px'
                }}
              />
            </div>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px' 
          }}>
            <div style={{
              background: '#ff6b35',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <span style={{ fontSize: '12px', color: '#fff' }}>🔔</span>
              <div style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '8px',
                height: '8px',
                background: '#ef4444',
                borderRadius: '50%',
                border: '2px solid #2d2d2d'
              }}></div>
            </div>
            <div style={{
              background: '#3a3a3a',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '12px', color: '#fff' }}>👤</span>
            </div>
            <div style={{ color: '#ffffff', fontSize: '15px', fontWeight: 500 }}>
              Admin
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div style={{ 
          flex: 1, 
          padding: '32px', 
          overflow: 'auto',
          background: '#1a1a1a'
        }}>
          {children}
        </div>
      </main>
    </div>
  )
}
