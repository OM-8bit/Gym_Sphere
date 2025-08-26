import React, { useState } from 'react'
import { QrCode, Download, Copy, RefreshCw } from 'lucide-react'

const QRGenerator = () => {
  const [qrData, setQrData] = useState('https://gymsphere.com/access/member123')
  const [generated, setGenerated] = useState(false)

  const generateQR = () => {
    setGenerated(true)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrData)
  }

  return (
    <div className="qr-container" style={{ maxWidth: '1000px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          color: '#ffffff', 
          fontSize: '32px', 
          fontWeight: 700,
          marginBottom: '8px'
        }}>
          QR Code Generator
        </h1>
        <p style={{ color: '#a0a0a0', fontSize: '16px', margin: 0 }}>
          Generate QR codes for member access and gym services
        </p>
      </div>

      <div className="grid responsive-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Input Section */}
        <div className="card">
          <h3 style={{ color: '#ffffff', marginBottom: '24px', fontSize: '20px' }}>
            QR Code Configuration
          </h3>
          
          <div style={{ marginBottom: '24px' }}>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <QrCode size={16} color="#ff6b35" />
              Data to Encode
            </label>
            <textarea 
              className="input"
              value={qrData}
              onChange={(e) => setQrData(e.target.value)}
              placeholder="Enter data for QR code..."
              rows="4"
              style={{ 
                resize: 'vertical',
                minHeight: '100px',
                fontFamily: 'monospace'
              }}
            />
          </div>

          <div className="qr-button-container" style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-primary btn-mobile-full"
              onClick={generateQR}
              style={{ flex: 1 }}
            >
              <QrCode size={16} style={{marginRight: '4px', flexShrink: 0}} /> 
              <span style={{display: 'inline-block'}}>Generate QR Code</span>
            </button>
            <button 
              className="btn btn-secondary btn-mobile-full"
              onClick={() => setQrData('')}
            >
              <RefreshCw size={16} style={{marginRight: '4px', flexShrink: 0}} /> 
              <span style={{display: 'inline-block'}}>Clear</span>
            </button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="card">
          <h3 style={{ color: '#ffffff', marginBottom: '24px', fontSize: '20px' }}>
            QR Code Preview
          </h3>
          
          <div style={{ 
            textAlign: 'center',
            padding: '40px',
            background: '#3a3a3a',
            borderRadius: '12px',
            border: '2px dashed #555',
            marginBottom: '24px'
          }}>
            {generated ? (
              <div>
                <div style={{
                  width: '200px',
                  height: '200px',
                  background: '#ffffff',
                  margin: '0 auto',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  color: '#333',
                  fontWeight: '600',
                  marginBottom: '16px'
                }}>
                  QR CODE
                  <br />
                  PREVIEW
                </div>
                <div style={{ color: '#4ade80', fontSize: '14px' }}>
                  QR Code Generated Successfully
                </div>
              </div>
            ) : (
              <div>
                <QrCode size={64} color="#666" style={{ marginBottom: '16px' }} />
                <div style={{ color: '#a0a0a0', fontSize: '14px' }}>
                  Click "Generate QR Code" to preview
                </div>
              </div>
            )}
          </div>

          {generated && (
            <div className="qr-button-container" style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-primary btn-mobile-full" style={{ flex: 1 }}>
                <Download size={16} style={{marginRight: '4px', flexShrink: 0}} /> 
                <span style={{display: 'inline-block'}}>Download PNG</span>
              </button>
              <button 
                className="btn btn-secondary btn-mobile-full"
                onClick={copyToClipboard}
              >
                <Copy size={16} style={{marginRight: '4px', flexShrink: 0}} /> 
                <span style={{display: 'inline-block'}}>Copy Data</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Templates */}
      <div className="card" style={{ marginTop: '32px' }}>
        <h3 style={{ color: '#ffffff', marginBottom: '24px', fontSize: '20px' }}>
          Quick Templates
        </h3>
        
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {[
            { name: 'Member Access', data: 'https://gymsphere.com/access/member123', icon: '🏃‍♂️' },
            { name: 'WiFi Password', data: 'WIFI:T:WPA;S:GymSphere_Guest;P:password123;;', icon: '📶' },
            { name: 'Contact Info', data: 'BEGIN:VCARD\nFN:GymSphere\nTEL:+1234567890\nEND:VCARD', icon: '📞' },
            { name: 'Website URL', data: 'https://www.gymsphere.com', icon: '🌐' }
          ].map((template, index) => (
            <div 
              key={index}
              onClick={() => setQrData(template.data)}
              style={{
                padding: '20px',
                background: '#3a3a3a',
                borderRadius: '12px',
                border: '1px solid #555',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#404040'
                e.target.style.borderColor = '#ff6b35'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#3a3a3a'
                e.target.style.borderColor = '#555'
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                {template.icon}
              </div>
              <div style={{ color: '#ffffff', fontWeight: '600', marginBottom: '4px' }}>
                {template.name}
              </div>
              <div style={{ color: '#a0a0a0', fontSize: '12px' }}>
                Click to use template
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default QRGenerator
