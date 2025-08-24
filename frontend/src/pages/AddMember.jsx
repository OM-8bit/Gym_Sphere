import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.js'
import toast from 'react-hot-toast'

export default function AddMember() {
  const nav = useNavigate()
  const [form, setForm] = useState({ full_name:'', email:'', phone:'', membership_type:'monthly', card_id:'' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/api/members', form)
      toast.success('Member added')
      nav('/members')
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed')
    } finally { setLoading(false) }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <div className="card" style={{maxWidth:640}}>
      <h2 style={{marginBottom:12}}>Add Member</h2>
      <form onSubmit={submit} className="grid" style={{gridTemplateColumns:'repeat(2,minmax(0,1fr))', gap:16}}>
        <div><label className="label">Full Name</label><input className="input" value={form.full_name} onChange={set('full_name')} required /></div>
        <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={set('email')} required /></div>
        <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={set('phone')} /></div>
        <div>
          <label className="label">Membership Type</label>
          <select className="input" value={form.membership_type} onChange={set('membership_type')}>
            <option value="monthly">Monthly</option><option value="yearly">Yearly</option>
          </select>
        </div>
        <div style={{gridColumn:'1/-1'}}><label className="label">Card ID (optional)</label><input className="input" value={form.card_id} onChange={set('card_id')} placeholder="CARD001" /></div>
        <div style={{gridColumn:'1/-1', display:'flex', gap:10}}>
          <button className="btn btn-primary" disabled={loading} type="submit">{loading?'Saving…':'Save'}</button>
          <button className="btn btn-secondary" type="button" onClick={()=>nav('/members')}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
