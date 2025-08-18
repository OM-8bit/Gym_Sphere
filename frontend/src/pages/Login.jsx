import React, { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ email:'', password:'', full_name:'', gym_name:'' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const { data } = await api.post(url, form)
      if (mode === 'login') {
        login(data)
        toast.success('Welcome!')
        window.location.href = '/'
      } else {
        toast.success('Registered! Please sign in.')
        setMode('login')
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <div style={{minHeight:'100vh', display:'grid', placeItems:'center', background:'linear-gradient(135deg,#6366f1,#2563eb)'}}>
      <div style={{ background:'#fff', borderRadius:10, padding:24, width:400, maxWidth:'92vw', boxShadow:'0 10px 30px rgba(0,0,0,.15)' }}>
        <h2 style={{marginBottom:4}}>GymSphere</h2>
        <div style={{color:'#6b7280', marginBottom:16}}>{mode==='login'?'Sign in':'Create account'}</div>

        <form onSubmit={submit}>
          {mode==='register' && (
            <>
              <label className="label">Full Name</label>
              <input className="input" value={form.full_name} onChange={set('full_name')} required />
              <label className="label" style={{marginTop:8}}>Gym Name (optional)</label>
              <input className="input" value={form.gym_name} onChange={set('gym_name')} />
            </>
          )}

          <label className="label" style={{marginTop:8}}>Email</label>
          <input className="input" type="email" value={form.email} onChange={set('email')} required />

          <label className="label" style={{marginTop:8}}>Password</label>
          <input className="input" type="password" value={form.password} onChange={set('password')} required />

          <button className="btn btn-primary" style={{width:'100%', marginTop:12}} disabled={loading}>
            {loading ? 'Please wait…' : (mode==='login' ? 'Sign In' : 'Create Account')}
          </button>

          <div style={{textAlign:'center', marginTop:10}}>
            {mode==='login' ? "Don't have an account?" : 'Have an account?'}{' '}
            <button type="button" onClick={()=>setMode(mode==='login'?'register':'login')} style={{border:'none', background:'none', color:'#2563eb', cursor:'pointer', textDecoration:'underline'}}>
              {mode==='login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
