'use client'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="grid md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="section-title">Reserva Online</h3>
          <p className="text-muted mb-3">Sistema facil e intuitivo. Elegi dia y horario en segundos.</p>
          <Link href="/reserva" className="btn-primary">Reservar Turno</Link>
        </div>
        <div className="card">
          <h3 className="section-title">Servicios Premium</h3>
          <p className="text-muted mb-3">Cortes clasicos y modernos, diseno de barba, afeitado tradicional.</p>
        </div>
        <div className="card">
          <h3 className="section-title">Horarios Flexibles</h3>
          <p className="text-muted mb-3">Martes a sabado de 10 a 13 hs y de 16 a 20 hs.</p>
        </div>
      </section>
      <section className="card">
        <h2 className="section-title">Listo para tu nuevo look?</h2>
        <p className="text-muted">Reserva tu turno ahora y experimenta el mejor servicio de barberia.</p>
        <div className="mt-4">
          <Link href="/reserva" className="btn-primary">Reservar Ahora</Link>
        </div>
      </section>
    </div>
  )
}
