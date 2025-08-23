import React, { useEffect, useState } from 'react'
import api from '../services/api.js'
import { Users, UserCheck, UserX, Calendar } from 'lucide-react'

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

  const Card = ({title, value, icon:Icon, color}) => (
    <div className="card">
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div>
          <div style={{color:'#6b7280'}}>{title}</div>
          <div style={{fontSize:28, fontWeight:800, color}}>{loading?'…':value}</div>
        </div>
        <Icon size={42} color={color}/>
      </div>
    </div>
  )

  return (
    <div>
      <h2 style={{marginBottom:12}}>Dashboard</h2>
      <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))'}}>
        <Card title="Total Members" value={stats.total_members} icon={Users} color="#2563eb"/>
        <Card title="Active Members" value={stats.active_members} icon={UserCheck} color="#16a34a"/>
        <Card title="Expired Members" value={stats.expired_members} icon={UserX} color="#ef4444"/>
        <Card title="Joins This Month" value={stats.this_month_joins} icon={Calendar} color="#7c3aed"/>
      </div>
    </div>
  )
}
