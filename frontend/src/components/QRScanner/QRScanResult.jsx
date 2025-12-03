import React from 'react'
import { CheckCircle, AlertCircle, Clock, User, CreditCard, Calendar, MapPin, RotateCcw, X } from 'lucide-react'

const QRScanResult = ({ 
  result, 
  status = 'success', // 'success', 'error', 'pending', 'processing'
  member = null,
  card = null,
  accessLog = null,
  onRetry = null,
  onClose = null,
  className = ''
}) => {
  // Helper functions for card status display
  const getCardStatusText = () => {
    // Option 3: Base status on member's access grant status
    if (result?.success !== undefined) {
      return result.success ? 'Active' : 'Inactive'
    }
    
    // Option 2: Show "Assigned" if card is inactive (means it's in use)
    if (card?.is_active === false && member) {
      return 'Assigned'
    }
    
    // Fallback to original logic
    return card?.is_active ? 'Active' : 'Assigned'
  }
  
  const getCardStatusColor = () => {
    // Option 3: Color based on member's access grant status
    if (result?.success !== undefined) {
      return result.success ? '#10b981' : '#ef4444'
    }
    
    // Option 2: Show green for assigned cards (they're working)
    if (card?.is_active === false && member) {
      return '#10b981'
    }
    
    // Fallback
    return card?.is_active ? '#10b981' : '#10b981'
  }
  
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle size={24} color="#10b981" />
      case 'error':
        return <AlertCircle size={24} color="#ef4444" />
      case 'pending':
      case 'processing':
        return <Clock size={24} color="#ff6b35" />
      default:
        return <CheckCircle size={24} color="#10b981" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return {
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          text: '#10b981'
        }
      case 'error':
        return {
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          text: '#ef4444'
        }
      case 'pending':
      case 'processing':
        return {
          background: 'rgba(255, 107, 53, 0.1)',
          border: '1px solid rgba(255, 107, 53, 0.3)',
          text: '#ff6b35'
        }
      default:
        return {
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          text: '#10b981'
        }
    }
  }

  const getStatusTitle = () => {
    switch (status) {
      case 'success':
        return member ? 'Member Access Granted' : card ? 'Card Registered Successfully' : 'QR Code Scanned'
      case 'error':
        return 'Scan Failed'
      case 'processing':
        return 'Processing QR Code...'
      case 'pending':
        return 'Scan Pending...'
      default:
        return 'QR Code Result'
    }
  }

  const statusColors = getStatusColor()

  return (
    <div className={`qr-scan-result ${className}`} style={{
      background: '#1a1a1a',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #404040',
      maxWidth: '500px',
      width: '100%'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {getStatusIcon()}
          <h3 style={{
            color: statusColors.text,
            fontSize: '20px',
            fontWeight: '700',
            margin: 0
          }}>
            {getStatusTitle()}
          </h3>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid #404040',
              borderRadius: '6px',
              padding: '6px',
              color: '#a0a0a0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Status Banner */}
      <div style={{
        background: statusColors.background,
        border: statusColors.border,
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: result?.message ? '8px' : 0
        }}>
          {getStatusIcon()}
          <p style={{
            color: statusColors.text,
            fontWeight: '600',
            fontSize: '16px',
            margin: 0
          }}>
            {result?.message || getStatusTitle()}
          </p>
        </div>
        
        {result?.details && (
          <p style={{
            color: '#a0a0a0',
            fontSize: '14px',
            margin: 0,
            marginLeft: '36px'
          }}>
            {result.details}
          </p>
        )}
      </div>

      {/* Member Information */}
      {member && (
        <div style={{
          background: '#2a2a2a',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #404040',
          marginBottom: '20px'
        }}>
          <h4 style={{
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: '600',
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <User size={18} color="#ff6b35" />
            Member Details
          </h4>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            color: '#ffffff'
          }}>
            <div style={{ gridColumn: member.name && !member.first_name ? '1 / -1' : 'auto' }}>
              <p style={{ fontSize: '12px', color: '#a0a0a0', margin: '0 0 4px 0' }}>Name</p>
              <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>
                {member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'N/A'}
              </p>
            </div>
            
            {member.member_id && (
              <div>
                <p style={{ fontSize: '12px', color: '#a0a0a0', margin: '0 0 4px 0' }}>Member ID</p>
                <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>
                  #{member.member_id}
                </p>
              </div>
            )}
            
            {member.email && (
              <div>
                <p style={{ fontSize: '12px', color: '#a0a0a0', margin: '0 0 4px 0' }}>Email</p>
                <p style={{ fontSize: '14px', margin: 0 }}>
                  {member.email}
                </p>
              </div>
            )}
            
            {member.membership_type && (
              <div>
                <p style={{ fontSize: '12px', color: '#a0a0a0', margin: '0 0 4px 0' }}>Plan</p>
                <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>
                  {member.membership_type}
                </p>
              </div>
            )}
            
            {member.phone && (
              <div>
                <p style={{ fontSize: '12px', color: '#a0a0a0', margin: '0 0 4px 0' }}>Phone</p>
                <p style={{ fontSize: '14px', margin: 0 }}>
                  {member.phone}
                </p>
              </div>
            )}
            
            {member.membership_start && (
              <div>
                <p style={{ fontSize: '12px', color: '#a0a0a0', margin: '0 0 4px 0' }}>Membership Start</p>
                <p style={{ fontSize: '14px', margin: 0 }}>
                  {new Date(member.membership_start).toLocaleDateString()}
                </p>
              </div>
            )}
            
            {(member.membership_end || member.subscription_end) && (
              <div>
                <p style={{ fontSize: '12px', color: '#a0a0a0', margin: '0 0 4px 0' }}>Membership End</p>
                <p style={{ 
                  fontSize: '14px', 
                  margin: 0,
                  color: new Date(member.membership_end || member.subscription_end) < new Date() ? '#ef4444' : '#10b981'
                }}>
                  {new Date(member.membership_end || member.subscription_end).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Card Information */}
      {card && (
        <div style={{
          background: '#2a2a2a',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #404040',
          marginBottom: '20px'
        }}>
          <h4 style={{
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: '600',
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CreditCard size={18} color="#ff6b35" />
            Card Information
          </h4>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            color: '#ffffff'
          }}>
            <div>
              <p style={{ fontSize: '12px', color: '#a0a0a0', margin: '0 0 4px 0' }}>Card ID</p>
              <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>
                {card.card_id}
              </p>
            </div>
            
            <div>
              <p style={{ fontSize: '12px', color: '#a0a0a0', margin: '0 0 4px 0' }}>Status</p>
              <p style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                margin: 0,
                color: getCardStatusColor()
              }}>
                {getCardStatusText()}
              </p>
            </div>
            
            {card.card_type && (
              <div>
                <p style={{ fontSize: '12px', color: '#a0a0a0', margin: '0 0 4px 0' }}>Card Type</p>
                <p style={{ fontSize: '14px', margin: 0 }}>
                  {card.card_type}
                </p>
              </div>
            )}
            
            {card.created_at && (
              <div>
                <p style={{ fontSize: '12px', color: '#a0a0a0', margin: '0 0 4px 0' }}>Registered</p>
                <p style={{ fontSize: '14px', margin: 0 }}>
                  {new Date(card.created_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Access Log Information */}
      {accessLog && (
        <div style={{
          background: '#2a2a2a',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #404040',
          marginBottom: '20px'
        }}>
          <h4 style={{
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: '600',
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MapPin size={18} color="#ff6b35" />
            Access Log
          </h4>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            color: '#ffffff'
          }}>
            <div>
              <p style={{ fontSize: '12px', color: '#a0a0a0', margin: '0 0 4px 0' }}>Access Time</p>
              <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>
                {new Date(accessLog.access_time).toLocaleString()}
              </p>
            </div>
            
            <div>
              <p style={{ fontSize: '12px', color: '#a0a0a0', margin: '0 0 4px 0' }}>Access Type</p>
              <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>
                {accessLog.access_type}
              </p>
            </div>
            
            {accessLog.location && (
              <div>
                <p style={{ fontSize: '12px', color: '#a0a0a0', margin: '0 0 4px 0' }}>Location</p>
                <p style={{ fontSize: '14px', margin: 0 }}>
                  {accessLog.location}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Raw QR Data (for debugging) */}
      {result?.rawData && (
        <div style={{
          background: '#2a2a2a',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #404040',
          marginBottom: '20px'
        }}>
          <h4 style={{
            color: '#a0a0a0',
            fontSize: '14px',
            fontWeight: '600',
            margin: '0 0 8px 0'
          }}>
            QR Code Data:
          </h4>
          <code style={{
            color: '#ffffff',
            fontSize: '12px',
            background: '#1a1a1a',
            padding: '8px',
            borderRadius: '6px',
            display: 'block',
            wordBreak: 'break-all',
            fontFamily: 'monospace'
          }}>
            {result.rawData}
          </code>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end'
      }}>
        {onRetry && status === 'error' && (
          <button
            onClick={onRetry}
            style={{
              background: '#ff6b35',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <RotateCcw size={16} />
            Retry Scan
          </button>
        )}
        
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '2px solid #404040',
              borderRadius: '8px',
              padding: '10px 20px',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Close
          </button>
        )}
      </div>
    </div>
  )
}

export default QRScanResult
