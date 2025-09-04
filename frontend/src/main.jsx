import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'

// Context Providers
import AuthProvider from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { ToastProvider } from './components/ToastContainer.jsx'

// Components
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Layout from './components/Layout.jsx'
import Sidebar from './components/Sidebar.jsx'
import LoadingSkeleton from './components/LoadingSkeleton.jsx'

// Pages
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Members from './pages/Members.jsx'
import AddMember from './pages/AddMember.jsx'
import EditMember from './pages/EditMember.jsx'
import QRGenerator from './pages/QRGenerator.jsx'
import Scanner from './pages/Scanner.jsx'
import AccessLogs from './pages/AccessLogs.jsx'
import Settings from './pages/Settings.jsx'

function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(() => {
    const saved = localStorage.getItem('sidebarOpen')
    if (saved !== null) return saved === 'true'
    return window.innerWidth >= 1024
  })

  const [loading, setLoading] = React.useState(true)
  const [theme, setTheme] = React.useState(() => {
    return localStorage.getItem('theme') || 'light'
  })

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && sidebarOpen) {
        setSidebarOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [sidebarOpen])

  const toggleSidebar = () => {
    const newState = !sidebarOpen
    setSidebarOpen(newState)
    localStorage.setItem('sidebarOpen', newState.toString())
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <ThemeProvider value={{ theme, toggleTheme }}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="flex h-screen overflow-hidden">
              <Sidebar 
                isOpen={sidebarOpen} 
                toggleSidebar={toggleSidebar}
                theme={theme}
              />
              <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
                <main className="flex-1 overflow-y-auto overflow-x-hidden bg-base-200">
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route 
                      path="/" 
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <Dashboard />
                          </Layout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/members" 
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <Members />
                          </Layout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/add-member" 
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <AddMember />
                          </Layout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/edit/:id" 
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <EditMember />
                          </Layout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/qr-generator" 
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <QRGenerator />
                          </Layout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/scanner" 
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <Scanner />
                          </Layout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/access-logs" 
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <AccessLogs />
                          </Layout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/settings" 
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <Settings />
                          </Layout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="*" element={<Navigate replace to="/" />} />
                  </Routes>
                </main>
              </div>
            </div>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: theme === 'dark' ? '#374151' : '#ffffff',
                  color: theme === 'dark' ? '#ffffff' : '#374151',
                },
              }}
            />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

export default App
