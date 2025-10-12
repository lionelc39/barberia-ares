'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Register() {
  const [form, setForm] = useState({ nombre:'', apellido:'', dni:'', email:'', whatsapp:'', password:'' })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handle = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    // guarda cliente y registra en auth
    await supabase.from('clientes').insert([{ nombre: form.nombre, apellido: form.apellido, dni: form.dni, email: form.email, whatsapp: form.whatsapp }])
    const { error } = await supabase.auth.signUp({ email: form.email, password: form.password })
    if (error) alert(error.message)
    else { alert('Registrado, revisá tu email.'); router.push('/login') }
    setLoading(false)
  }

  return (
    <div className="card max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Registro</h2>
      <form onSubmit={handle} className="space-y-3">
        <input required placeholder="Nombre" value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})} className="w-full p-2 border rounded" />
        <input required placeholder="Apellido" value={form.apellido} onChange={e=>setForm({...form, apellido:e.target.value})} className="w-full p-2 border rounded" />
        <input required placeholder="DNI" value={form.dni} onChange={e=>setForm({...form, dni:e.target.value})} className="w-full p-2 border rounded" />
        <input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="w-full p-2 border rounded" />
        <input required placeholder="WhatsApp" value={form.whatsapp} onChange={e=>setForm({...form, whatsapp:e.target.value})} className="w-full p-2 border rounded" />
        <input required type="password" minLength={6} placeholder="Contraseña" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} className="w-full p-2 border rounded" />
        <button className="btn-primary bg-black text-white w-full py-2 rounded" disabled={loading}>{loading ? '...' : 'Registrarse'}</button>
      </form>
      <p className="mt-3 text-sm">¿Ya tenés cuenta? <Link href="/login" className="text-yellow-400">Iniciá sesión</Link></p>
    </div>
  )
}
