import React, { useState, useEffect } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { Camera, CameraOff, Flashlight, FlashlightOff, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'

const QRScanner = ({ 
  onScan, 
  onError, 
  isActive = true, 
  scanMode = 'registration',
  className = '' 
}) => {
  const [hasPermission, setHasPermission] = useState(null)
  const [facingMode, setFacingMode] = useState('environment') // 'user' for front, 'environment' for back
  const [isFlashOn, setIsFlashOn] = useState(false)
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    // Request camera permission on mount
    if (isActive) {
      requestCameraPermission()
    }
  }, [isActive])

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: facingMode 
        } 
      })
      setHasPermission(true)
      // Stop the stream immediately as the Scanner component will handle it
      stream.getTracks().forEach(track => track.stop())
    } catch (err) {
      console.error('Camera permission denied:', err)
      setHasPermission(false)
      if (onError) {
        onError('Camera access denied. Please allow camera permissions and try again.')
      }
    }
  }

  const handleScan = (result) => {
    if (result && result.length > 0 && !isScanning) {
      setIsScanning(true)
      const scannedData = result[0].rawValue
      
      if (onScan) {
        onScan(scannedData)
      }
      
      // Prevent multiple rapid scans
      setTimeout(() => {
        setIsScanning(false)
      }, 2000)
    }
  }

  const handleError = (error) => {
    console.error('QR Scanner error:', error)
    if (onError) {
      onError(`Scanner error: ${error.message || 'Unknown error'}`)
    }
  }

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')
  }

  const toggleFlash = () => {
    setIsFlashOn(prev => !prev)
    // Note: Flash control will be implemented with additional camera API calls
    toast.info(isFlashOn ? 'Flash turned off' : 'Flash turned on')
  }

  if (hasPermission === null) {
    return (
      <div className="qr-scanner-loading" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        background: '#2a2a2a',
        borderRadius: '12px',
        border: '1px solid #404040',
        color: '#ffffff'
      }}>
        <Camera size={48} color="#ff6b35" style={{ marginBottom: '16px' }} />
        <p>Requesting camera permission...</p>
      </div>
    )
  }

  if (hasPermission === false) {
    return (
      <div className="qr-scanner-error" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        background: '#2a2a2a',
        borderRadius: '12px',
        border: '1px solid #ef4444',
        color: '#ffffff'
      }}>
        <CameraOff size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
        <h3 style={{ color: '#ef4444', marginBottom: '8px' }}>Camera Access Denied</h3>
        <p style={{ textAlign: 'center', marginBottom: '16px', color: '#a0a0a0' }}>
          Please allow camera permissions in your browser settings and refresh the page.
        </p>
        <button 
          onClick={requestCameraPermission}
          style={{
            background: '#ff6b35',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <RotateCcw size={16} />
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className={`qr-scanner ${className}`} style={{
      position: 'relative',
      background: '#1a1a1a',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '2px solid #ff6b35',
      boxShadow: '0 0 20px rgba(255, 107, 53, 0.3)'
    }}>
      {/* Scanner Controls */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        zIndex: 10,
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={toggleCamera}
          style={{
            background: 'rgba(42, 42, 42, 0.8)',
            border: '1px solid #404040',
            borderRadius: '8px',
            padding: '8px',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Switch Camera"
        >
          <RotateCcw size={16} />
        </button>
        
        <button
          onClick={toggleFlash}
          style={{
            background: isFlashOn ? 'rgba(255, 107, 53, 0.8)' : 'rgba(42, 42, 42, 0.8)',
            border: '1px solid #404040',
            borderRadius: '8px',
            padding: '8px',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={isFlashOn ? 'Turn Off Flash' : 'Turn On Flash'}
        >
          {isFlashOn ? <FlashlightOff size={16} /> : <Flashlight size={16} />}
        </button>
      </div>

      {/* Scan Mode Indicator */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        zIndex: 10,
        background: 'rgba(42, 42, 42, 0.8)',
        border: '1px solid #404040',
        borderRadius: '8px',
        padding: '6px 12px',
        color: '#ffffff',
        fontSize: '12px',
        fontWeight: '600'
      }}>
        🚪 Access Control
      </div>

      {/* Scanning Status */}
      {isScanning && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          background: 'rgba(16, 185, 129, 0.9)',
          border: '1px solid #10b981',
          borderRadius: '8px',
          padding: '8px 16px',
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          ✅ QR Code Detected!
        </div>
      )}

      {/* QR Scanner Component */}
      <Scanner
        onScan={handleScan}
        onError={handleError}
        constraints={{
          facingMode: facingMode,
          aspectRatio: 1
        }}
        allowMultiple={false}
        styles={{
          container: {
            width: '100%',
            height: '300px'
          },
          video: {
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }
        }}
      />

      {/* Viewfinder Overlay */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '200px',
        height: '200px',
        border: '2px solid #ff6b35',
        borderRadius: '12px',
        pointerEvents: 'none',
        zIndex: 5,
        boxShadow: '0 0 0 2000px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Corner markers */}
        <div style={{
          position: 'absolute',
          top: '-2px',
          left: '-2px',
          width: '20px',
          height: '20px',
          borderTop: '4px solid #ff6b35',
          borderLeft: '4px solid #ff6b35',
          borderRadius: '4px 0 0 0'
        }} />
        <div style={{
          position: 'absolute',
          top: '-2px',
          right: '-2px',
          width: '20px',
          height: '20px',
          borderTop: '4px solid #ff6b35',
          borderRight: '4px solid #ff6b35',
          borderRadius: '0 4px 0 0'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-2px',
          left: '-2px',
          width: '20px',
          height: '20px',
          borderBottom: '4px solid #ff6b35',
          borderLeft: '4px solid #ff6b35',
          borderRadius: '0 0 0 4px'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-2px',
          right: '-2px',
          width: '20px',
          height: '20px',
          borderBottom: '4px solid #ff6b35',
          borderRight: '4px solid #ff6b35',
          borderRadius: '0 0 4px 0'
        }} />
      </div>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        color: '#ffffff',
        fontSize: '14px',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '8px 16px',
        borderRadius: '8px',
        maxWidth: '80%'
      }}>
        Position QR code within the frame
      </div>
    </div>
  )
}

export default QRScanner
