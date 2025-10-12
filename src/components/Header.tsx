'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Instagram } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-black text-white py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo Barber Ares" width={48} height={48} />
          <span className="text-lg font-bold text-yellow-400">Barber Ares</span>
        </Link>
        <Link href="https://www.instagram.com/barber.ares" target="_blank" className="btn-primary bg-yellow-400 text-black">
          <Instagram />
          Instagram
        </Link>
      </div>
    </header>
  )
}
