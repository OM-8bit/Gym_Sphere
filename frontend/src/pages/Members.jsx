import React, { useEffect, useState } from 'react'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Search, Filter, Edit, ChevronDown } from 'lucide-react'
import MemberEditModal from '../components/MemberEditModal.jsx'

export default function Members() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  // Function to calculate member status based on end date
  const calculateMemberStatus = (member) => {
    const today = new Date()
    const endDate = member.subscription_end || member.end_date
    
    if (!endDate) return 'Active'
    
    try {
      const memberEndDate = new Date(endDate)
      const diffTime = memberEndDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return 'Expired'
      if (diffDays <= 7) return 'Near Expiry'
      return 'Active'
    } catch {
      return 'Active' // Default to active if date parsing fails
    }
  }

  const load = async () => {
    try {
      const { data } = await api.get('/api/members')
      // Backend returns {members: [...], count: number}, so extract the members array
      const membersArray = data.members || []
      // Calculate status for each member
      const membersWithStatus = membersArray.map(member => ({
        ...member,
        status: calculateMemberStatus(member)
      }))
      setRows(Array.isArray(membersWithStatus) ? membersWithStatus : [])
    } catch { 
      toast.error('Failed to load members')
      setRows([]) // Set to empty array on error
    }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilterDropdown && !event.target.closest('.filter-dropdown')) {
        setShowFilterDropdown(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showFilterDropdown])

  const remove = async (id) => {
    if (!confirm('Delete this member?')) return
    try {
      await api.delete(`/api/members/${id}`)
      // Ensure rows is an array before filtering
      setRows(Array.isArray(rows) ? rows.filter(r => r.id !== id) : [])
      toast.success('Deleted')
    } catch { toast.error('Delete failed') }
  }

  // Function to handle member edit
  const handleEdit = (member) => {
    setEditingMember(member)
    setShowEditModal(true)
  }

  // Function to handle member update
  const handleMemberUpdate = (updatedMember) => {
    const updatedMemberWithStatus = {
      ...updatedMember,
      status: calculateMemberStatus(updatedMember)
    }
    setRows(prevRows => 
      prevRows.map(member => 
        member.id === updatedMemberWithStatus.id ? updatedMemberWithStatus : member
      )
    )
  }

  // Function to get status badge style
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Active':
        return {
          background: '#10b98120',
          color: '#10b981',
          border: '1px solid #10b98130'
        }
      case 'Near Expiry':
        return {
          background: '#f59e0b20',
          color: '#f59e0b',
          border: '1px solid #f59e0b30'
        }
      case 'Expired':
        return {
          background: '#ef444420',
          color: '#ef4444',
          border: '1px solid #ef444430'
        }
      default:
        return {
          background: '#64748b20',
          color: '#64748b',
          border: '1px solid #64748b30'
        }
    }
  }

  // Ensure rows is an array before filtering
  const filteredRows = Array.isArray(rows) ? rows.filter(member => {
    // Filter by search term
    const matchesSearch = member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filter by status
    const matchesFilter = filterStatus === 'All' || member.status === filterStatus
    
    return matchesSearch && matchesFilter
  }) : []

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
        {/* Filter Dropdown */}
        <div className="filter-dropdown" style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '12px 16px',
              background: '#ff6b35',
              border: 'none',
              borderRadius: '10px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#e55a2b'}
            onMouseLeave={(e) => e.target.style.background = '#ff6b35'}
          >
            <Filter size={16} /> 
            {filterStatus === 'All' ? 'Filter' : filterStatus}
            <ChevronDown size={14} style={{
              transform: showFilterDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }} />
          </button>
          
          {showFilterDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              background: '#2d2d2d',
              border: '1px solid #404040',
              borderRadius: '10px',
              minWidth: '180px',
              zIndex: 1000,
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}>
              {['All', 'Active', 'Near Expiry', 'Expired'].map(status => (
                <button
                  key={status}
                  onClick={() => {
                    setFilterStatus(status)
                    setShowFilterDropdown(false)
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: filterStatus === status ? '#ff6b3520' : 'transparent',
                    border: 'none',
                    borderRadius: status === 'All' ? '10px 10px 0 0' : 
                              status === 'Expired' ? '0 0 10px 10px' : '0',
                    color: filterStatus === status ? '#ff6b35' : '#ffffff',
                    fontSize: '14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (filterStatus !== status) {
                      e.target.style.background = '#404040'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (filterStatus !== status) {
                      e.target.style.background = 'transparent'
                    }
                  }}
                >
                  {status}
                  {status !== 'All' && (
                    <span style={{
                      float: 'right',
                      color: '#a0a0a0',
                      fontSize: '12px'
                    }}>
                      {rows.filter(m => m.status === status).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
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
                      <span style={{
                        ...getStatusBadgeStyle(m.status),
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {m.status}
                      </span>
                    </td>
                    <td style={{ color: '#a0a0a0' }}>
                      {m.subscription_end ? new Date(m.subscription_end).toLocaleDateString() : '-'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button 
                          onClick={() => handleEdit(m)}
                          style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            color: '#10b981',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                          title="Edit member"
                          onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(16, 185, 129, 0.2)'
                            e.target.style.borderColor = 'rgba(16, 185, 129, 0.5)'
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(16, 185, 129, 0.1)'
                            e.target.style.borderColor = 'rgba(16, 185, 129, 0.3)'
                          }}
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button 
                          onClick={() => remove(m.id)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                          title="Delete member"
                          onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(239, 68, 68, 0.2)'
                            e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)'
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(239, 68, 68, 0.1)'
                            e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)'
                          }}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
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
                    <span style={{
                      ...getStatusBadgeStyle(m.status),
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '500',
                      textTransform: 'capitalize',
                      whiteSpace: 'nowrap'
                    }}>
                      {m.status}
                    </span>
                    
                    {/* Edit button */}
                    <button 
                      onClick={() => handleEdit(m)}
                      style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
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
                      title="Edit member"
                    >
                      <Edit size={14} />
                    </button>
                    
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

      {/* Member Edit Modal */}
      <MemberEditModal
        isOpen={showEditModal}
        member={editingMember}
        onClose={() => {
          setShowEditModal(false)
          setEditingMember(null)
        }}
        onUpdate={handleMemberUpdate}
      />
    </div>
  )
}
