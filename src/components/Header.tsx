'use client'
import Link from 'next/link'
import Image from 'next/image'
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
    <header className="header-modern">
      <nav className="nav-modern">
        <Link href="/" className="logo-modern">
          <div className="logo-icon-modern">
            <Image src="/logo.png" alt="BA" width={40} height={40} className="rounded-full" />
          </div>
          <span className="logo-text">Barberia Ares</span>
        </Link>

        {!isMobile && (
          <div className="nav-actions-modern">
            <Link href="/reserva" className="nav-link-modern">Servicios</Link>
            <Link href="/reserva" className="btn-primary-modern">Reservar ahora</Link>
          </div>
        )}

        {isMobile && (
          <button 
            className="menu-mobile-modern"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        )}
      </nav>

      {isMobile && menuOpen && (
        <div className="mobile-menu-modern">
          <Link href="/" onClick={() => setMenuOpen(false)}>Inicio</Link>
          <Link href="/reserva" onClick={() => setMenuOpen(false)}>Servicios</Link>
          <Link href="/reserva" onClick={() => setMenuOpen(false)}>Reservar turno</Link>
          <a href="https://wa.me/5493489594230" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>WhatsApp</a>
        </div>
      )}
    </header>
  )
}
