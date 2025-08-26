import React, { useEffect, useState } from 'react'
import api from '../services/api.js'
import { Users, UserCheck, UserX, Calendar, Dumbbell, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({ total_members:0, active_members:0, expired_members:0, this_month_joins:0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/api/dashboard/stats')
        setStats(data)
      } catch {}
      finally { setLoading(false) }
    })()
  }, [])

  const Card = ({title, value, icon:Icon, color, subtitle}) => (
    <div className="metric-card">
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: '16px'}}>
        <div>
          <div className="metric-title">{title}</div>
          <div className="metric-value" style={{color}}>{loading ? '—' : value}</div>
          {subtitle && (
            <div style={{color: '#a0a0a0', fontSize: '13px', marginTop: '4px'}}>
              {subtitle}
            </div>
          )}
        </div>
        <div style={{
          background: `${color}20`,
          padding: '16px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={28} color={color}/>
        </div>
      </div>
    </div>
  )

  const ActivityChart = () => (
    <div className="card" style={{ marginTop: '32px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ color: '#ffffff', marginBottom: '8px' }}>Activity</h3>
      </div>
      
      {/* Feature Coming Soon Message */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center'
      }}>
        <div>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>🔧</div>
          <h3 style={{ 
            color: '#ffffff', 
            marginBottom: '8px',
            fontSize: '24px',
            fontWeight: 600
          }}>
            Feature Coming Soon
          </h3>
          <p style={{ 
            color: '#a0a0a0', 
            fontSize: '16px',
            margin: 0
          }}>
            Activity tracking and analytics will be available in the next update.
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: '1400px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          color: '#ffffff', 
          fontSize: '32px', 
          fontWeight: 700,
          marginBottom: '8px'
        }}>
          Dashboard
        </h1>
        <p style={{ color: '#a0a0a0', fontSize: '16px', margin: 0 }}>
          Estatistics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid dashboard-stats-grid" style={{
        gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',
        marginBottom: '32px'
      }}>
        <Card 
          title="Employers" 
          value="Coming Soon" 
          icon={Users} 
          color="#ff6b35"
          subtitle="Feature Coming Soon"
        />
        <Card 
          title="Customers" 
          value={stats.total_members} 
          icon={UserCheck} 
          color="#ff6b35"
          subtitle="Total members"
        />
        <Card 
          title="Equipment" 
          value="Coming Soon" 
          icon={Dumbbell} 
          color="#ff6b35"
          subtitle="Feature Coming Soon"
        />
        <Card 
          title="Classes" 
          value="Coming Soon" 
          icon={Calendar} 
          color="#ff6b35"
          subtitle="Feature Coming Soon"
        />
      </div>

      {/* Activity Chart */}
      <ActivityChart />
    </div>
  )
}
