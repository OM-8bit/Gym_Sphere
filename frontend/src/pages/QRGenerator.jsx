import React, { useState } from 'react'
import { QrCode, Download, Copy, RefreshCw, CreditCard, User, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import QuickCardCreator from '../components/QuickCardCreator'

const QRGenerator = () => {
  const [qrData, setQrData] = useState('')
  const [qrType, setQrType] = useState('gymsphere') // 'gymsphere', 'generic', 'url'
  const [cardId, setCardId] = useState('ABC001') // Start with your physical cards
  const [cardType, setCardType] = useState('standard')
  const [generated, setGenerated] = useState(false)

  const generateTestCard = () => {
    let generatedQR = ''
    const timestamp = Date.now()
    
    switch (qrType) {
      case 'gymsphere':
        generatedQR = `GYMSPHERE_CARD:${cardId}:${cardType}:${timestamp}`
        break
      case 'generic':
        generatedQR = cardId
        break
      case 'url':
        generatedQR = `https://gymsphere.com/card/${cardId}?type=${cardType}&t=${timestamp}`
        break
      default:
        generatedQR = cardId
    }
    
    setQrData(generatedQR)
    setGenerated(true)
    toast.success('Test QR code generated!')
  }

  const generateRandomCard = () => {
    const randomNum = Math.floor(Math.random() * 200) + 1 // 1-200
    const randomId = `ABC${randomNum.toString().padStart(3, '0')}` // ABC001-ABC200
    setCardId(randomId)
    toast.info(`Random card ID: ${randomId}`)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrData)
    toast.success('QR data copied to clipboard!')
  }

  return (
    <div className="qr-container" style={{ maxWidth: '1000px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          color: '#ffffff', 
          fontSize: '32px', 
          fontWeight: 700,
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <QrCode size={32} color="#ff6b35" />
          QR Code Generator
        </h1>
        <p style={{ color: '#a0a0a0', fontSize: '16px', margin: 0 }}>
          Generate QR codes for gym cards and test the scanner functionality
        </p>
      </div>

      {/* Quick Card Creator */}
      <QuickCardCreator onCardsCreated={(data) => {
        toast.success(`Created ${data.cards_added} cards! Range: ${data.range}`)
      }} />

      <div className="grid responsive-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Input Section */}
        <div className="card">
          <h3 style={{ color: '#ffffff', marginBottom: '24px', fontSize: '20px' }}>
            QR Code Configuration
          </h3>
          
          {/* QR Type Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <QrCode size={16} color="#ff6b35" />
              QR Code Type
            </label>
            <select 
              className="input"
              value={qrType}
              onChange={(e) => setQrType(e.target.value)}
            >
              <option value="gymsphere">GymSphere Format (Recommended)</option>
              <option value="generic">Generic Card ID</option>
              <option value="url">URL Format</option>
            </select>
          </div>

          {/* Card ID Input */}
          <div style={{ marginBottom: '24px' }}>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={16} color="#ff6b35" />
              Card ID
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                className="input"
                value={cardId}
                onChange={(e) => setCardId(e.target.value)}
                placeholder="Enter card ID (e.g., CARD001)"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={generateRandomCard}
                style={{
                  background: '#3a3a3a',
                  border: '1px solid #555',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                title="Generate Random ID"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Card Type */}
          <div style={{ marginBottom: '24px' }}>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} color="#ff6b35" />
              Card Type
            </label>
            <select 
              className="input"
              value={cardType}
              onChange={(e) => setCardType(e.target.value)}
            >
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
              <option value="vip">VIP</option>
              <option value="guest">Guest</option>
            </select>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateTestCard}
            style={{
              background: '#ff6b35',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '24px'
            }}
          >
            <Zap size={16} />
            Generate Test QR Code
          </button>

          {/* Manual QR Data Input */}
          <div style={{ marginBottom: '24px' }}>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <QrCode size={16} color="#ff6b35" />
              Custom QR Data (Optional)
            </label>
            <textarea 
              className="input"
              value={qrData}
              onChange={(e) => setQrData(e.target.value)}
              placeholder="Or enter custom data for QR code..."
              rows="3"
              style={{ 
                resize: 'vertical',
                minHeight: '100px',
                fontFamily: 'monospace'
              }}
            />
          </div>

          {/* Format Info */}
          <div style={{
            background: '#2a2a2a',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #404040'
          }}>
            <h4 style={{ color: '#ff6b35', fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0' }}>
              Current Format Preview:
            </h4>
            <code style={{
              color: '#a0a0a0',
              fontSize: '12px',
              background: '#1a1a1a',
              padding: '8px',
              borderRadius: '4px',
              display: 'block',
              wordBreak: 'break-all',
              fontFamily: 'monospace'
            }}>
              {qrType === 'gymsphere' && `GYMSPHERE_CARD:${cardId}:${cardType}:[timestamp]`}
              {qrType === 'generic' && cardId}
              {qrType === 'url' && `https://gymsphere.com/card/${cardId}?type=${cardType}&t=[timestamp]`}
            </code>
          </div>
        </div>

        {/* QR Code Display */}
        <div className="card">
          <h3 style={{ color: '#ffffff', marginBottom: '24px', fontSize: '20px' }}>
            Generated QR Code
          </h3>
          
          {qrData ? (
            <div>
              {/* QR Code Display */}
              <div style={{
                background: '#ffffff',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center',
                marginBottom: '20px'
              }}>
                <div id="qr-code" style={{
                  width: '256px',
                  height: '256px',
                  margin: '0 auto',
                  background: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  color: '#6c757d'
                }}>
                  QR Code would be generated here
                  <br />
                  <small>(Use a QR library like qrcode.js)</small>
                </div>
              </div>

              {/* QR Data Preview */}
              <div style={{
                background: '#2a2a2a',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #404040',
                marginBottom: '20px'
              }}>
                <h4 style={{ color: '#ffffff', fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0' }}>
                  QR Code Data:
                </h4>
                <code style={{
                  color: '#a0a0a0',
                  fontSize: '12px',
                  background: '#1a1a1a',
                  padding: '8px',
                  borderRadius: '4px',
                  display: 'block',
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                  maxHeight: '100px',
                  overflowY: 'auto'
                }}>
                  {qrData}
                </code>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={copyToClipboard}
                  style={{
                    background: '#10b981',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Copy size={14} />
                  Copy Data
                </button>
                
                <button
                  onClick={() => window.print()}
                  style={{
                    background: '#3b82f6',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Download size={14} />
                  Print
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#a0a0a0',
              background: '#2a2a2a',
              borderRadius: '12px',
              border: '1px solid #404040'
            }}>
              <QrCode size={48} color="#404040" style={{ marginBottom: '16px' }} />
              <p style={{ margin: 0, fontSize: '16px' }}>
                Generate a QR code to preview it here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Important Notice */}
      <div style={{
        marginTop: '32px',
        padding: '20px',
        background: 'linear-gradient(135deg, #ff6b3510, #ff6b3508)',
        border: '1px solid #ff6b3530',
        borderRadius: '12px'
      }}>
        <h3 style={{ 
          color: '#ff6b35', 
          fontSize: '16px', 
          fontWeight: '600', 
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ⚠️ Important Notice
        </h3>
        <ul style={{ 
          color: '#a0a0a0', 
          fontSize: '14px', 
          lineHeight: '1.6',
          paddingLeft: '20px',
          margin: 0
        }}>
          <li>The QR scanner will fail if the card is not in your gym's inventory database</li>
          <li>For testing, use the generated card IDs and add them to your card inventory first</li>
          <li>The backend expects cards to exist in the `card_inventory` table with matching `card_number`</li>
          <li>Different QR formats are supported: GymSphere format, generic card ID, and URL format</li>
        </ul>
      </div>
    </div>
  )
}

export default QRGenerator
