// src/components/Header.tsx
'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="header-modern">
      <nav className="nav-modern">
        <Link href="/" className="logo-modern">
          <div className="logo-icon-modern">
            <Image src="/logo.png" alt="BA" width={40} height={40} className="rounded-full" />
          </div>
          <span className="logo-text">Barbería Ares</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-actions-modern">
          <Link href="/reserva" className="nav-link-modern">
            Servicios
          </Link>
          <Link href="/reserva" className="btn-primary-modern">
            Reservar ahora
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="menu-mobile-modern"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu-modern">
          <Link href="/reserva" onClick={() => setMenuOpen(false)}>
            Servicios
          </Link>
          <Link href="/reserva" onClick={() => setMenuOpen(false)}>
            Reservar ahora
          </Link>
          <Link href="/login" onClick={() => setMenuOpen(false)}>
            Iniciar sesión
          </Link>
        </div>
      )}
    </header>
  )
}
