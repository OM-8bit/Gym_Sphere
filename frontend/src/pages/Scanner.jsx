import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { QrCode, Clock, CheckCircle, AlertTriangle, ArrowLeft, RefreshCw, User, CreditCard } from 'lucide-react'
import { QRScanner, QRScanResult } from '../components/QRScanner'
import qrScannerService from '../services/qrScanner'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Scanner() {
  const nav = useNavigate()
  const [scanMode, setScanMode] = useState('access') // 'access' or 'registration'
  const [scanResult, setScanResult] = useState(null)
  const [scanHistory, setScanHistory] = useState([])
  const [isScanning, setIsScanning] = useState(true)
  const [stats, setStats] = useState({
    totalScans: 0,
    successfulScans: 0,
    failedScans: 0
  })

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
  }, [])

  const saveToHistory = (result) => {
    const historyItem = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      mode: scanMode,
      success: result.success,
      cardId: result.card?.card_id || result.rawData,
      member: result.member?.first_name && result.member?.last_name 
        ? `${result.member.first_name} ${result.member.last_name}`
        : null,
      message: result.message
    }

    const newHistory = [historyItem, ...scanHistory.slice(0, 9)] // Keep last 10 scans
    setScanHistory(newHistory)
    localStorage.setItem('qr_scan_history', JSON.stringify(newHistory))

    // Update stats
    setStats(prev => ({
      totalScans: prev.totalScans + 1,
      successfulScans: prev.successfulScans + (result.success ? 1 : 0),
      failedScans: prev.failedScans + (result.success ? 0 : 1)
    }))
  }

  const handleScan = async (qrData) => {
    setIsScanning(false)
    
    try {
      console.log('Scanner - QR Code detected:', qrData)
      
      let result
      
      if (scanMode === 'access') {
        // Scan for existing card (access control)
        result = await qrScannerService.scanCardQR(qrData)
      } else {
        // Registration mode - Register new card in inventory
        try {
          result = await api.post('/api/admin/scan-new-card', {
            qr_data: qrData
          })
          result = result.data
        } catch (error) {
          console.error('Registration scan error:', error)
          throw new Error(error.response?.data?.detail || 'Failed to register card')
        }
      }

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
    setStats({
      totalScans: 0,
      successfulScans: 0,
      failedScans: 0
    })
    toast.success('Scan history cleared')
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
            QR Code Scanner
          </h1>
        </div>
        <p style={{ color: '#a0a0a0', fontSize: '16px', margin: 0 }}>
          Scan QR codes for gym access control and card registration
        </p>
      </div>

      {/* Scanner Controls */}
      <div style={{ 
        marginBottom: '24px',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* Scan Mode Toggle */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              setScanMode('access')
              resetScanner()
            }}
            style={{
              background: scanMode === 'access' ? '#ff6b35' : '#3a3a3a',
              border: scanMode === 'access' ? '1px solid #ff6b35' : '1px solid #555',
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
            <User size={14} />
            Access Control
          </button>
          
          <button
            onClick={() => {
              setScanMode('registration')
              resetScanner()
            }}
            style={{
              background: scanMode === 'registration' ? '#ff6b35' : '#3a3a3a',
              border: scanMode === 'registration' ? '1px solid #ff6b35' : '1px solid #555',
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
            <CreditCard size={14} />
            Registration
          </button>
        </div>

        {/* Reset Scanner */}
        {scanResult && (
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
        )}
      </div>

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
            {scanMode === 'access' ? 'Access Control Scanner' : 'Card Registration Scanner'}
          </h2>

          {/* Current Scan Mode Info */}
          <div style={{
            background: '#2a2a2a',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            border: '1px solid #404040'
          }}>
            <p style={{
              color: '#ff6b35',
              fontSize: '14px',
              fontWeight: '600',
              margin: '0 0 4px 0'
            }}>
              Current Mode: {scanMode === 'access' ? 'Access Control' : 'Card Registration'}
            </p>
            <p style={{
              color: '#a0a0a0',
              fontSize: '12px',
              margin: 0
            }}>
              {scanMode === 'access' 
                ? 'Scan member cards to grant gym access'
                : 'Scan new physical cards to register them in your card inventory'
              }
            </p>
          </div>

          {/* Scanner or Result */}
          {!scanResult ? (
            <QRScanner
              onScan={handleScan}
              onError={handleScanError}
              isActive={isScanning}
              scanMode={scanMode}
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
          {/* Scan Statistics */}
          <div className="card">
            <h3 style={{ 
              color: '#ffffff', 
              fontSize: '18px', 
              fontWeight: '600',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📊 Session Stats
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #404040'
              }}>
                <span style={{ color: '#a0a0a0', fontSize: '14px' }}>Total Scans</span>
                <span style={{ color: '#ffffff', fontWeight: '600' }}>{stats.totalScans}</span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #404040'
              }}>
                <span style={{ color: '#a0a0a0', fontSize: '14px' }}>Successful</span>
                <span style={{ color: '#10b981', fontWeight: '600' }}>{stats.successfulScans}</span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0'
              }}>
                <span style={{ color: '#a0a0a0', fontSize: '14px' }}>Failed</span>
                <span style={{ color: '#ef4444', fontWeight: '600' }}>{stats.failedScans}</span>
              </div>
            </div>
          </div>

          {/* Scan History */}
          <div className="card">
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
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
                        {item.mode === 'access' ? 'Access' : 'Registration'}
                      </span>
                      <span style={{ color: '#a0a0a0', fontSize: '12px' }}>
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {item.member && (
                      <p style={{ color: '#ffffff', fontSize: '12px', margin: '0 0 2px 0' }}>
                        {item.member}
                      </p>
                    )}
                    
                    <p style={{ color: '#a0a0a0', fontSize: '11px', margin: 0 }}>
                      {item.cardId || 'Unknown card'}
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
