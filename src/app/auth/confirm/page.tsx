'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ConfirmEmail() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Supabase maneja la confirmación automáticamente a través de la URL
        // Solo necesitamos verificar si hay un token hash en la URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')

        if (accessToken && type === 'signup') {
          // El email fue confirmado exitosamente
          setLoading(false)
          setTimeout(() => {
            router.push('/login?confirmed=true')
          }, 2000)
        } else {
          // Si no hay tokens, verificamos si ya está autenticado
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            setLoading(false)
            setTimeout(() => {
              router.push('/reserva')
            }, 2000)
          } else {
            setError('Link de confirmación inválido o expirado')
            setLoading(false)
          }
        }
      } catch (err) {
        console.error('Error:', err)
        setError('Ocurrió un error al confirmar tu email')
        setLoading(false)
      }
    }

    confirmEmail()
  }, [router])

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
        {loading ? (
          <>
            <div className="spinner" style={{ 
              width: '40px', 
              height: '40px', 
              margin: '0 auto 2rem',
              borderWidth: '3px'
            }}></div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-dark)' }}>
              Confirmando tu email...
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Espera un momento mientras verificamos tu cuenta
            </p>
          </>
        ) : error ? (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#dc2626' }}>
              Error de confirmación
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              {error}
            </p>
            <a href="/register" className="btn-fresha btn-primary-fresha">
              Volver a registro
            </a>
            <a href="/login" className="btn-fresha btn-secondary-fresha" style={{ marginLeft: '1rem' }}>
              Ir a iniciar sesión
            </a>
          </>
        ) : (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--primary)' }}>
              ¡Email confirmado!
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Tu cuenta ha sido verificada exitosamente
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Redirigiendo al login...
            </p>
          </>
        )}
      </div>
    </div>
  )
}