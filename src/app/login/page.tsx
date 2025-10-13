// src/app/login/page.tsx
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login(){
  const [form, setForm] = useState({ email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handle = async (e:any) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
    if (error) { setError(error.message); setLoading(false); return }
    setLoading(false)
    router.push('/reserva')
  }

  return (
    <div className="max-w-md mx-auto card">
      <h2 className="text-2xl font-semibold mb-4">Iniciar sesión</h2>
      {error && <div className="toast error mb-3">{error}</div>}
      <form onSubmit={handle} className="space-y-3">
        <input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="w-full p-3 border rounded" />
        <input required type="password" placeholder="Contraseña" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} className="w-full p-3 border rounded" />
        <button disabled={loading} className="btn-primary w-full">{loading ? <span className="spinner" /> : 'Entrar'}</button>
      </form>
      <p className="mt-3 text-sm text-muted">¿Nuevo? <Link href="/register" className="text-black font-medium">Registrate</Link></p>
    </div>
  )
}
