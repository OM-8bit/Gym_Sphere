import React, { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import loginSideImage from '../assets/login-page-side-image.jpg'
import logoImage from '../assets/logo_image.png'

export default function Login() {
  const { login } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ email:'', password:'', full_name:'', gym_name:'' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const { data } = await api.post(url, form)
      if (mode === 'login') {
        login(data)
        toast.success('Welcome!')
        window.location.href = '/'
      } else {
        toast.success('Registered! Please sign in.')
        setMode('login')
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  // Your Original GymSphere Logo using PNG with transparent background
  const GymSphereLogo = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 'clamp(7.5px, 3vw, 15px)'
    }}>
      <img 
        src={logoImage} 
        alt="GymSphere Logo" 
        style={{
          height: 'clamp(180px, 15vw, 270px)',
          width: 'auto',
          objectFit: 'contain',
          maxWidth: '100%',
          // Invert colors with reduced glow intensity
          filter: 'invert(1) brightness(1.2) contrast(1.2) drop-shadow(0 2px 4px rgba(255, 255, 255, 0.1))',
          // Ensure transparency is preserved
          backgroundColor: 'transparent',
          // Additional enhancement for better visibility on dark background
          WebkitFilter: 'invert(1) brightness(1.2) contrast(1.2) drop-shadow(0 2px 4px rgba(255, 255, 255, 0.1))',
          // Smooth rendering
          imageRendering: 'crisp-edges',
          WebkitImageRendering: 'crisp-edges'
        }}
      />
    </div>
  )

  return (
    <div className="login-container" style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Left Side - Your Custom Gym Equipment Image */}
      <div className="login-left" style={{
        flex: '1',
        backgroundImage: `url(${loginSideImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        minHeight: '100vh'
      }}>
        {/* Subtle overlay to ensure text readability on right side */}
        <div style={{
          position: 'absolute',
          inset: '0',
          background: 'linear-gradient(90deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)'
        }}></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-right" style={{
        flex: '1',
        backgroundColor: '#2a2a2a',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'clamp(20px, 5vw, 40px)',
        minWidth: '300px',
        maxHeight: '100vh',
        overflowY: 'auto'
      }}>
        <div style={{ 
          width: '100%', 
          maxWidth: 'clamp(280px, 90vw, 350px)',
          padding: '0 10px',
          boxSizing: 'border-box'
        }}>
          {/* Logo */}
          <GymSphereLogo />

          {/* Form Title */}
          <h2 style={{
            color: '#ffffff',
            fontSize: 'clamp(20px, 4vw, 24px)',
            fontWeight: '600',
            marginBottom: 'clamp(20px, 4vw, 40px)',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            textAlign: 'center'
          }}>
            {mode === 'login' ? 'LOGIN' : 'REGISTER'}
          </h2>

          <form onSubmit={submit}>
            {mode === 'register' && (
              <>
                <div style={{ marginBottom: 'clamp(15px, 3vw, 20px)' }}>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={set('full_name')}
                    required
                    placeholder="Full Name"
                    style={{
                      width: '100%',
                      padding: 'clamp(10px, 2vw, 12px) 0',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid #555',
                      color: '#ffffff',
                      fontSize: 'clamp(14px, 2.5vw, 16px)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderBottomColor = '#ff6b35'}
                    onBlur={(e) => e.target.style.borderBottomColor = '#555'}
                  />
                </div>
                <div style={{ marginBottom: 'clamp(15px, 3vw, 20px)' }}>
                  <input
                    type="text"
                    value={form.gym_name}
                    onChange={set('gym_name')}
                    placeholder="Gym Name (Optional)"
                    style={{
                      width: '100%',
                      padding: 'clamp(10px, 2vw, 12px) 0',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid #555',
                      color: '#ffffff',
                      fontSize: 'clamp(14px, 2.5vw, 16px)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderBottomColor = '#ff6b35'}
                    onBlur={(e) => e.target.style.borderBottomColor = '#555'}
                  />
                </div>
              </>
            )}

            {/* Email Input */}
            <div style={{ marginBottom: 'clamp(15px, 3vw, 20px)', position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '0',
                top: 'clamp(10px, 2vw, 12px)',
                color: '#888',
                fontSize: 'clamp(14px, 2.5vw, 16px)'
              }}>👤</span>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                required
                placeholder={mode === 'register' ? 'Enter your email' : 'uniacademy.contact@provoost.com'}
                style={{
                  width: '100%',
                  padding: `clamp(10px, 2vw, 12px) 0 clamp(10px, 2vw, 12px) clamp(25px, 4vw, 30px)`,
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #555',
                  color: '#ffffff',
                  fontSize: 'clamp(14px, 2.5vw, 16px)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderBottomColor = '#ff6b35'}
                onBlur={(e) => e.target.style.borderBottomColor = '#555'}
              />
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: 'clamp(8px, 2vw, 10px)', position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '0',
                top: 'clamp(10px, 2vw, 12px)',
                color: '#888',
                fontSize: 'clamp(14px, 2.5vw, 16px)'
              }}>🔒</span>
              <input
                type="password"
                value={form.password}
                onChange={set('password')}
                required
                placeholder="••••••••••••••••"
                style={{
                  width: '100%',
                  padding: `clamp(10px, 2vw, 12px) 0 clamp(10px, 2vw, 12px) clamp(25px, 4vw, 30px)`,
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #555',
                  color: '#ffffff',
                  fontSize: 'clamp(14px, 2.5vw, 16px)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderBottomColor = '#ff6b35'}
                onBlur={(e) => e.target.style.borderBottomColor = '#555'}
              />
            </div>

            {/* Forgot Password */}
            {mode === 'login' && (
              <div style={{ textAlign: 'right', marginBottom: 'clamp(20px, 4vw, 40px)' }}>
                <a href="#" style={{
                  color: '#ff6b35',
                  textDecoration: 'none',
                  fontSize: 'clamp(12px, 2.2vw, 14px)'
                }}>
                  Forgot your Password?
                </a>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: 'clamp(12px, 2.5vw, 15px)',
                backgroundColor: loading ? '#cc5429' : '#ff6b35',
                color: '#ffffff',
                border: 'none',
                borderRadius: '25px',
                fontSize: 'clamp(14px, 2.5vw, 16px)',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: 'clamp(20px, 4vw, 30px)',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.7 : 1,
                minHeight: '44px'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#e55a2b'
                  e.target.style.transform = 'translateY(-2px)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#ff6b35'
                  e.target.style.transform = 'translateY(0)'
                }
              }}
            >
              {loading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Create Account')}
            </button>

            {/* Toggle Mode */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ 
                color: '#888', 
                fontSize: 'clamp(12px, 2.2vw, 14px)',
                lineHeight: '1.4'
              }}>
                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ff6b35',
                  cursor: 'pointer',
                  fontSize: 'clamp(12px, 2.2vw, 14px)',
                  textDecoration: 'underline',
                  padding: '0',
                  lineHeight: '1.4'
                }}
              >
                {mode === 'login' ? 'Create' : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .login-container {
            flex-direction: column !important;
            height: 100vh !important;
            min-height: 100vh !important;
          }
          .login-left {
            display: none !important;
          }
          .login-right {
            min-width: unset !important;
            padding: clamp(15px, 4vw, 25px) !important;
            flex: 1 !important;
            min-height: 100vh !important;
            justify-content: center !important;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%) !important;
          }
        }
        
        @media (max-width: 480px) {
          .login-container {
            height: 100vh !important;
          }
          .login-left {
            display: none !important;
          }
          .login-right {
            padding: 15px !important;
            justify-content: center !important;
          }
        }
        
        @media (min-width: 1200px) {
          .login-left {
            flex: 1.2 !important;
          }
          .login-right {
            flex: 0.8 !important;
          }
        }
        
        /* Ensure no horizontal scroll */
        * {
          box-sizing: border-box;
        }
        
        html, body {
          overflow-x: hidden;
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  )
}
