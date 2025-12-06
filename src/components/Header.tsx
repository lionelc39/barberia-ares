'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isBarbero, setIsBarbero] = useState(false)
  const [loading, setLoading] = useState(true)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false) // ✅ NUEVO
  const router = useRouter()
  const pathname = usePathname()

  // Verificar sesión al montar
  useEffect(() => {
    checkUser()
  }, [])

  // ✅ CAMBIO: Solo recargar cuando cambia pathname si ya terminó carga inicial
  useEffect(() => {
    if (initialLoadComplete && pathname) {
      checkUser()
    }
  }, [pathname, initialLoadComplete])

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Verificar usuario actual
  const checkUser = async () => {
    try {
      // ✅ CAMBIO: Solo mostrar loading en la primera carga
      if (!initialLoadComplete) {
        setLoading(true)
      }
      
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('❌ Error al obtener sesión:', error)
        setUser(null)
        setIsBarbero(false)
        return
      }

      if (!session?.user) {
        setUser(null)
        setIsBarbero(false)
        return
      }

      setUser(session.user)

      // Verificar si es barbero
      const { data: barbero } = await supabase
        .from('barberos')
        .select('*')
        .eq('email', session.user.email)
        .eq('activo', true)
        .maybeSingle()

      setIsBarbero(!!barbero)
    } catch (err) {
      console.error('💥 Error en checkUser:', err)
      setUser(null)
      setIsBarbero(false)
    } finally {
      setLoading(false)
      setInitialLoadComplete(true) // ✅ NUEVO: Marcar que terminó carga inicial
    }
  }

  // Escuchar cambios de autenticación
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔵 Auth event:', event)
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await checkUser()
      } else if (event === 'SIGNED_OUT') {
        console.log('🔵 Usuario cerró sesión, limpiando estados...')
        setUser(null)
        setIsBarbero(false)
        setInitialLoadComplete(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      console.log('🔵 Cerrando sesión...')
      setLoading(true)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ Error al cerrar sesión:', error)
        alert('Error al cerrar sesión: ' + error.message)
        setLoading(false)
        return
      }

      console.log('✅ Sesión cerrada exitosamente')
      
      // Limpiar estados
      setUser(null)
      setIsBarbero(false)
      setMenuOpen(false)
      setInitialLoadComplete(false)
      
      // Redirigir al inicio
      router.push('/')
      
      // ✅ NUEVO: Forzar recarga completa de la página
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
      
    } catch (err) {
      console.error('💥 Error al cerrar sesión:', err)
      alert('Error inesperado al cerrar sesión')
      setLoading(false)
    }
  }

  return (
    <header className="header-fresha">
      <nav className="nav-fresha">
        {/* Logo */}
        <Link href="/" className="logo-fresha">
          <img src="/logo.png" alt="Barber Ares" />
          <span className="logo-text-fresha">Barber Ares</span>
        </Link>

        {/* Desktop Menu */}
        {!isMobile && (
          <div className="nav-actions-fresha">
            <Link href="/#servicios" className="nav-link-fresha">Servicios</Link>
            <Link href="/#horarios" className="nav-link-fresha">Horarios</Link>
            <Link href="/#contacto" className="nav-link-fresha">Contacto</Link>
            
            {/* ✅ CAMBIO: Solo mostrar spinner durante carga inicial */}
            {loading && !initialLoadComplete ? (
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
                  style={{ cursor: 'pointer' }}
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

        {/* Mobile Menu Button */}
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

      {/* Mobile Menu Dropdown */}
      {isMobile && menuOpen && (
        <div style={{ 
          background: 'white', 
          borderTop: '1px solid var(--border)',
          padding: '1rem 1.5rem'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link 
              href="/" 
              onClick={() => setMenuOpen(false)}
              style={{ 
                padding: '0.75rem', 
                textDecoration: 'none',
                color: 'var(--text-dark)',
                borderRadius: '8px',
                transition: 'background 0.2s'
              }}
            >
              🏠 Inicio
            </Link>
            <Link 
              href="/#servicios" 
              onClick={() => setMenuOpen(false)}
              style={{ 
                padding: '0.75rem', 
                textDecoration: 'none',
                color: 'var(--text-dark)',
                borderRadius: '8px'
              }}
            >
              ✂️ Servicios
            </Link>
            <Link 
              href="/#horarios" 
              onClick={() => setMenuOpen(false)}
              style={{ 
                padding: '0.75rem', 
                textDecoration: 'none',
                color: 'var(--text-dark)',
                borderRadius: '8px'
              }}
            >
              🕐 Horarios
            </Link>
            
            <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.5rem', paddingTop: '0.75rem' }}>
              {/* ✅ CAMBIO: Solo mostrar spinner durante carga inicial */}
              {loading && !initialLoadComplete ? (
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                  <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px', margin: '0 auto' }}></div>
                </div>
              ) : user ? (
                <>
                  {isBarbero && (
                    <Link 
                      href="/barbero"
                      onClick={() => setMenuOpen(false)}
                      className="btn-fresha btn-primary-fresha"
                      style={{ 
                        textAlign: 'center', 
                        width: '100%', 
                        marginBottom: '0.75rem',
                        display: 'block'
                      }}
                    >
                      📅 Mis Turnos
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      handleLogout()
                      setMenuOpen(false)
                    }}
                    disabled={loading}
                    className="btn-fresha btn-secondary-fresha"
                    style={{ textAlign: 'center', width: '100%' }}
                  >
                    🚪 Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    onClick={() => setMenuOpen(false)}
                    className="btn-fresha btn-secondary-fresha"
                    style={{ 
                      textAlign: 'center', 
                      width: '100%', 
                      marginBottom: '0.75rem',
                      display: 'block'
                    }}
                  >
                    👤 Iniciar sesión
                  </Link>
                  <Link 
                    href="/register" 
                    onClick={() => setMenuOpen(false)}
                    className="btn-fresha btn-primary-fresha"
                    style={{ 
                      textAlign: 'center', 
                      width: '100%',
                      display: 'block'
                    }}
                  >
                    📝 Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
