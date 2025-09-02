import React, { useEffect, useState } from 'react'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'

export default function Members() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const normalizeToArray = (payload) => {
    // Accept either an array or an object with an array property (e.g., { members: [...], count })
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.members)) return payload.members
    if (Array.isArray(payload?.data)) return payload.data
    return []
  }

  const load = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/members', { withCredentials: true })
      const list = normalizeToArray(res?.data)
      setRows(list)
    } catch (e) {
      console.error(e)
      toast.error('Failed to load members')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const remove = async (id) => {
    if (!confirm('Delete this member?')) return
    try {
      await api.delete(`/api/members/${id}`, { withCredentials: true })
      setRows(prev => prev.filter(r => r.id !== id))
      toast.success('Deleted')
    } catch (e) {
      console.error(e)
      toast.error('Delete failed')
    }
  }

  return (
    <div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
        <h2>Members</h2>
        <Link to="/add-member" className="btn btn-primary"><Plus size={16}/> Add</Link>
      </div>
      <div className="card">
        {loading ? 'Loading…' : rows.length === 0 ? (
          <div>No members yet.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Type</th><th>Status</th><th>Expires</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(m => (
                <tr key={m.id}>
                  <td>{m.full_name}</td>
                  <td>{m.email}</td>
                  <td>{m.membership_type}</td>
                  <td>{m.is_active ? <span className="badge badge-ok">Active</span> : <span className="badge badge-bad">Inactive</span>}</td>
                  <td>{m.subscription_end ? new Date(m.subscription_end).toLocaleDateString() : '-'}</td>
                  <td><button className="btn btn-danger" onClick={() => remove(m.id)}><Trash2 size={14}/> Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
              }

