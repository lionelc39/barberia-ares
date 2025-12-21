'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Mostrar mensaje si la password fue actualizada
  useEffect(() => {
    if (searchParams.get('password_updated') === 'true') {
      setError('')
      setTimeout(() => {
        alert('✅ Contraseña actualizada exitosamente. Ya puedes iniciar sesión.')
      }, 100)
    }
  }, [searchParams])

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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResetLoading(true)

    try {
      console.log('📧 Enviando email de recuperación a:', resetEmail)

      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        console.error('❌ Error al enviar email:', error)
        throw error
      }

      console.log('✅ Email de recuperación enviado')
      setResetSuccess(true)
      
      // Cerrar modal después de 3 segundos
      setTimeout(() => {
        setShowResetPassword(false)
        setResetSuccess(false)
        setResetEmail('')
      }, 3000)

    } catch (err: any) {
      console.error('💥 Error:', err)
      setError('Error al enviar email de recuperación: ' + (err.message || 'Intenta nuevamente'))
    } finally {
      setResetLoading(false)
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

            <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={() => setShowResetPassword(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
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

      {/* Modal Reset Password */}
      {showResetPassword && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            {resetSuccess ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                  ¡Email enviado!
                </h3>
                <p style={{ color: 'var(--text-muted)' }}>
                  Revisa tu email para restablecer tu contraseña
                </p>
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔑</div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>
                    Recuperar contraseña
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Te enviaremos un link para restablecer tu contraseña
                  </p>
                </div>

                <form onSubmit={handleResetPassword}>
                  <div className="input-group">
                    <label className="input-label">Email</label>
                    <input
                      required
                      type="email"
                      placeholder="tu@email.com"
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      className="input-fresha"
                      disabled={resetLoading}
                      autoFocus
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowResetPassword(false)
                        setResetEmail('')
                        setError('')
                      }}
                      className="btn-fresha btn-secondary-fresha"
                      style={{ flex: 1 }}
                      disabled={resetLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn-fresha btn-primary-fresha"
                      style={{ flex: 1 }}
                      disabled={resetLoading}
                    >
                      {resetLoading ? (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                          <div className="spinner"></div>
                          Enviando...
                        </span>
                      ) : (
                        'Enviar link'
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
