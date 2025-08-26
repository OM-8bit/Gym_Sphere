import React, { useEffect, useState } from 'react'
import api from '../services/api.js'

export default function AccessLogs() {
  const [rows, setRows] = useState([])

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/api/access/logs')
        setRows(data)
      } catch {}
    })()
  }, [])

  return (
    <div className="card">
      <h2 style={{marginBottom:12}}>Access Logs</h2>
      <table className="table responsive-table">
        <thead><tr><th>Time</th><th>Member</th><th>Status</th><th>Method</th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{new Date(r.timestamp).toLocaleString()}</td>
              <td>{r.member_name || r.member_id}</td>
              <td>{r.status}</td>
              <td>{r.method}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile card view alternative */}
      <div className="responsive-card-list" style={{ display: 'none' }}>
        {rows.map((r, i) => (
          <div key={i} className="table-card">
            <div className="table-card-row">
              <strong>Time:</strong> {new Date(r.timestamp).toLocaleString()}
            </div>
            <div className="table-card-row">
              <strong>Member:</strong> {r.member_name || r.member_id}
            </div>
            <div className="table-card-row">
              <strong>Status:</strong> {r.status}
            </div>
            <div className="table-card-row">
              <strong>Method:</strong> {r.method}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
