import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import { ArrowLeft, User, Mail, Phone, CreditCard, Calendar } from 'lucide-react'

export default function AddMember() {
  const nav = useNavigate()
  const [form, setForm] = useState({ full_name:'', email:'', phone:'', membership_type:'monthly', card_id:'' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/api/members', form)
      toast.success('Member added successfully')
      nav('/members')
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to add member')
    } finally { setLoading(false) }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

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
                value={form.phone} 
                onChange={set('phone')} 
                placeholder="Enter phone number"
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
                <option value="monthly">Monthly - $49/month</option>
                <option value="yearly">Yearly - $499/year</option>
              </select>
            </div>
          </div>

          {/* Card ID - Full Width */}
          <div style={{ marginBottom: '32px' }}>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={16} color="#ff6b35" />
              Card ID (Optional)
            </label>
            <input 
              className="input" 
              value={form.card_id} 
              onChange={set('card_id')} 
              placeholder="Enter card ID (e.g., CARD001)"
            />
            <div style={{ 
              color: '#a0a0a0', 
              fontSize: '14px', 
              marginTop: '6px' 
            }}>
              Leave blank to auto-generate a card ID
            </div>
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
          <li>Card IDs are used for gym access control</li>
          <li>Monthly memberships renew automatically</li>
        </ul>
      </div>
    </div>
  )
}
