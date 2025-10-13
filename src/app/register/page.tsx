// src/app/register/page.tsx
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Register(){
  const [form, setForm] = useState({ nombre:'', apellido:'', dni:'', email:'', whatsapp:'', password:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handle = async (e:any) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true)
    // guardar en clientes y auth
    const { error:insertErr } = await supabase.from('clientes').insert([{ nombre: form.nombre, apellido: form.apellido, dni: form.dni, email: form.email, whatsapp: form.whatsapp }])
    if (insertErr) { setError(insertErr.message); setLoading(false); return }
    const { error:authErr } = await supabase.auth.signUp({ email: form.email, password: form.password })
    if (authErr) { setError(authErr.message); setLoading(false); return }
    setLoading(false)
    router.push('/login')
  }

  return (
    <div className="max-w-md mx-auto card">
      <h2 className="text-2xl font-semibold mb-4">Registro de Cliente</h2>
      {error && <div className="toast error mb-3">{error}</div>}
      <form onSubmit={handle} className="space-y-3">
        <input required placeholder="Nombre" value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})} className="w-full p-3 border rounded" />
        <input required placeholder="Apellido" value={form.apellido} onChange={e=>setForm({...form, apellido:e.target.value})} className="w-full p-3 border rounded" />
        <input required placeholder="DNI" value={form.dni} onChange={e=>setForm({...form, dni:e.target.value})} className="w-full p-3 border rounded" />
        <input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="w-full p-3 border rounded" />
        <input required placeholder="WhatsApp" value={form.whatsapp} onChange={e=>setForm({...form, whatsapp:e.target.value})} className="w-full p-3 border rounded" />
        <div>
          <input required type="password" placeholder="Contraseña" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} className="w-full p-3 border rounded" />
          <div className="text-xs text-muted mt-1">Contraseña mínima 6 caracteres</div>
        </div>
        <button disabled={loading} className="btn-primary w-full">
          {loading ? <span className="spinner" /> : 'Registrarse'}
        </button>
      </form>
      <p className="mt-3 text-sm text-muted">¿Ya tenés cuenta? <Link href="/login" className="text-black font-medium">Iniciá sesión</Link></p>
    </div>
  )
}
