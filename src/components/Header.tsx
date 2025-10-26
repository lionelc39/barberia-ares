'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    // Verificar si hay usuario autenticado
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      window.removeEventListener('resize', checkMobile)
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
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
                <Link href="/reserva" className="btn-fresha btn-primary-fresha">Reservar turno</Link>
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
                <Link href="/reserva" className="btn-fresha btn-primary-fresha">Reservar turno</Link>
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
                <Link 
                  href="/reserva" 
                  onClick={() => setMenuOpen(false)}
                  className="btn-fresha btn-primary-fresha"
                  style={{ textAlign: 'center' }}
                >
                  Reservar turno
                </Link>
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
                <Link 
                  href="/reserva" 
                  onClick={() => setMenuOpen(false)}
                  className="btn-fresha btn-primary-fresha"
                  style={{ textAlign: 'center' }}
                >
                  Reservar turno
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
