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
  const router = useRouter()
  const pathname = usePathname()

  // Verificar sesión cuando el componente se monta y cuando cambia la ruta
  useEffect(() => {
    console.log('🔄 Header: Verificando sesión...')
    checkUser()
  }, [pathname])

  // Escuchar cambios de tamaño de pantalla
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Función para verificar usuario
  const checkUser = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('❌ Error al obtener sesión:', error)
        setUser(null)
        setIsBarbero(false)
        setLoading(false)
        return
      }

      if (!session?.user) {
        console.log('👤 Header: No hay usuario logueado')
        setUser(null)
        setIsBarbero(false)
        setLoading(false)
        return
      }

      console.log('✅ Header: Usuario encontrado:', session.user.email)
      setUser(session.user)

      // Verificar si es barbero
      const { data: barbero, error: barberoError } = await supabase
        .from('barberos')
        .select('*')
        .eq('email', session.user.email)
        .eq('activo', true)
        .maybeSingle()

      if (barberoError) {
        console.error('⚠️ Error al verificar barbero:', barberoError)
      }

      const esBarbero = !!barbero
      console.log('👨‍💼 Header: Es barbero?', esBarbero ? `Sí (${barbero.nombre})` : 'No')
      setIsBarbero(esBarbero)
      setLoading(false)

    } catch (err) {
      console.error('💥 Error en checkUser:', err)
      setUser(null)
      setIsBarbero(false)
      setLoading(false)
    }
  }

  // Escuchar cambios de autenticación
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Header: Cambio de auth:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await checkUser()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsBarbero(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    try {
      console.log('🚪 Cerrando sesión...')
      setLoading(true)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ Error al cerrar sesión:', error)
        alert('Error al cerrar sesión: ' + error.message)
      } else {
        console.log('✅ Sesión cerrada correctamente')
        setUser(null)
        setIsBarbero(false)
        setMenuOpen(false)
        
        // Redirigir al home
        router.push('/')
        
        // Forzar recarga después de un momento
        setTimeout(() => {
          window.location.href = '/'
        }, 100)
      }
    } catch (err) {
      console.error('💥 Error inesperado al cerrar sesión:', err)
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
                {/* Botón "Mis Turnos" solo para barberos */}
                {isBarbero && (
                  <Link 
                    href="/barbero" 
                    className="btn-fresha btn-primary-fresha"
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
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
                <Link href="/login" className="nav-link-fresha">Iniciar sesión</Link>
                <Link href="/register" className="btn-fresha btn-secondary-fresha">Registrarse</Link>
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
            ☰
          </button>
        )}
      </nav>

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
                borderRadius: '8px'
              }}
            >
              Inicio
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
              Servicios
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
              Horarios
            </Link>
            
            {loading ? (
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
                    style={{ textAlign: 'center' }}
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
                  style={{ textAlign: 'center' }}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  onClick={() => setMenuOpen(false)}
                  className="btn-fresha btn-secondary-fresha"
                  style={{ textAlign: 'center' }}
                >
                  Iniciar sesión
                </Link>
                <Link 
                  href="/register" 
                  onClick={() => setMenuOpen(false)}
                  className="btn-fresha btn-secondary-fresha"
                  style={{ textAlign: 'center' }}
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
