import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { Dumbbell, Home, Users, UserPlus, QrCode, ScanLine, FileText, Settings, LogOut, Menu, X, Search, Bell, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import logoImage from '../assets/logo_image_dashboard.png'
import '../styles/responsive.css'

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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024); // Changed from <= 1024 to < 1024
    }
    
    // Initial check
    checkScreenSize()
    
    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize)
    
    // Cleanup event listener
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }
  
  const toggleSidebarExpand = () => {
    setSidebarExpanded(!sidebarExpanded)
  }
  
  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }
  
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
    <div className="app-container">
      {/* Overlay for mobile */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} 
        onClick={closeSidebar}
      ></div>
      
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'active' : ''} ${sidebarExpanded ? 'expanded' : ''}`}>
        {/* Logo/Brand Section */}
        <div className="sidebar-top">
          <div className="sidebar-logo" style={{ 
            display:'flex', 
            alignItems:'center', 
            justifyContent:'center',
            borderBottom: '1px solid #404040',
            minHeight: '60px'
          }}>
            <img 
              src={logoImage} 
              alt="GymSphere Logo" 
              style={{
                width: 'auto',
                maxWidth: '200px',
                objectFit: 'contain',
                filter: 'invert(1) brightness(1.2) contrast(1.1)',
                backgroundColor: 'transparent'
              }}
            />
          </div>
          
          {/* Tablet sidebar toggle button - Only visible on tablet */}
          {isTablet && (
            <button 
              className="sidebar-toggle" 
              onClick={toggleSidebarExpand}
              aria-label="Toggle sidebar"
            >
              {sidebarExpanded ? <X size={16} /> : <Menu size={16} />}
            </button>
          )}
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
                className="sidebar-nav-link"
                onClick={closeSidebar} // Close mobile sidebar when a link is clicked
                style={({ isActive }) => ({
                  ...linkBase,
                  color: isActive ? '#ffffff' : '#a0a0a0',
                  background: isActive ? '#ff6b35' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  transform: isActive ? 'translateX(4px)' : 'translateX(0)',
                  boxShadow: isActive ? '0 4px 12px rgba(255, 107, 53, 0.3)' : 'none',
                  justifyContent: isTablet && !sidebarExpanded ? 'center' : 'flex-start'
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
                <Icon size={20} /> <span>{item.label}</span>
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
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px' 
          }}>
            {/* Mobile menu toggle button */}
            <button 
              className="menu-toggle" 
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              <Menu size={24} />
            </button>
            
            {/* Search bar - hidden on mobile */}
            <div className="header-search" style={{
              background: '#3a3a3a',
              padding: '8px 16px',
              borderRadius: '25px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid #555'
            }}>
              <Search size={16} color="#4ade80" />
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
        <div className="content-area responsive-padding">
          {children}
        </div>
      </main>
    </div>
  )
}
