'use client'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">Bienvenido a Barber Ares</h1>
      <p className="mb-6 text-gray-600">Reserva tu turno fácilmente. <br/>Botón directo a Instagram en el header.</p>
      <div className="grid gap-3 max-w-sm mx-auto">
        <Link href='/register' className='btn-primary bg-black text-white justify-center'>Registrarse</Link>
        <Link href='/login' className='btn-primary border border-black justify-center'>Iniciar Sesión</Link>
        <Link href='/reserva' className='btn-primary bg-gray-900 text-white justify-center'>Reservar como Invitado</Link>
      </div>
    </div>
  )
}
