'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isBarbero, setIsBarbero] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  
  // ✅ NUEVO: Prevenir múltiples llamadas simultáneas
  const checkingUser = useRef(false)
  const isInitialized = useRef(false)

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // ✅ MEJORADO: Verificar usuario con protección contra race conditions
  const checkUser = async () => {
    // Prevenir llamadas simultáneas
    if (checkingUser.current) {
      console.log('⏸️ checkUser ya en ejecución, omitiendo...')
      return
    }

    checkingUser.current = true
    
    try {
      setLoading(true)
      console.log('🔍 Verificando sesión...')
      
      // ✅ Dar tiempo a Supabase para procesar tokens de confirmación
      if (!isInitialized.current) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('❌ Error al obtener sesión:', error)
        setUser(null)
        setIsBarbero(false)
        return
      }

      if (!session?.user) {
        console.log('ℹ️ No hay sesión activa')
        setUser(null)
        setIsBarbero(false)
        return
      }

      console.log('✅ Usuario autenticado:', session.user.email)
      setUser(session.user)

      // Verificar si es barbero
      const { data: barbero } = await supabase
        .from('barberos')
        .select('*')
        .eq('email', session.user.email)
        .eq('activo', true)
        .maybeSingle()

      setIsBarbero(!!barbero)
      
      if (barbero) {
        console.log('💈 Usuario es barbero:', barbero.nombre)
      }
      
      isInitialized.current = true
      
    } catch (err) {
      console.error('💥 Error en checkUser:', err)
      setUser(null)
      setIsBarbero(false)
    } finally {
      setLoading(false)
      checkingUser.current = false
    }
  }

  // ✅ MEJORADO: Solo verificar al montar (eliminar dependencia de pathname)
  useEffect(() => {
    checkUser()
  }, [])

  // ✅ Escuchar cambios de autenticación (mantener)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth event:', event)
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Pequeña pausa para asegurar persistencia
        await new Promise(resolve => setTimeout(resolve, 300))
        await checkUser()
      } else if (event === 'SIGNED_OUT') {
        console.log('🚪 Usuario cerró sesión')
        setUser(null)
        setIsBarbero(false)
        isInitialized.current = false
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    if (loading || checkingUser.current) return
    
    const confirmar = confirm('¿Estás seguro que querés cerrar sesión?')
    if (!confirmar) return

    try {
      console.log('🔐 Cerrando sesión...')
      setLoading(true)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ Error al cerrar sesión:', error)
        alert('Error al cerrar sesión: ' + error.message)
        return
      }

      console.log('✅ Sesión cerrada')
      setUser(null)
      setIsBarbero(false)
      setMenuOpen(false)
      isInitialized.current = false
      
      // Forzar recarga
      window.location.href = '/'
      
    } catch (err) {
      console.error('💥 Error al cerrar sesión:', err)
      alert('Error inesperado al cerrar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <header className="header-fresha">
      <nav className="nav-fresha">
        <Link href="/" className="logo-fresha">
          <img src="/logo.png" alt="Barber Ares" />
          <span className="logo-text-fresha">Barber Ares</span>
        </Link>

        {!isMobile && (
          <div className="nav-actions-fresha">
            <Link href="/#servicios" className="nav-link-fresha">Servicios</Link>
            <Link href="/#horarios" className="nav-link-fresha">Horarios</Link>
            <Link href="/#contacto" className="nav-link-fresha">Contacto</Link>
            
            {loading ? (
              <div style={{ padding: '0.5rem' }}>
                <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
              </div>
            ) : user ? (
              <>
                {isBarbero && (
                  <Link 
                    href="/barbero" 
                    className="btn-fresha btn-primary-fresha"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    📅 Mis Turnos
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  disabled={loading}
                  className="btn-fresha btn-secondary-fresha"
                  style={{ 
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-fresha btn-secondary-fresha">
                  Iniciar sesión
                </Link>
                <Link href="/register" className="btn-fresha btn-primary-fresha">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        )}

        {isMobile && (
          <button 
            className="btn-fresha btn-secondary-fresha"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ padding: '0.5rem 1rem' }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        )}
      </nav>

      {/* Mobile Menu */}
     // ✅ REEMPLAZAR SOLO LA SECCIÓN DEL MENÚ MOBILE en src/components/Header.tsx
// (Buscar: "Mobile Menu" - línea ~180 aprox)

{/* Mobile Menu - MEJORADO */}
{isMobile && menuOpen && (
  <div style={{ 
    background: 'white', 
    borderTop: '1px solid var(--border)',
    padding: '1rem 1.5rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)' // ✅ Sombra sutil
  }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      
      {/* ===== LINKS DE NAVEGACIÓN ===== */}
      <Link 
        href="/" 
        onClick={() => setMenuOpen(false)} 
        style={{
          padding: '1rem 0.75rem',
          color: 'var(--text-dark)',
          textDecoration: 'none',
          fontSize: '0.95rem',
          fontWeight: '500',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          transition: 'background 0.2s ease'
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.background = 'var(--bg-light)'
        }}
      >
        <span style={{ fontSize: '1.25rem' }}>🏠</span>
        <span>Inicio</span>
      </Link>

      <Link 
        href="/#servicios" 
        onClick={() => setMenuOpen(false)}
        style={{
          padding: '1rem 0.75rem',
          color: 'var(--text-dark)',
          textDecoration: 'none',
          fontSize: '0.95rem',
          fontWeight: '500',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          transition: 'background 0.2s ease'
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.background = 'var(--bg-light)'
        }}
      >
        <span style={{ fontSize: '1.25rem' }}>✂️</span>
        <span>Servicios</span>
      </Link>

      <Link 
        href="/#horarios" 
        onClick={() => setMenuOpen(false)}
        style={{
          padding: '1rem 0.75rem',
          color: 'var(--text-dark)',
          textDecoration: 'none',
          fontSize: '0.95rem',
          fontWeight: '500',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          transition: 'background 0.2s ease'
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.background = 'var(--bg-light)'
        }}
      >
        <span style={{ fontSize: '1.25rem' }}>🕐</span>
        <span>Horarios</span>
      </Link>

      <Link 
        href="/#contacto" 
        onClick={() => setMenuOpen(false)}
        style={{
          padding: '1rem 0.75rem',
          color: 'var(--text-dark)',
          textDecoration: 'none',
          fontSize: '0.95rem',
          fontWeight: '500',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          transition: 'background 0.2s ease'
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.background = 'var(--bg-light)'
        }}
      >
        <span style={{ fontSize: '1.25rem' }}>📞</span>
        <span>Contacto</span>
      </Link>

      {/* ===== SECCIÓN DE AUTENTICACIÓN ===== */}
      <div style={{ 
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '2px solid var(--border)' // ✅ Border más grueso
      }}>
        {loading ? (
          <div style={{ 
            padding: '1.5rem', 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div className="spinner" style={{ width: '24px', height: '24px', margin: '0' }}></div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Cargando...
            </span>
          </div>
        ) : user ? (
          <>
            {/* Usuario logueado */}
            <div style={{
              background: 'var(--bg-light)',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>👤</span>
              <div>
                <p style={{ 
                  fontSize: '0.85rem', 
                  fontWeight: '600', 
                  color: 'var(--text-dark)',
                  marginBottom: '0.125rem'
                }}>
                  {user.email}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Sesión activa
                </p>
              </div>
            </div>

            {/* Botón Mis Turnos (solo barberos) */}
            {isBarbero && (
              <Link 
                href="/barbero"
                onClick={() => setMenuOpen(false)}
                className="btn-fresha btn-primary-fresha"
                style={{ 
                  width: '100%', 
                  marginBottom: '0.75rem', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none'
                }}
              >
                <span>📅</span>
                <span>Mis Turnos</span>
              </Link>
            )}

            {/* Botón Cerrar Sesión */}
            <button
              onClick={() => {
                handleLogout()
                setMenuOpen(false)
              }}
              disabled={loading}
              className="btn-fresha btn-secondary-fresha"
              style={{ 
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <span>🚪</span>
              <span>Cerrar sesión</span>
            </button>
          </>
        ) : (
          <>
            {/* Usuario NO logueado */}
            <Link 
              href="/login" 
              onClick={() => setMenuOpen(false)}
              className="btn-fresha btn-secondary-fresha"
              style={{ 
                width: '100%', 
                marginBottom: '0.75rem', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                textDecoration: 'none'
              }}
            >
              <span>👤</span>
              <span>Iniciar sesión</span>
            </Link>
            
            <Link 
              href="/register" 
              onClick={() => setMenuOpen(false)}
              className="btn-fresha btn-primary-fresha"
              style={{ 
                width: '100%', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                textDecoration: 'none'
              }}
            >
              <span>📝</span>
              <span>Registrarse</span>
            </Link>
          </>
        )}
      </div>
    </div>
  </div>
)}
