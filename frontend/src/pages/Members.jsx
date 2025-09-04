import React, { useEffect, useState } from 'react'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Search, Filter } from 'lucide-react'

export default function Members() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const load = async () => {
    try {
      const { data } = await api.get('/api/members')
      setRows(data)
    } catch { toast.error('Failed to load members') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const remove = async (id) => {
    if (!confirm('Delete this member?')) return
    try {
      await api.delete(`/api/members/${id}`)
      setRows(rows.filter(r => r.id !== id))
      toast.success('Deleted')
    } catch { toast.error('Delete failed') }
  }

  const filteredRows = rows.filter(member =>
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ maxWidth: '1400px' }}>
      {/* Page Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ 
            color: '#ffffff', 
            fontSize: '32px', 
            fontWeight: 700,
            marginBottom: '8px'
          }}>
            Members
          </h1>
          <p style={{ color: '#a0a0a0', fontSize: '16px', margin: 0 }}>
            Manage gym members and their subscriptions
          </p>
        </div>
        <Link to="/add-member" className="btn btn-primary">
          <Plus size={16} style={{marginRight: '4px', flexShrink: 0}} /> 
          <span style={{display: 'inline-block'}}>Add Member</span>
        </Link>
      </div>

      {/* Search and Filter Bar */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '24px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={16} style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: '#a0a0a0'
          }} />
          <input 
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 44px',
              background: '#2d2d2d',
              border: '1px solid #404040',
              borderRadius: '10px',
              color: '#ffffff',
              fontSize: '14px'
            }}
          />
        </div>
        <button className="btn btn-secondary" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px' 
        }}>
          <Filter size={16} /> Filter
        </button>
      </div>

      {/* Members Table */}
      <div className="card">
        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#a0a0a0' 
          }}>
            Loading members...
          </div>
        ) : filteredRows.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#a0a0a0' 
          }}>
            {searchTerm ? 'No members found matching your search.' : 'No members yet.'}
          </div>
        ) : (
          <div>
            {/* Desktop/Tablet View */}
            <div style={{ overflowX: 'auto' }}>
              <table className="table responsive-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Membership</th>
                    <th>Status</th>
                    <th>Expires</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #ff6b35, #e55a2b)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontSize: '16px',
                          fontWeight: '600'
                        }}>
                          {m.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ color: '#ffffff', fontWeight: '500' }}>
                            {m.full_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: '#a0a0a0' }}>{m.email}</td>
                    <td>
                      <span style={{
                        background: '#ff6b3520',
                        color: '#ff6b35',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        textTransform: 'capitalize'
                      }}>
                        {m.membership_type}
                      </span>
                    </td>
                    <td>
                      {m.is_active ? 
                        <span className="badge badge-ok">Active</span> : 
                        <span className="badge badge-bad">Inactive</span>
                      }
                    </td>
                    <td style={{ color: '#a0a0a0' }}>
                      {m.subscription_end ? new Date(m.subscription_end).toLocaleDateString() : '-'}
                    </td>
                    <td>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => remove(m.id)}
                        style={{ 
                          padding: '8px 12px',
                          fontSize: '12px'
                        }}
                      >
                        <Trash2 size={14}/> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            
            {/* Mobile Card View - Compact Rectangular Format */}
            <div className="responsive-card-list" style={{ display: 'none' }}>
              {filteredRows.map(m => (
                <div key={m.id} style={{
                  background: '#2d2d2d',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  minHeight: '60px'
                }}>
                  {/* Left section - Avatar and Name */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    flex: '1',
                    minWidth: '0' // Allow text truncation
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ff6b35, #e55a2b)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: '600',
                      flexShrink: '0'
                    }}>
                      {m.full_name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div style={{ 
                      flex: '1',
                      minWidth: '0',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        color: '#ffffff', 
                        fontWeight: '500',
                        fontSize: '14px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginBottom: '2px'
                      }}>
                        {m.full_name}
                      </div>
                      <div style={{ 
                        color: '#a0a0a0', 
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {m.email}
                      </div>
                    </div>
                  </div>

                  {/* Right section - Status and Actions */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    flexShrink: '0'
                  }}>
                    {/* Membership badge */}
                    <span style={{
                      background: '#ff6b3520',
                      color: '#ff6b35',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '500',
                      textTransform: 'capitalize',
                      whiteSpace: 'nowrap'
                    }}>
                      {m.membership_type}
                    </span>
                    
                    {/* Status badge */}
                    {m.is_active ? 
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#4ade80',
                        flexShrink: '0'
                      }} title="Active"></div> : 
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#ef4444',
                        flexShrink: '0'
                      }} title="Inactive"></div>
                    }
                    
                    {/* Delete button */}
                    <button 
                      onClick={() => remove(m.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: 'none',
                        padding: '6px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        flexShrink: '0'
                      }}
                      title="Delete member"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {!loading && (
        <div style={{ 
          marginTop: '24px',
          padding: '20px',
          background: '#2d2d2d',
          borderRadius: '12px',
          border: '1px solid #404040'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '32px',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                color: '#ff6b35', 
                fontSize: '24px', 
                fontWeight: '700' 
              }}>
                {rows.length}
              </div>
              <div style={{ 
                color: '#a0a0a0', 
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Total Members
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                color: '#4ade80', 
                fontSize: '24px', 
                fontWeight: '700' 
              }}>
                {rows.filter(m => m.is_active).length}
              </div>
              <div style={{ 
                color: '#a0a0a0', 
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Active
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                color: '#f87171', 
                fontSize: '24px', 
                fontWeight: '700' 
              }}>
                {rows.filter(m => !m.is_active).length}
              </div>
              <div style={{ 
                color: '#a0a0a0', 
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Inactive
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
