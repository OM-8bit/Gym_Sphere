import React, { useState, useEffect } from 'react'
import { X, User, Mail, Phone, Calendar, CreditCard, Save } from 'lucide-react'
import api from '../services/api.js'
import toast from 'react-hot-toast'

const MemberEditModal = ({ isOpen, member, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    membership_type: 'monthly',
    subscription_start: '',
    subscription_end: '',
    card_id: '',
    is_active: true
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (member && isOpen) {
      // Helper function to format date from ISO string or existing format
      const formatDate = (dateStr) => {
        if (!dateStr) return ''
        try {
          // If it's already in YYYY-MM-DD format, return as is
          if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateStr
          }
          // If it's ISO format, extract date part
          if (dateStr.includes('T')) {
            return dateStr.split('T')[0]
          }
          // If it's in DD/MM/YYYY format, convert to YYYY-MM-DD
          if (dateStr.includes('/')) {
            const [day, month, year] = dateStr.split('/')
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
          }
          return dateStr
        } catch {
          return ''
        }
      }

      setFormData({
        full_name: member.full_name || '',
        email: member.email || '',
        phone: member.phone || '',
        membership_type: member.membership_type || 'monthly',
        subscription_start: formatDate(member.subscription_start || member.join_date || ''),
        subscription_end: formatDate(member.subscription_end || member.end_date || ''),
        card_id: member.card_id || member.card_number || '',
        is_active: member.is_active !== false
      })
    }
  }, [member, isOpen])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.put(`/api/members/${member.id}`, formData)
      toast.success('Member updated successfully!')
      onUpdate(response.data.member || { ...member, ...formData })
      onClose()
    } catch (error) {
      console.error('Update error:', error)
      toast.error(error.response?.data?.detail || 'Failed to update member')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#1f1f1f',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '1px solid #404040',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 24px 0 24px',
          borderBottom: '1px solid #404040',
          paddingBottom: '20px'
        }}>
          <h2 style={{
            color: '#ffffff',
            fontSize: '24px',
            fontWeight: '700',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <User size={24} color="#ff6b35" />
            Edit Member
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#a0a0a0',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#404040'
              e.target.style.color = '#ffffff'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent'
              e.target.style.color = '#a0a0a0'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '24px'
          }}>
            {/* Full Name */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                <User size={16} color="#ff6b35" />
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#2d2d2d',
                  border: '1px solid #404040',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff6b35'}
                onBlur={(e) => e.target.style.borderColor = '#404040'}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                <Mail size={16} color="#ff6b35" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#2d2d2d',
                  border: '1px solid #404040',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff6b35'}
                onBlur={(e) => e.target.style.borderColor = '#404040'}
              />
            </div>

            {/* Phone */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                <Phone size={16} color="#ff6b35" />
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                minLength="10"
                maxLength="15"
                pattern="[0-9]*"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#2d2d2d',
                  border: '1px solid #404040',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff6b35'}
                onBlur={(e) => e.target.style.borderColor = '#404040'}
              />
            </div>

            {/* Membership Type */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                <Calendar size={16} color="#ff6b35" />
                Membership Type
              </label>
              <select
                name="membership_type"
                value={formData.membership_type}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#2d2d2d',
                  border: '1px solid #404040',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff6b35'}
                onBlur={(e) => e.target.style.borderColor = '#404040'}
              >
                <option value="monthly">Monthly - $49/month</option>
                <option value="yearly">Yearly - $499/year</option>
                <option value="quarterly">Quarterly - $139/quarter</option>
                <option value="weekly">Weekly - $15/week</option>
              </select>
            </div>

            {/* Join Date */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                <Calendar size={16} color="#ff6b35" />
                Join Date
              </label>
              <input
                type="date"
                name="subscription_start"
                value={formData.subscription_start}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#2d2d2d',
                  border: '1px solid #404040',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff6b35'}
                onBlur={(e) => e.target.style.borderColor = '#404040'}
              />
            </div>

            {/* End Date */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                <Calendar size={16} color="#ff6b35" />
                Membership End Date
              </label>
              <input
                type="date"
                name="subscription_end"
                value={formData.subscription_end}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#2d2d2d',
                  border: '1px solid #404040',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff6b35'}
                onBlur={(e) => e.target.style.borderColor = '#404040'}
              />
            </div>

            {/* Card ID */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                <CreditCard size={16} color="#ff6b35" />
                Card ID (Optional)
              </label>
              <input
                type="text"
                name="card_id"
                value={formData.card_id}
                onChange={handleInputChange}
                placeholder="Enter card number"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#2d2d2d',
                  border: '1px solid #404040',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff6b35'}
                onBlur={(e) => e.target.style.borderColor = '#404040'}
              />
            </div>

            {/* Active Status */}
            <div style={{
              gridColumn: '1 / -1', // Span full width
              padding: '16px',
              background: formData.is_active ? '#10b98110' : '#ef444410',
              borderRadius: '10px',
              border: `1px solid ${formData.is_active ? '#10b98130' : '#ef444430'}`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px'
              }}>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#ff6b35'
                  }}
                />
                <label style={{
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Member Status: {formData.is_active ? 'Active' : 'Suspended'}
                </label>
              </div>
              <p style={{
                color: '#a0a0a0',
                fontSize: '12px',
                margin: 0,
                lineHeight: '1.4'
              }}>
                {formData.is_active ? 
                  '✅ Member can access the gym normally' : 
                  '⚠️ Member is administratively suspended and cannot access the gym'
                }
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            paddingTop: '20px',
            borderTop: '1px solid #404040'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                border: '1px solid #404040',
                borderRadius: '10px',
                color: '#a0a0a0',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#404040'
                e.target.style.color = '#ffffff'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent'
                e.target.style.color = '#a0a0a0'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: loading ? '#ff6b3580' : '#ff6b35',
                border: 'none',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => !loading && (e.target.style.background = '#e55a2b')}
              onMouseLeave={(e) => !loading && (e.target.style.background = '#ff6b35')}
            >
              <Save size={16} />
              {loading ? 'Updating...' : 'Update Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MemberEditModal
