import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { User, Mail, Building, Shield, Bell, Palette, Database, Key } from 'lucide-react'

export default function Settings() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data & Privacy', icon: Database },
  ]

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          color: '#ffffff', 
          fontSize: '32px', 
          fontWeight: 700,
          marginBottom: '8px'
        }}>
          Settings
        </h1>
        <p style={{ color: '#a0a0a0', fontSize: '16px', margin: 0 }}>
          Manage your account settings and preferences
        </p>
      </div>

      <div style={{ display: 'flex', gap: '32px' }}>
        {/* Settings Navigation */}
        <div style={{ minWidth: '240px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      background: activeTab === tab.id ? '#ff6b35' : 'transparent',
                      color: activeTab === tab.id ? '#ffffff' : '#a0a0a0',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: activeTab === tab.id ? 600 : 500,
                      transition: 'all 0.3s ease',
                      width: '100%',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== tab.id) {
                        e.target.style.background = '#3a3a3a'
                        e.target.style.color = '#ffffff'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== tab.id) {
                        e.target.style.background = 'transparent'
                        e.target.style.color = '#a0a0a0'
                      }
                    }}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div style={{ flex: 1 }}>
          {activeTab === 'profile' && (
            <div className="card">
              <h3 style={{ color: '#ffffff', marginBottom: '24px', fontSize: '20px' }}>
                Profile Settings
              </h3>
              
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div>
                  <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={16} color="#ff6b35" />
                    Full Name
                  </label>
                  <input 
                    className="input" 
                    value={user?.full_name || ''} 
                    placeholder="Enter your full name"
                    readOnly
                  />
                </div>

                <div>
                  <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={16} color="#ff6b35" />
                    Email Address
                  </label>
                  <input 
                    className="input" 
                    value={user?.email || ''} 
                    placeholder="Enter your email"
                    readOnly
                  />
                </div>

                <div>
                  <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building size={16} color="#ff6b35" />
                    Gym Name
                  </label>
                  <input 
                    className="input" 
                    value={user?.gym_name || 'Not specified'} 
                    placeholder="Enter gym name"
                    readOnly
                  />
                </div>

                <div>
                  <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={16} color="#ff6b35" />
                    Account Type
                  </label>
                  <div style={{
                    background: '#ff6b3520',
                    color: '#ff6b35',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Gym Owner
                  </div>
                </div>
              </div>

              <div style={{ 
                marginTop: '32px',
                padding: '20px',
                background: 'linear-gradient(135deg, #ff6b3510, #ff6b3508)',
                border: '1px solid #ff6b3530',
                borderRadius: '12px'
              }}>
                <h4 style={{ 
                  color: '#ff6b35', 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  marginBottom: '8px'
                }}>
                  Account Information
                </h4>
                <p style={{ color: '#a0a0a0', fontSize: '14px', lineHeight: '1.6' }}>
                  Your profile information is currently read-only. Contact support if you need to make changes to your account details.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <h3 style={{ color: '#ffffff', marginBottom: '24px', fontSize: '20px' }}>
                Notification Preferences
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[
                  { title: 'Member Registration', desc: 'Get notified when new members join' },
                  { title: 'Subscription Expiry', desc: 'Alerts for expiring memberships' },
                  { title: 'Payment Reminders', desc: 'Monthly payment notifications' },
                  { title: 'System Updates', desc: 'Important system announcements' }
                ].map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    background: '#3a3a3a',
                    borderRadius: '8px',
                    border: '1px solid #555'
                  }}>
                    <div>
                      <div style={{ color: '#ffffff', fontWeight: '500', marginBottom: '4px' }}>
                        {item.title}
                      </div>
                      <div style={{ color: '#a0a0a0', fontSize: '14px' }}>
                        {item.desc}
                      </div>
                    </div>
                    <div style={{
                      width: '48px',
                      height: '24px',
                      background: '#ff6b35',
                      borderRadius: '12px',
                      position: 'relative',
                      cursor: 'pointer'
                    }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        background: '#ffffff',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        transition: 'all 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="card">
              <h3 style={{ color: '#ffffff', marginBottom: '24px', fontSize: '20px' }}>
                Appearance Settings
              </h3>
              
              <div style={{ marginBottom: '24px' }}>
                <label className="label">Theme</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                  <div style={{
                    padding: '20px',
                    background: '#ff6b35',
                    borderRadius: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    color: '#ffffff',
                    fontWeight: '600',
                    border: '2px solid #ff6b35'
                  }}>
                    <div style={{ marginBottom: '8px' }}>🌙</div>
                    Dark Theme
                  </div>
                  <div style={{
                    padding: '20px',
                    background: '#3a3a3a',
                    borderRadius: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    color: '#a0a0a0',
                    fontWeight: '600',
                    border: '2px solid #555'
                  }}>
                    <div style={{ marginBottom: '8px' }}>☀️</div>
                    Light Theme
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card">
              <h3 style={{ color: '#ffffff', marginBottom: '24px', fontSize: '20px' }}>
                Security Settings
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Key size={16} color="#ff6b35" />
                    Change Password
                  </label>
                  <button className="btn btn-secondary" style={{ marginTop: '8px' }}>
                    Update Password
                  </button>
                </div>

                <div>
                  <label className="label">Two-Factor Authentication</label>
                  <div style={{
                    padding: '16px',
                    background: '#3a3a3a',
                    borderRadius: '8px',
                    border: '1px solid #555',
                    marginTop: '8px'
                  }}>
                    <div style={{ color: '#f87171', marginBottom: '8px', fontWeight: '500' }}>
                      Not Enabled
                    </div>
                    <div style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '12px' }}>
                      Add an extra layer of security to your account
                    </div>
                    <button className="btn btn-primary">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="card">
              <h3 style={{ color: '#ffffff', marginBottom: '24px', fontSize: '20px' }}>
                Data & Privacy
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{
                  padding: '20px',
                  background: '#3a3a3a',
                  borderRadius: '12px',
                  border: '1px solid #555'
                }}>
                  <h4 style={{ color: '#ffffff', marginBottom: '12px' }}>Data Export</h4>
                  <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '16px' }}>
                    Download all your gym data including member information, access logs, and settings.
                  </p>
                  <button className="btn btn-secondary">
                    Export Data
                  </button>
                </div>

                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, #ef444420, #ef444410)',
                  borderRadius: '12px',
                  border: '1px solid #ef444440'
                }}>
                  <h4 style={{ color: '#f87171', marginBottom: '12px' }}>Delete Account</h4>
                  <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '16px' }}>
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <button className="btn btn-danger">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
