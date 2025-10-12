'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [form, setForm] = useState({ email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handle = async (e:any) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
    if (error) alert(error.message)
    else router.push('/reserva')
    setLoading(false)
  }

  return (
    <div className="card max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Iniciar sesión</h2>
      <form onSubmit={handle} className="space-y-3">
        <input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="w-full p-2 border rounded" />
        <input required type="password" placeholder="Contraseña" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} className="w-full p-2 border rounded" />
        <button className="btn-primary bg-black text-white w-full py-2 rounded" disabled={loading}>{loading ? '...' : 'Entrar'}</button>
      </form>
      <p className="mt-3 text-sm">¿Nuevo? <Link href="/register" className="text-yellow-400">Registrate</Link></p>
    </div>
  )
}
