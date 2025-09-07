import React, { useState } from 'react'
import { Plus, CreditCard, Zap, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const QuickCardCreator = ({ onCardsCreated }) => {
  const [loading, setLoading] = useState(false)
  const [cardPrefix, setCardPrefix] = useState('ABC') // Your existing QR codes
  const [startNumber, setStartNumber] = useState(1)
  const [endNumber, setEndNumber] = useState(200)

  const createTestCards = async () => {
    setLoading(true)
    try {
      const response = await api.post('/api/admin/add-card-batch', {
        prefix: cardPrefix,
        start: startNumber,
        end: endNumber
      })
      
      toast.success(`Created ${response.data.cards_added} test cards!`)
      if (onCardsCreated) {
        onCardsCreated(response.data)
      }
    } catch (error) {
      console.error('Failed to create cards:', error)
      toast.error(error.response?.data?.detail || 'Failed to create test cards')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: '#2a2a2a',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #404040',
      marginBottom: '24px'
    }}>
      <h3 style={{
        color: '#ff6b35',
        fontSize: '18px',
        fontWeight: '600',
        margin: '0 0 16px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Plus size={18} />
        Add Physical Cards to Database
      </h3>
      
      <p style={{
        color: '#a0a0a0',
        fontSize: '14px',
        margin: '0 0 20px 0'
      }}>
        Add your physical QR cards (ABC001-ABC200) to the database so the scanner can recognize them
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div>
          <label className="label" style={{ fontSize: '14px' }}>Prefix</label>
          <input
            className="input"
            value={cardPrefix}
            onChange={(e) => setCardPrefix(e.target.value.toUpperCase())}
            placeholder="ABC"
            maxLength={3}
            style={{ fontSize: '14px', padding: '8px' }}
          />
        </div>
        
        <div>
          <label className="label" style={{ fontSize: '14px' }}>Start #</label>
          <input
            className="input"
            type="number"
            value={startNumber}
            onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
            min={1}
            max={999}
            style={{ fontSize: '14px', padding: '8px' }}
          />
        </div>
        
        <div>
          <label className="label" style={{ fontSize: '14px' }}>End #</label>
          <input
            className="input"
            type="number"
            value={endNumber}
            onChange={(e) => setEndNumber(parseInt(e.target.value) || 10)}
            min={1}
            max={999}
            style={{ fontSize: '14px', padding: '8px' }}
          />
        </div>
      </div>

      <div style={{
        background: '#1a1a1a',
        borderRadius: '8px',
        padding: '12px',
        border: '1px solid #404040',
        marginBottom: '16px'
      }}>
        <p style={{
          color: '#ffffff',
          fontSize: '14px',
          margin: '0 0 4px 0',
          fontWeight: '600'
        }}>
          Will create cards:
        </p>
        <code style={{
          color: '#ff6b35',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          {cardPrefix}{startNumber.toString().padStart(3, '0')} to {cardPrefix}{endNumber.toString().padStart(3, '0')} 
          ({endNumber - startNumber + 1} cards)
        </code>
      </div>

      <button
        onClick={createTestCards}
        disabled={loading || startNumber > endNumber}
        style={{
          background: loading ? '#666' : '#ff6b35',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 20px',
          color: '#ffffff',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        {loading ? (
          <>
            <Zap size={14} />
            Creating Cards...
          </>
        ) : (
          <>
            <CreditCard size={14} />
            Create Test Cards
          </>
        )}
      </button>
    </div>
  )
}

export default QuickCardCreator
