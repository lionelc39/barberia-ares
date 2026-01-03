'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ConfirmEmail() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        console.log('🔐 Iniciando confirmación de email...')
        
        // ✅ PASO 1: Extraer tokens del hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')

        console.log('📋 Tokens recibidos:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          type
        })

        if (!accessToken || !refreshToken) {
          throw new Error('Tokens de confirmación no encontrados en la URL')
        }

        // ✅ PASO 2: Establecer sesión manualmente con los tokens
        console.log('🔄 Estableciendo sesión con tokens...')
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        })

        if (sessionError) {
          console.error('❌ Error al establecer sesión:', sessionError)
          throw sessionError
        }

        if (!sessionData.session) {
          throw new Error('No se pudo establecer la sesión')
        }

        console.log('✅ Sesión establecida correctamente:', sessionData.session.user.email)

        // ✅ PASO 3: Verificar que el usuario esté confirmado
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('❌ Error al obtener usuario:', userError)
          throw userError
        }

        if (!user) {
          throw new Error('Usuario no encontrado después de confirmar')
        }

        console.log('✅ Usuario confirmado:', {
          email: user.email,
          confirmed: user.email_confirmed_at ? 'Sí' : 'No',
          id: user.id
        })

        // ✅ PASO 4: Dar tiempo para que persista la sesión
        console.log('⏳ Esperando persistencia de sesión...')
        await new Promise(resolve => setTimeout(resolve, 1000))

        // ✅ PASO 5: Verificar nuevamente que la sesión esté guardada
        const { data: { session: finalSession } } = await supabase.auth.getSession()
        
        if (!finalSession) {
          console.warn('⚠️ Sesión no persiste, intentando refrescar...')
          await supabase.auth.refreshSession()
          await new Promise(resolve => setTimeout(resolve, 500))
        }

        console.log('✅ Confirmación completa, redirigiendo...')
        setLoading(false)
        
        // ✅ PASO 6: Redirigir a la página de reserva (ya está autenticado)
        setTimeout(() => {
          router.push('/reserva?email_confirmed=true')
        }, 1500)

      } catch (err: any) {
        console.error('💥 Error en confirmación:', err)
        setError(err.message || 'Error al confirmar el email')
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
            <a href="/register" className="btn-fresha btn-primary-fresha" style={{ marginRight: '0.5rem' }}>
              Volver a registro
            </a>
            <a href="/login" className="btn-fresha btn-secondary-fresha">
              Ir a login
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
              Redirigiendo para que reserves tu turno...
            </p>
          </>
        )}
      </div>
    </div>
  )
}
