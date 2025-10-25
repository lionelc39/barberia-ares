'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handle = async (e: any) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    const { error } = await supabase.auth.signInWithPassword({ 
      email: form.email, 
      password: form.password 
    })
    
    if (error) { 
      setError(error.message)
      setLoading(false)
      return 
    }
    
    setLoading(false)
    router.push('/reserva')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-light)', display: 'flex', alignItems: 'center', padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: '500px' }}>
        <div style={{ 
          background: 'white', 
          padding: '2.5rem', 
          borderRadius: '12px', 
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
              Iniciar sesión
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Ingresa a tu cuenta para reservar turnos
            </p>
          </div>

          {error && (
            <div className="alert-fresha alert-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handle}>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input 
                required 
                type="email" 
                placeholder="tu@email.com" 
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})} 
                className="input-fresha"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Contraseña</label>
              <input 
                required 
                type="password" 
                placeholder="Tu contraseña" 
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})} 
                className="input-fresha"
              />
            </div>

            <button 
              disabled={loading} 
              className="btn-fresha btn-primary-fresha" 
              style={{ width: '100%', padding: '1rem' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <div className="spinner"></div>
                  Ingresando...
                </span>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            ¿No tienes cuenta?{' '}
            <Link href="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
