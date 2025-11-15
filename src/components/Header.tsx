'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isBarbero, setIsBarbero] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    // Verificar si hay usuario autenticado
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        
        // Verificar si es barbero
        const { data: barbero } = await supabase
          .from('barberos')
          .select('*')
          .eq('email', session.user.email)
          .eq('activo', true)
          .maybeSingle()
        
        setIsBarbero(!!barbero)
      }
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user)
        
        const { data: barbero } = await supabase
          .from('barberos')
          .select('*')
          .eq('email', session.user.email)
          .eq('activo', true)
          .single()
        
        setIsBarbero(!!barbero)
      } else {
        setUser(null)
        setIsBarbero(false)
      }
    })

    return () => {
      window.removeEventListener('resize', checkMobile)
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsBarbero(false)
    router.push('/')
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
            
            {user ? (
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
            
            {user ? (
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
