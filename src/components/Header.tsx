'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
            <Link href="/reserva" className="btn-fresha btn-primary-fresha">Reservar turno</Link>
          </div>
        )}

        {isMobile && (
          <button 
            className="btn-fresha btn-secondary-fresha"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ padding: '0.5rem' }}
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
            <Link 
              href="/reserva" 
              onClick={() => setMenuOpen(false)}
              className="btn-fresha btn-primary-fresha"
              style={{ textAlign: 'center' }}
            >
              Reservar turno
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
