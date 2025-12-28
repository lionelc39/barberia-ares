'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ResetPassword() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [validatingToken, setValidatingToken] = useState(true)

  useEffect(() => {
    // Verificar si hay un token válido en la URL
    const checkToken = async () => {
      try {
        // Supabase maneja el token automáticamente del hash
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Error al verificar token:', error)
          setError('Link de recuperación inválido o expirado. Solicita uno nuevo.')
          setValidatingToken(false)
          return
        }

        if (!session) {
          setError('Link de recuperación inválido o expirado. Solicita uno nuevo.')
          setValidatingToken(false)
          return
        }

        console.log('✅ Token válido, usuario puede cambiar contraseña')
        setValidatingToken(false)
      } catch (err) {
        console.error('💥 Error:', err)
        setError('Ocurrió un error al validar el link')
        setValidatingToken(false)
      }
    }

    checkToken()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validaciones
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    try {
      console.log('🔐 Actualizando contraseña...')

      // Actualizar contraseña
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        console.error('❌ Error al actualizar:', updateError)
        throw updateError
      }

      console.log('✅ Contraseña actualizada exitosamente:', data)
      setSuccess(true)
      setLoading(false)

      // Cerrar sesión después de cambiar password (buena práctica)
      console.log('🔐 Cerrando sesión automática...')
      await supabase.auth.signOut()

      // Redirigir después de 2 segundos
      setTimeout(() => {
        console.log('➡️ Redirigiendo a login...')
        window.location.href = '/login?password_updated=true'
      }, 2000)

    } catch (err: any) {
      console.error('💥 Error:', err)
      
      // Mensajes de error más específicos
      let mensajeError = 'Error al actualizar la contraseña'
      
      if (err.message?.includes('session')) {
        mensajeError = 'Tu sesión expiró. Solicita un nuevo link de recuperación.'
      } else if (err.message?.includes('weak')) {
        mensajeError = 'La contraseña es muy débil. Intenta con una más segura.'
      } else if (err.message) {
        mensajeError = err.message
      }
      
      setError(mensajeError)
      setLoading(false)
    }
  }

  if (validatingToken) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'var(--bg-light)', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div className="spinner" style={{ 
            width: '40px', 
            height: '40px', 
            margin: '0 auto 2rem',
            borderWidth: '3px'
          }}></div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-dark)' }}>
            Validando link...
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Por favor espera un momento
          </p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'var(--bg-light)', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--primary)' }}>
            ¡Contraseña actualizada!
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Tu contraseña ha sido cambiada exitosamente
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Redirigiendo al login...
          </p>
        </div>
      </div>
    )
  }

  if (error && !validatingToken) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'var(--bg-light)', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#dc2626' }}>
            Error de validación
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            {error}
          </p>
          <a href="/login" className="btn-fresha btn-primary-fresha" style={{ display: 'inline-block', textDecoration: 'none' }}>
            Volver a login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-light)', 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div className="container" style={{ maxWidth: '500px' }}>
        <div style={{ 
          background: 'white', 
          padding: '2.5rem', 
          borderRadius: '12px', 
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔑</div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
              Nueva contraseña
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Ingresa tu nueva contraseña para tu cuenta
            </p>
          </div>

          {error && (
            <div className="alert-fresha alert-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Nueva contraseña</label>
              <input 
                required 
                type="password" 
                placeholder="Mínimo 6 caracteres" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="input-fresha"
                disabled={loading}
                minLength={6}
                autoComplete="new-password"
              />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                La contraseña debe tener al menos 6 caracteres
              </p>
            </div>

            <div className="input-group">
              <label className="input-label">Confirmar contraseña</label>
              <input 
                required 
                type="password" 
                placeholder="Repite tu contraseña" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)}
                className="input-fresha"
                disabled={loading}
                minLength={6}
                autoComplete="new-password"
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
                  Actualizando...
                </span>
              ) : (
                'Cambiar contraseña'
              )}
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            ¿Link expirado?{' '}
            <a href="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
              Solicitar uno nuevo
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
