import React, { useState } from 'react'
import api from '../services/api.js'
import toast from 'react-hot-toast'

export default function Scanner() {
  const [token, setToken] = useState('')
  const [result, setResult] = useState(null)

  const verify = async () => {
    try {
      const { data } = await api.post('/api/access/verify', { token })
      setResult(data)
      toast.success('Verified')
    } catch (e) {
      setResult(null)
      toast.error(e.response?.data?.detail || 'Verification failed')
    }
  }

  return (
    <div className="card">
      <h2 style={{marginBottom:12}}>Access Scanner</h2>
      <div style={{display:'flex', gap:10, flexWrap: 'wrap'}}>
        <input className="input" placeholder="Paste QR token" value={token} onChange={e=>setToken(e.target.value)} style={{flex: '1', minWidth: '200px'}} />
        <button className="btn btn-primary" onClick={verify}>Verify</button>
      </div>
      <div style={{marginTop:16}}>
        {result ? <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(result, null, 2)}</pre> : <i>No result</i>}
      </div>
    </div>
  )
}
