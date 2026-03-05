import React, { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'
import api from '../services/api.js'
import toast from 'react-hot-toast'

export default function AccessLogs() {
  const [months, setMonths] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedMonths, setExpandedMonths] = useState(new Set())
  const [expandedDates, setExpandedDates] = useState(new Set())

  useEffect(() => {
    fetchAccessLogs()
  }, [])

  const fetchAccessLogs = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/api/access/logs')
      setMonths(data.months || [])
      
      // Auto-expand first month
      if (data.months && data.months.length > 0) {
        setExpandedMonths(new Set([data.months[0].month_key]))
      }
    } catch (error) {
      console.error('Failed to fetch access logs:', error)
      toast.error('Failed to load access logs')
      setMonths([])
    } finally {
      setLoading(false)
    }
  }

  const toggleMonth = (monthKey) => {
    setExpandedMonths(prev => {
      const newSet = new Set(prev)
      if (newSet.has(monthKey)) {
        newSet.delete(monthKey)
        // Also collapse all dates in this month
        setExpandedDates(prevDates => {
          const newDatesSet = new Set(prevDates)
          months.find(m => m.month_key === monthKey)?.dates.forEach(d => {
            newDatesSet.delete(d.date_key)
          })
          return newDatesSet
        })
      } else {
        newSet.add(monthKey)
      }
      return newSet
    })
  }

  const toggleDate = (dateKey) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev)
      if (newSet.has(dateKey)) {
        newSet.delete(dateKey)
      } else {
        newSet.add(dateKey)
      }
      return newSet
    })
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2 style={{ color: '#ffffff', marginBottom: '20px' }}>Loading Access Logs...</h2>
        <div style={{ color: '#a0a0a0' }}>Please wait...</div>
      </div>
    )
  }

  if (months.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
        <h2 style={{ color: '#ffffff', marginBottom: '12px' }}>No Access Logs Yet</h2>
        <p style={{ color: '#a0a0a0', fontSize: '16px', margin: 0 }}>
          Access logs will appear here once members start using the gym
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          color: '#ffffff', 
          fontSize: 'clamp(24px, 5vw, 32px)', 
          fontWeight: 700,
          marginBottom: '8px'
        }}>
          Access Logs
        </h1>
        <p style={{ 
          color: '#a0a0a0', 
          fontSize: 'clamp(14px, 3vw, 16px)', 
          margin: 0 
        }}>
          Complete history of gym access attempts
        </p>
      </div>

      {/* Month Accordions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {months.map((month) => (
          <div key={month.month_key} className="card" style={{ 
            padding: 0, 
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}>
            {/* Month Header */}
            <button
              onClick={() => toggleMonth(month.month_key)}
              style={{
                width: '100%',
                background: expandedMonths.has(month.month_key) ? '#2a2a2a' : 'transparent',
                border: 'none',
                padding: 'clamp(16px, 3vw, 20px)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease',
                borderBottom: expandedMonths.has(month.month_key) ? '1px solid #404040' : 'none'
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'clamp(12px, 2vw, 16px)',
                flex: 1
              }}>
                {expandedMonths.has(month.month_key) ? (
                  <ChevronDown size={20} color="#ff6b35" />
                ) : (
                  <ChevronRight size={20} color="#a0a0a0" />
                )}
                
                <Calendar size={20} color="#ff6b35" />
                
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <h3 style={{ 
                    color: '#ffffff', 
                    fontSize: 'clamp(16px, 3.5vw, 20px)', 
                    fontWeight: '600',
                    margin: 0
                  }}>
                    {month.month_name}
                  </h3>
                  <p style={{ 
                    color: '#a0a0a0', 
                    fontSize: 'clamp(12px, 2.5vw, 14px)', 
                    margin: '4px 0 0 0' 
                  }}>
                    {month.total_entries} {month.total_entries === 1 ? 'entry' : 'entries'}
                  </p>
                </div>
              </div>

              {/* Month Stats */}
              <div style={{ 
                display: 'flex', 
                gap: 'clamp(12px, 2vw, 20px)', 
                alignItems: 'center',
                marginLeft: '16px'
              }} className="month-stats">
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '6px 12px',
                  borderRadius: '8px'
                }}>
                  <CheckCircle size={14} color="#10b981" />
                  <span style={{ 
                    color: '#10b981', 
                    fontWeight: '600',
                    fontSize: 'clamp(12px, 2.5vw, 14px)'
                  }}>
                    {month.successful_entries}
                  </span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  padding: '6px 12px',
                  borderRadius: '8px'
                }}>
                  <XCircle size={14} color="#ef4444" />
                  <span style={{ 
                    color: '#ef4444', 
                    fontWeight: '600',
                    fontSize: 'clamp(12px, 2.5vw, 14px)'
                  }}>
                    {month.failed_entries}
                  </span>
                </div>
              </div>
            </button>

            {/* Date Accordions */}
            {expandedMonths.has(month.month_key) && (
              <div style={{ padding: 'clamp(12px, 2vw, 16px)' }}>
                {month.dates.map((date) => (
                  <div key={date.date_key} style={{ 
                    marginBottom: '12px',
                    background: '#2a2a2a',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #404040'
                  }}>
                    {/* Date Header */}
                    <button
                      onClick={() => toggleDate(date.date_key)}
                      style={{
                        width: '100%',
                        background: expandedDates.has(date.date_key) ? '#3a3a3a' : 'transparent',
                        border: 'none',
                        padding: 'clamp(12px, 2.5vw, 16px)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 'clamp(8px, 2vw, 12px)',
                        flex: 1
                      }}>
                        {expandedDates.has(date.date_key) ? (
                          <ChevronDown size={16} color="#3b82f6" />
                        ) : (
                          <ChevronRight size={16} color="#a0a0a0" />
                        )}
                        
                        <div style={{ textAlign: 'left', flex: 1 }}>
                          <h4 style={{ 
                            color: '#ffffff', 
                            fontSize: 'clamp(14px, 3vw, 16px)', 
                            fontWeight: '600',
                            margin: 0
                          }}>
                            Access Logs - {date.date_name}
                          </h4>
                        </div>
                      </div>

                      {/* Date Stats */}
                      <div style={{ 
                        display: 'flex', 
                        gap: 'clamp(8px, 2vw, 12px)', 
                        alignItems: 'center',
                        marginLeft: '12px'
                      }} className="date-stats">
                        <span style={{ 
                          color: '#a0a0a0', 
                          fontSize: 'clamp(12px, 2.5vw, 14px)',
                          fontWeight: '600'
                        }}>
                          Total: {date.total_entries}
                        </span>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px'
                        }}>
                          <CheckCircle size={12} color="#10b981" />
                          <span style={{ 
                            color: '#10b981', 
                            fontSize: 'clamp(11px, 2vw, 13px)',
                            fontWeight: '600'
                          }}>
                            {date.successful_entries}
                          </span>
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px'
                        }}>
                          <XCircle size={12} color="#ef4444" />
                          <span style={{ 
                            color: '#ef4444', 
                            fontSize: 'clamp(11px, 2vw, 13px)',
                            fontWeight: '600'
                          }}>
                            {date.failed_entries}
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Log Entries */}
                    {expandedDates.has(date.date_key) && (
                      <div style={{ 
                        padding: 'clamp(12px, 2.5vw, 16px)',
                        borderTop: '1px solid #404040'
                      }}>
                        {date.logs.length === 0 ? (
                          <p style={{ 
                            color: '#a0a0a0', 
                            textAlign: 'center', 
                            padding: '20px',
                            fontSize: 'clamp(12px, 2.5vw, 14px)'
                          }}>
                            No entries for this date
                          </p>
                        ) : (
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '8px' 
                          }}>
                            {date.logs.map((log, idx) => (
                              <div key={idx} style={{
                                background: '#1a1a1a',
                                borderRadius: '8px',
                                padding: 'clamp(10px, 2vw, 12px)',
                                border: `1px solid ${log.access_granted ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'clamp(10px, 2vw, 12px)',
                                flexWrap: 'wrap'
                              }}>
                                {/* Status Icon */}
                                <div style={{ flexShrink: 0 }}>
                                  {log.access_granted ? (
                                    <CheckCircle size={16} color="#10b981" />
                                  ) : (
                                    <XCircle size={16} color="#ef4444" />
                                  )}
                                </div>

                                {/* Member Info */}
                                <div style={{ flex: '1 1 200px', minWidth: '150px' }}>
                                  <p style={{ 
                                    color: '#ffffff', 
                                    fontSize: 'clamp(13px, 2.5vw, 14px)', 
                                    fontWeight: '600',
                                    margin: 0
                                  }}>
                                    {log.member_name || 'Unknown'}
                                  </p>
                                  {log.card_number && (
                                    <p style={{ 
                                      color: '#a0a0a0', 
                                      fontSize: 'clamp(11px, 2vw, 12px)', 
                                      margin: '2px 0 0 0' 
                                    }}>
                                      Card: {log.card_number}
                                    </p>
                                  )}
                                </div>

                                {/* Time */}
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '6px',
                                  flexShrink: 0
                                }}>
                                  <Clock size={14} color="#a0a0a0" />
                                  <span style={{ 
                                    color: '#a0a0a0', 
                                    fontSize: 'clamp(11px, 2vw, 12px)' 
                                  }}>
                                    {formatTime(log.timestamp)}
                                  </span>
                                </div>

                                {/* Status Badge */}
                                <div style={{
                                  background: log.access_granted ? 
                                    'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                  color: log.access_granted ? '#10b981' : '#ef4444',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  fontSize: 'clamp(11px, 2vw, 12px)',
                                  fontWeight: '600',
                                  flexShrink: 0
                                }}>
                                  {log.access_granted ? 'Granted' : 'Denied'}
                                </div>

                                {/* Failure Reason */}
                                {!log.access_granted && log.failure_reason && (
                                  <div style={{ 
                                    width: '100%',
                                    marginTop: '4px',
                                    paddingTop: '8px',
                                    borderTop: '1px solid #404040'
                                  }}>
                                    <p style={{ 
                                      color: '#ef4444', 
                                      fontSize: 'clamp(11px, 2vw, 12px)',
                                      margin: 0
                                    }}>
                                      Reason: {log.failure_reason}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
