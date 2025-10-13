// src/app/page.tsx
'use client'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="grid md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="section-title">Reserva Online</h3>
          <p className="text-muted mb-3">Sistema fácil e intuitivo. Elegí día y horario en segundos.</p>
          <Link href="/reserva" className="btn-primary">Reservar Turno</Link>
        </div>

        <div className="card">
          <h3 className="section-title">Servicios Premium</h3>
          <p className="text-muted mb-3">Cortes clásicos y modernos, diseño de barba, afeitado tradicional.</p>
        </div>

        <div className="card">
          <h3 className="section-title">Horarios Flexibles</h3>
          <p className="text-muted mb-3">Lunes a sábado de 9:00 a 18:00. Elegí el horario que mejor te convenga.</p>
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">¿Listo para tu nuevo look?</h2>
        <p className="text-muted">Reservá tu turno ahora y experimentá el mejor servicio de barbería.</p>
        <div className="mt-4">
          <Link href="/reserva" className="btn-primary">Reservar Ahora</Link>
        </div>
      </section>
    </div>
  )
}
