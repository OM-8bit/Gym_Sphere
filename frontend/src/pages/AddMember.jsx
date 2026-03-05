import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import { ArrowLeft, User, Mail, Phone, CreditCard, Calendar, QrCode, Camera } from 'lucide-react'
import { QRScannerModal } from '../components/QRScanner'

export default function AddMember() {
  const nav = useNavigate()
  const [form, setForm] = useState({ full_name:'', email:'', phone:'', membership_type:'monthly', card_id:'' })
  const [loading, setLoading] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [qrScanResult, setQrScanResult] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Create member with validated card from card inventory
      // Map frontend form fields to backend expected fields
      const memberData = {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        membership_type: form.membership_type,
        card_number: form.card_id, // Map card_id to card_number for backend
        create_login: true
      }
      
      const response = await api.post('/api/members', memberData)
      
      if (form.card_id && qrScanResult?.success) {
        // If a QR card was scanned and validated, show enhanced success message
        toast.success(`Member "${form.full_name}" created and assigned to card "${form.card_id}"!`)
      } else if (form.card_id) {
        // Manual card ID entered
        toast.success(`Member "${form.full_name}" created with card ID "${form.card_id}"!`)
      } else {
        // No card assigned
        toast.success(`Member "${form.full_name}" created successfully!`)
      }
      
      nav('/members')
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to add member')
    } finally { setLoading(false) }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleQRScan = async (qrData) => {
    try {
      console.log('QR Code scanned:', qrData)
      
      // Since QR codes are now automatically stored in card_inventory when generated,
      // we only need to validate if the scanned card exists and is available
      toast.loading('Validating card...', { id: 'card-validation' })
      
      const cardScanResult = await api.post('/api/admin/scan-card-qr', {
        qr_data: qrData
      })
      
      if (cardScanResult.data.success) {
        // Card exists and is available for assignment
        const cardId = cardScanResult.data.card_number || cardScanResult.data.cardId
        
        if (!cardId) {
          throw new Error('No card ID returned from backend')
        }

        // Update form with validated card ID
        setForm(prev => ({ ...prev, card_id: cardId }))
        setQrScanResult({
          success: true,
          message: cardScanResult.data.message || 'Card validated successfully!',
          cardId: cardId,
          status: cardScanResult.data.status
        })
        
        toast.success(`Card "${cardId}" ready for member assignment!`, { id: 'card-validation' })
        setShowQRScanner(false)
        
      } else {
        // Card found but not available (assigned or other status)
        toast.error(cardScanResult.data.message, { id: 'card-validation' })
        setQrScanResult({
          success: false,
          message: cardScanResult.data.message,
          error: cardScanResult.data.message,
          cardId: cardScanResult.data.card_number,
          assignedMember: cardScanResult.data.assigned_member
        })
        setShowQRScanner(false)
      }
      
    } catch (error) {
      console.error('QR Scan Error:', error)
      
      // If card is not found in inventory, show appropriate error
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Card not found in inventory. Please ensure the QR code was generated through the system.'
      
      setQrScanResult({
        success: false,
        message: errorMessage,
        error: errorMessage
      })
      
      toast.error(errorMessage, { id: 'card-validation' })
      setShowQRScanner(false)
    }
  }

  const openQRScanner = () => {
    setQrScanResult(null)
    setShowQRScanner(true)
  }

  const closeQRScanner = () => {
    setShowQRScanner(false)
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <button 
            onClick={() => nav('/members')}
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
            margin: 0
          }}>
            Add New Member
          </h1>
        </div>
        <p style={{ color: '#a0a0a0', fontSize: '16px', margin: 0 }}>
          Create a new gym membership account
        </p>
      </div>

      {/* Form Card */}
      <div className="card">
        <form onSubmit={submit}>
          <div className="grid responsive-grid" style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '24px',
            marginBottom: '32px'
          }}>
            {/* Full Name */}
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={16} color="#ff6b35" />
                Full Name
              </label>
              <input 
                className="input" 
                value={form.full_name} 
                onChange={set('full_name')} 
                placeholder="Enter full name"
                required 
              />
            </div>

            {/* Email */}
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} color="#ff6b35" />
                Email Address
              </label>
              <input 
                type="email" 
                className="input" 
                value={form.email} 
                onChange={set('email')} 
                placeholder="Enter email address"
                required 
              />
            </div>

            {/* Phone */}
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} color="#ff6b35" />
                Phone Number
              </label>
              <input 
                className="input" 
                type="tel"
                value={form.phone} 
                onChange={set('phone')} 
                placeholder="Enter phone number"
                minLength="10"
                maxLength="15"
                pattern="[0-9]*"
              />
            </div>

            {/* Membership Type */}
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} color="#ff6b35" />
                Membership Type
              </label>
              <select 
                className="input" 
                value={form.membership_type} 
                onChange={set('membership_type')}
              >
                <option value="weekly">Weekly - $15/week</option>
                <option value="monthly">Monthly - $49/month</option>
                <option value="quarterly">Quarterly - $139/quarter</option>
                <option value="yearly">Yearly - $499/year</option>
              </select>
            </div>
          </div>

          {/* Card ID - Full Width with QR Scanner */}
          <div style={{ marginBottom: '32px' }}>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={16} color="#ff6b35" />
              Card ID (Optional)
            </label>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input 
                className="input" 
                value={form.card_id} 
                onChange={set('card_id')} 
                placeholder="Enter card ID or scan QR code"
                style={{ flex: 1 }}
              />
              
              <button
                type="button"
                onClick={openQRScanner}
                style={{
                  background: '#ff6b35',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  minWidth: '140px',
                  justifyContent: 'center'
                }}
                title="Scan QR Code"
              >
                <QrCode size={16} />
                Scan QR
              </button>
            </div>
            
            <div style={{ 
              color: '#a0a0a0', 
              fontSize: '14px', 
              marginTop: '6px' 
            }}>
              Leave blank to auto-generate a card ID, or scan a QR code from an existing card
            </div>

            {/* QR Scan Result Display - Enhanced for Workflow 1 */}
            {qrScanResult && (
              <div style={{
                marginTop: '12px',
                padding: '12px',
                borderRadius: '8px',
                background: qrScanResult.success 
                  ? 'rgba(16, 185, 129, 0.1)' 
                  : 'rgba(239, 68, 68, 0.1)',
                border: qrScanResult.success 
                  ? '1px solid rgba(16, 185, 129, 0.3)' 
                  : '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <QrCode size={16} color={qrScanResult.success ? '#10b981' : '#ef4444'} />
                <div style={{ flex: 1 }}>
                  <p style={{
                    color: qrScanResult.success ? '#10b981' : '#ef4444',
                    fontSize: '14px',
                    fontWeight: '600',
                    margin: 0
                  }}>
                    {qrScanResult.message}
                  </p>
                  {qrScanResult.success && qrScanResult.cardId && (
                    <div style={{ marginTop: '4px' }}>
                      <p style={{
                        color: '#ffffff',
                        fontSize: '13px',
                        margin: 0,
                        fontWeight: '500'
                      }}>
                        Card ID: {qrScanResult.cardId}
                      </p>
                      {qrScanResult.status && (
                        <p style={{
                          color: '#a0a0a0',
                          fontSize: '12px',
                          margin: 0
                        }}>
                          Status: {qrScanResult.status} 
                          {qrScanResult.isNewCard && ' (New card activated)'}
                        </p>
                      )}
                    </div>
                  )}
                  {!qrScanResult.success && qrScanResult.assignedMember && (
                    <div style={{ marginTop: '4px' }}>
                      <p style={{
                        color: '#ef4444',
                        fontSize: '13px',
                        margin: 0,
                        fontWeight: '500'
                      }}>
                        Currently assigned to: {qrScanResult.assignedMember}
                      </p>
                      <p style={{
                        color: '#a0a0a0',
                        fontSize: '12px',
                        margin: 0
                      }}>
                        Please scan a different card or use an available card
                      </p>
                    </div>
                  )}
                  {!qrScanResult.success && qrScanResult.cardId && !qrScanResult.assignedMember && (
                    <div style={{ marginTop: '4px' }}>
                      <p style={{
                        color: '#a0a0a0',
                        fontSize: '12px',
                        margin: 0
                      }}>
                        Card ID: {qrScanResult.cardId}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex', 
            gap: '16px',
            paddingTop: '24px',
            borderTop: '1px solid #404040'
          }}>
            <button 
              className="btn btn-primary" 
              disabled={loading} 
              type="submit"
              style={{ minWidth: '120px' }}
            >
              {loading ? 'Saving...' : 'Save Member'}
            </button>
            <button 
              className="btn btn-secondary" 
              type="button" 
              onClick={() => nav('/members')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Info Card */}
      <div style={{
        marginTop: '24px',
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
          💡 Quick Tips
        </h3>
        <ul style={{ 
          color: '#a0a0a0', 
          fontSize: '14px', 
          lineHeight: '1.6',
          paddingLeft: '20px'
        }}>
          <li>Email addresses must be unique for each member</li>
          <li>Phone numbers help with quick member lookup</li>
          <li>Card IDs can be entered manually or scanned using QR codes</li>
          <li>QR scanner supports multiple card formats (GymSphere, generic, URL)</li>
          <li>Monthly memberships renew automatically</li>
        </ul>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={showQRScanner}
        onClose={closeQRScanner}
        onScan={handleQRScan}
        scanMode="registration"
        title="Scan Card QR Code"
        description="Position the QR code from the gym card within the frame"
      />
    </div>
  )
}
