import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { QrCode, Clock, CheckCircle, AlertTriangle, ArrowLeft, RefreshCw, ChevronDown } from 'lucide-react'
import { QRScanner, QRScanResult } from '../components/QRScanner'
import qrScannerService from '../services/qrScanner'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function AccessControl() {
  const nav = useNavigate()
  const [scanResult, setScanResult] = useState(null)
  const [scanHistory, setScanHistory] = useState([])
  const [isScanning, setIsScanning] = useState(true)
  const [stats, setStats] = useState({
    totalScans: 0,
    successfulScans: 0,
    failedScans: 0,
    todayScans: 0,
    todaySuccessful: 0,
    todayFailed: 0
  })
  const [sessionStats, setSessionStats] = useState({
    sessionScans: 0,
    sessionSuccessful: 0,
    sessionFailed: 0
  })
  const [expandedStats, setExpandedStats] = useState({
    allTime: false,
    today: false,
    session: false
  })

  const toggleStat = (section) => {
    setExpandedStats(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  useEffect(() => {
    // Load scan history from localStorage
    const savedHistory = localStorage.getItem('qr_scan_history')
    if (savedHistory) {
      try {
        setScanHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error('Failed to parse scan history:', error)
      }
    }

    // Fetch total statistics from database
    fetchTotalStats()
  }, [])

  const fetchTotalStats = async () => {
    try {
      const { data } = await api.get('/api/access/session-stats')
      setStats({
        totalScans: data.total_scans || 0,
        successfulScans: data.successful_scans || 0,
        failedScans: data.failed_scans || 0,
        todayScans: data.today_scans || 0,
        todaySuccessful: data.today_successful || 0,
        todayFailed: data.today_failed || 0
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const saveToHistory = (result) => {
    const memberName = result.member?.name || 
                       (result.member?.first_name && result.member?.last_name 
                         ? `${result.member.first_name} ${result.member.last_name}`
                         : null)
    const cardId = result.card?.card_id || result.card?.card_number || result.rawData
    
    const historyItem = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      success: result.success,
      cardId: cardId,
      member: memberName,
      memberCardDisplay: memberName ? `${memberName} - ${cardId}` : cardId,
      message: result.message
    }

    const newHistory = [historyItem, ...scanHistory.slice(0, 9)] // Keep last 10 scans
    setScanHistory(newHistory)
    localStorage.setItem('qr_scan_history', JSON.stringify(newHistory))

    // Update session stats
    setSessionStats(prev => ({
      sessionScans: prev.sessionScans + 1,
      sessionSuccessful: prev.sessionSuccessful + (result.success ? 1 : 0),
      sessionFailed: prev.sessionFailed + (result.success ? 0 : 1)
    }))

    // Refresh total stats from database
    fetchTotalStats()
  }

  const handleScan = async (qrData) => {
    setIsScanning(false)
    
    try {
      console.log('Scanner - QR Code detected:', qrData)
      
      // Scan for existing card (access control)
      const result = await qrScannerService.scanCardQR(qrData)

      const formattedResult = qrScannerService.formatScanResult(result)
      setScanResult(formattedResult)
      saveToHistory(formattedResult)
      
      if (formattedResult.success) {
        toast.success(formattedResult.message)
      } else {
        toast.error(formattedResult.message)
      }
      
    } catch (error) {
      console.error('Scanner - Error processing QR code:', error)
      
      const errorResult = {
        success: false,
        message: error.message || 'Failed to process QR code',
        details: 'Please try scanning again or check the QR code',
        rawData: qrData,
        timestamp: new Date().toISOString()
      }
      
      setScanResult(errorResult)
      saveToHistory(errorResult)
      toast.error(error.message || 'Failed to process QR code')
    }
  }

  const handleScanError = (error) => {
    console.error('Scanner - Camera error:', error)
    toast.error(`Scanner error: ${error}`)
  }

  const resetScanner = () => {
    setScanResult(null)
    setIsScanning(true)
  }

  const clearHistory = () => {
    setScanHistory([])
    localStorage.removeItem('qr_scan_history')
    setSessionStats({
      sessionScans: 0,
      sessionSuccessful: 0,
      sessionFailed: 0
    })
    toast.success('Session history cleared')
  }

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <button 
            onClick={() => nav('/dashboard')}
            style={{
              background: '#3a3a3a',
              border: '1px solid #555',
              borderRadius: '8px',
              padding: '8px',
              color: '#a0a0a0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <h1 style={{ 
            color: '#ffffff', 
            fontSize: '32px', 
            fontWeight: 700,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <QrCode size={32} color="#ff6b35" />
            Gym Access Control
          </h1>
        </div>
        <p style={{ color: '#a0a0a0', fontSize: '16px', margin: 0 }}>
          Scan member cards to grant gym access
        </p>
      </div>

      {/* Reset Scanner Button */}
      {scanResult && (
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={resetScanner}
            style={{
              background: '#10b981',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={14} />
            Scan Again
          </button>
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'minmax(400px, 1fr) minmax(300px, 400px)',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Scanner Section */}
        <div className="card">
          <h2 style={{ 
            color: '#ffffff', 
            fontSize: '20px', 
            fontWeight: '600',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <QrCode size={20} color="#ff6b35" />
            Gym Access Control
          </h2>

          {/* Scanner or Result */}
          {!scanResult ? (
            <QRScanner
              onScan={handleScan}
              onError={handleScanError}
              isActive={isScanning}
            />
          ) : (
            <QRScanResult
              result={scanResult}
              status={scanResult.success ? 'success' : 'error'}
              member={scanResult.member}
              card={scanResult.card}
              accessLog={scanResult.accessLog}
              onRetry={resetScanner}
            />
          )}
        </div>

        {/* Stats and History Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Scan Statistics - Accordion */}
          <div className="card access-stats-card">
            <h3 style={{ 
              color: '#ffffff', 
              fontSize: '18px', 
              fontWeight: '600',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📊 Access Statistics
            </h3>
            
            {/* All Time Accordion */}
            <div style={{ marginBottom: '12px' }}>
              <div 
                onClick={() => toggleStat('allTime')}
                style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#2a2a2a',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: '1px solid #404040',
                  transition: 'all 0.2s ease'
                }}
              >
                <h4 style={{ 
                  color: '#ff6b35', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  ALL TIME
                </h4>
                <ChevronDown 
                  size={16} 
                  style={{ 
                    color: '#ff6b35',
                    transform: expandedStats.allTime ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }} 
                />
              </div>
              
              {expandedStats.allTime && (
                <div style={{ 
                  marginTop: '8px',
                  padding: '12px',
                  background: '#252525',
                  borderRadius: '8px',
                  border: '1px solid #353535'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid #404040'
                    }}>
                      <span style={{ color: '#a0a0a0', fontSize: '14px' }}>Total Entries</span>
                      <span style={{ color: '#ffffff', fontWeight: '700', fontSize: '16px' }}>{stats.totalScans}</span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid #404040'
                    }}>
                      <span style={{ color: '#a0a0a0', fontSize: '14px' }}>Granted</span>
                      <span style={{ color: '#10b981', fontWeight: '600' }}>{stats.successfulScans}</span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0'
                    }}>
                      <span style={{ color: '#a0a0a0', fontSize: '14px' }}>Denied</span>
                      <span style={{ color: '#ef4444', fontWeight: '600' }}>{stats.failedScans}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Today Accordion */}
            <div style={{ marginBottom: '12px' }}>
              <div 
                onClick={() => toggleStat('today')}
                style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#2a2a2a',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: '1px solid #404040',
                  transition: 'all 0.2s ease'
                }}
              >
                <h4 style={{ 
                  color: '#3b82f6', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  TODAY
                </h4>
                <ChevronDown 
                  size={16} 
                  style={{ 
                    color: '#3b82f6',
                    transform: expandedStats.today ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }} 
                />
              </div>
              
              {expandedStats.today && (
                <div style={{ 
                  marginTop: '8px',
                  padding: '12px',
                  background: '#252525',
                  borderRadius: '8px',
                  border: '1px solid #353535'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid #404040'
                    }}>
                      <span style={{ color: '#a0a0a0', fontSize: '14px' }}>Total</span>
                      <span style={{ color: '#ffffff', fontWeight: '700', fontSize: '16px' }}>{stats.todayScans}</span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid #404040'
                    }}>
                      <span style={{ color: '#a0a0a0', fontSize: '14px' }}>Granted</span>
                      <span style={{ color: '#10b981', fontWeight: '600' }}>{stats.todaySuccessful}</span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0'
                    }}>
                      <span style={{ color: '#a0a0a0', fontSize: '14px' }}>Denied</span>
                      <span style={{ color: '#ef4444', fontWeight: '600' }}>{stats.todayFailed}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* This Session Accordion */}
            <div>
              <div 
                onClick={() => toggleStat('session')}
                style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#2a2a2a',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: '1px solid #404040',
                  transition: 'all 0.2s ease'
                }}
              >
                <h4 style={{ 
                  color: '#10b981', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  THIS SESSION
                </h4>
                <ChevronDown 
                  size={16} 
                  style={{ 
                    color: '#10b981',
                    transform: expandedStats.session ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }} 
                />
              </div>
              
              {expandedStats.session && (
                <div style={{ 
                  marginTop: '8px',
                  padding: '12px',
                  background: '#252525',
                  borderRadius: '8px',
                  border: '1px solid #353535'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid #404040'
                    }}>
                      <span style={{ color: '#a0a0a0', fontSize: '14px' }}>Scans</span>
                      <span style={{ color: '#ffffff', fontWeight: '700', fontSize: '16px' }}>{sessionStats.sessionScans}</span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid #404040'
                    }}>
                      <span style={{ color: '#a0a0a0', fontSize: '14px' }}>Successful</span>
                      <span style={{ color: '#10b981', fontWeight: '600' }}>{sessionStats.sessionSuccessful}</span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0'
                    }}>
                      <span style={{ color: '#a0a0a0', fontSize: '14px' }}>Failed</span>
                      <span style={{ color: '#ef4444', fontWeight: '600' }}>{sessionStats.sessionFailed}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scan History */}
          <div className="card recent-scans-card">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{ 
                color: '#ffffff', 
                fontSize: '18px', 
                fontWeight: '600',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Clock size={16} color="#ff6b35" />
                Recent Scans
              </h3>
              
              {scanHistory.length > 0 && (
                <button
                  onClick={clearHistory}
                  style={{
                    background: 'transparent',
                    border: '1px solid #404040',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    color: '#a0a0a0',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            
            {scanHistory.length === 0 ? (
              <p style={{ color: '#a0a0a0', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                No scans yet
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {scanHistory.map((item) => (
                  <div key={item.id} style={{
                    background: '#2a2a2a',
                    borderRadius: '8px',
                    padding: '12px',
                    border: '1px solid #404040'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      {item.success ? (
                        <CheckCircle size={14} color="#10b981" />
                      ) : (
                        <AlertTriangle size={14} color="#ef4444" />
                      )}
                      <span style={{
                        color: item.success ? '#10b981' : '#ef4444',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {item.success ? 'Granted' : 'Denied'}
                      </span>
                      <span style={{ color: '#a0a0a0', fontSize: '12px' }}>
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <p style={{ color: '#ffffff', fontSize: '13px', margin: 0, fontWeight: '500' }}>
                      {item.memberCardDisplay || item.cardId || 'Unknown card'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
