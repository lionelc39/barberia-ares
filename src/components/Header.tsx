// src/components/Header.tsx
'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu } from 'lucide-react'

export default function Header(){
  const [open, setOpen] = useState(false)
  return (
    <header className="border-b bg-white">
      <div className="container flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-3">
          <div style={{width:48, height:48}}>
            <Image src="/logo.png" alt="Logo" width={48} height={48} className="rounded-full" />
          </div>
          <div>
            <div className="font-semibold">Barber Ares</div>
            <div className="text-xs text-muted">Barbería Premium</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-4">
          <Link href="/reserva" className="text-sm">Reservar</Link>
          <Link href="/login" className="text-sm">Iniciar sesión</Link>
          <a href="https://www.instagram.com/barber.ares" target="_blank" rel="noreferrer" className="btn-ghost">Instagram</a>
        </nav>

        <button className="md:hidden p-2" onClick={()=>setOpen(!open)} aria-label="Abrir menu">
          <Menu />
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t">
          <div className="flex flex-col p-4 gap-2">
            <Link href="/reserva" onClick={()=>setOpen(false)}>Reservar</Link>
            <Link href="/login" onClick={()=>setOpen(false)}>Iniciar sesión</Link>
            <a href="https://www.instagram.com/barber.ares" target="_blank" rel="noreferrer">Instagram</a>
          </div>
        </div>
      )}
    </header>
  )
}
