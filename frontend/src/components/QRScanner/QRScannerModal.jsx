import React, { useState, useEffect } from 'react'
import { X, Camera, Zap, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react'
import QRScanner from './QRScanner'
import toast from 'react-hot-toast'

const QRScannerModal = ({ 
  isOpen, 
  onClose, 
  onScan, 
  scanMode = 'registration',
  title = 'Scan QR Code',
  description = 'Position the QR code within the frame to scan'
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setScanResult(null)
      setError(null)
      setIsProcessing(false)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      // Restore body scroll when modal closes
      document.body.style.overflow = 'unset'
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleScan = async (scannedData) => {
    if (isProcessing) return

    setIsProcessing(true)
    setError(null)

    try {
      console.log('QR Code Scanned:', scannedData)
      
      // Validate QR code format
      if (!scannedData || scannedData.trim() === '') {
        throw new Error('Invalid QR code: Empty data')
      }

      // Show success state
      setScanResult(scannedData)
      toast.success('QR Code scanned successfully!')

      // Call the parent callback
      if (onScan) {
        await onScan(scannedData)
      }

      // Auto-close after success (optional delay)
      setTimeout(() => {
        handleClose()
      }, 1500)

    } catch (error) {
      console.error('QR Scan processing error:', error)
      setError(error.message || 'Failed to process QR code')
      toast.error(error.message || 'Failed to process QR code')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleScanError = (errorMessage) => {
    setError(errorMessage)
    toast.error(errorMessage)
  }

  const handleClose = () => {
    if (!isProcessing) {
      onClose()
    }
  }

  const handleRetry = () => {
    setScanResult(null)
    setError(null)
    setIsProcessing(false)
  }

  if (!isOpen) return null

  return (
    <div className="qr-scanner-modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        width: '100%',
        maxWidth: '500px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div>
          <h2 style={{
            color: '#ffffff',
            fontSize: '24px',
            fontWeight: '700',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Camera size={28} color="#ff6b35" />
            {title}
          </h2>
          <p style={{
            color: '#a0a0a0',
            fontSize: '14px',
            margin: '4px 0 0 40px'
          }}>
            {description}
          </p>
        </div>
        
        <button
          onClick={handleClose}
          disabled={isProcessing}
          style={{
            background: 'transparent',
            border: '2px solid #404040',
            borderRadius: '8px',
            padding: '8px',
            color: '#ffffff',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            opacity: isProcessing ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Close Scanner"
        >
          <X size={20} />
        </button>
      </div>

      {/* Scanner Content */}
      <div style={{
        width: '100%',
        maxWidth: '500px',
        background: '#1a1a1a',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid #404040'
      }}>
        {/* Scan Status */}
        {(scanResult || error || isProcessing) && (
          <div style={{
            marginBottom: '20px',
            padding: '16px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: scanResult 
              ? 'rgba(16, 185, 129, 0.1)' 
              : error 
                ? 'rgba(239, 68, 68, 0.1)' 
                : 'rgba(255, 107, 53, 0.1)',
            border: scanResult 
              ? '1px solid rgba(16, 185, 129, 0.3)' 
              : error 
                ? '1px solid rgba(239, 68, 68, 0.3)' 
                : '1px solid rgba(255, 107, 53, 0.3)'
          }}>
            {isProcessing && (
              <>
                <Zap size={20} color="#ff6b35" style={{ animation: 'pulse 1s infinite' }} />
                <div>
                  <p style={{ color: '#ff6b35', fontWeight: '600', margin: 0 }}>
                    Processing QR Code...
                  </p>
                  <p style={{ color: '#a0a0a0', fontSize: '14px', margin: 0 }}>
                    Please wait while we verify the code
                  </p>
                </div>
              </>
            )}
            
            {scanResult && !isProcessing && (
              <>
                <CheckCircle size={20} color="#10b981" />
                <div>
                  <p style={{ color: '#10b981', fontWeight: '600', margin: 0 }}>
                    QR Code Scanned Successfully!
                  </p>
                  <p style={{ color: '#a0a0a0', fontSize: '14px', margin: 0 }}>
                    Data: {scanResult.substring(0, 30)}...
                  </p>
                </div>
              </>
            )}
            
            {error && (
              <>
                <AlertCircle size={20} color="#ef4444" />
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#ef4444', fontWeight: '600', margin: 0 }}>
                    Scan Error
                  </p>
                  <p style={{ color: '#a0a0a0', fontSize: '14px', margin: 0 }}>
                    {error}
                  </p>
                </div>
                <button
                  onClick={handleRetry}
                  style={{
                    background: '#ff6b35',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <RotateCcw size={14} />
                  Retry
                </button>
              </>
            )}
          </div>
        )}

        {/* QR Scanner */}
        {!scanResult && (
          <QRScanner
            onScan={handleScan}
            onError={handleScanError}
            isActive={isOpen && !isProcessing}
            scanMode={scanMode}
            className="modal-scanner"
          />
        )}

        {/* Instructions */}
        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: '#2a2a2a',
          borderRadius: '12px',
          border: '1px solid #404040'
        }}>
          <h4 style={{
            color: '#ff6b35',
            fontSize: '16px',
            fontWeight: '600',
            margin: '0 0 8px 0'
          }}>
            Scanning Tips:
          </h4>
          <ul style={{
            color: '#a0a0a0',
            fontSize: '14px',
            margin: 0,
            paddingLeft: '20px'
          }}>
            <li>Hold your device steady</li>
            <li>Ensure good lighting</li>
            <li>Position QR code within the frame</li>
            <li>Keep the code flat and unobstructed</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div style={{
          marginTop: '20px',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            style={{
              background: 'transparent',
              border: '2px solid #404040',
              borderRadius: '8px',
              padding: '10px 20px',
              color: '#ffffff',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              opacity: isProcessing ? 0.5 : 1,
              fontWeight: '600'
            }}
          >
            {isProcessing ? 'Processing...' : 'Cancel'}
          </button>
        </div>
      </div>

      {/* Pulse animation for processing state */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

export default QRScannerModal
