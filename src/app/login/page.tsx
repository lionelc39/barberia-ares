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

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      console.log('🔐 Intentando login con:', form.email)
      
      // 1. Hacer login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ 
        email: form.email, 
        password: form.password 
      })
      
      if (authError) {
        console.error('❌ Error de auth:', authError)
        setError(authError.message === 'Invalid login credentials' 
          ? 'Email o contraseña incorrectos' 
          : authError.message)
        setLoading(false)
        return 
      }

      console.log('✅ Login exitoso, usuario:', authData.user?.email)

      // 2. Verificar si es barbero
      const { data: barbero, error: barberoError } = await supabase
        .from('barberos')
        .select('*')
        .eq('email', form.email)
        .eq('activo', true)
        .maybeSingle()

      console.log('👤 Resultado búsqueda barbero:', barbero ? `Es barbero: ${barbero.nombre}` : 'Es cliente')

      if (barberoError) {
        console.error('⚠️ Error al buscar barbero:', barberoError)
      }

      // 3. Pequeña pausa para asegurar que la sesión se guardó
      await new Promise(resolve => setTimeout(resolve, 300))

      // 4. Redirigir según rol
      if (barbero) {
        console.log('➡️ Redirigiendo a /barbero')
        router.push('/barbero')
      } else {
        console.log('➡️ Redirigiendo a /reserva')
        router.push('/reserva')
      }

    } catch (err) {
      console.error('💥 Error inesperado:', err)
      setError('Ocurrió un error al iniciar sesión')
      setLoading(false)
    }
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <button 
              type="submit"
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

          {/* Acceso Admin */}
          <div style={{ 
            marginTop: '2rem', 
            paddingTop: '1.5rem', 
            borderTop: '1px solid var(--border)',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              ¿Eres administrador?
            </p>
            <Link 
              href="/admin" 
              style={{ 
                color: 'var(--primary)', 
                fontSize: '0.9rem',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              🔧 Acceder al panel admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
