'use client'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <div className="hero-fresha">
        <div className="hero-content-fresha">
          <h1 className="hero-title-fresha">Tu estilo, nuestra pasión</h1>
          <p className="hero-subtitle-fresha">
            Reserva tu turno online en segundos. Estilo clásico con técnica moderna. 
            Profesionales expertos te esperan.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/reserva" className="btn-fresha btn-primary-fresha" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
              Reservar turno ahora
            </Link>
            <a href="https://www.instagram.com/barber.ares" target="_blank" rel="noopener noreferrer" className="btn-fresha btn-secondary-fresha" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
              Ver Instagram
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ padding: '4rem 0' }}>
        <div className="container">
          {/* Servicios */}
          <section id="servicios" style={{ marginBottom: '4rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                Nuestros servicios
              </h2>
              <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                Descubre nuestros servicios premium de barbería
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div className="service-card-fresha">
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✂️</div>
                <h3 className="service-title">Corte Personalizado</h3>
                <p className="service-description">
                  Corte de cabello personalizado adaptado a tu estilo y preferencias
                </p>
                <div className="service-meta">
                  <span className="service-duration">⏱️ 45 min</span>
                  <span className="service-price">$28.000</span>
                </div>
              </div>

              <div className="service-card-fresha">
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🪒</div>
                <h3 className="service-title">Ritual de Barba</h3>
                <p className="service-description">
                  Servicio personalizado con afeitado, toalla caliente y productos premium
                </p>
                <div className="service-meta">
                  <span className="service-duration">⏱️ 45 min</span>
                  <span className="service-price">$32.000</span>
                </div>
              </div>

              <div className="service-card-fresha">
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💈</div>
                <h3 className="service-title">Corte + Ritual de Barba</h3>
                <p className="service-description">
                  Experiencia completa de barbería para un look impecable
                </p>
                <div className="service-meta">
                  <span className="service-duration">⏱️ 1h 15min</span>
                  <span className="service-price">$38.000</span>
                </div>
              </div>
            </div>
          </section>

          {/* Por qué elegirnos */}
          <section style={{ marginBottom: '4rem', background: 'var(--bg-light)', padding: '3rem 2rem', borderRadius: '12px' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                ¿Por qué elegir Barber Ares?
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>5.0 Rating</h3>
                <p style={{ color: 'var(--text-muted)' }}>Calificación perfecta de nuestros clientes</p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>500+ Clientes</h3>
                <p style={{ color: 'var(--text-muted)' }}>Clientes satisfechos confían en nosotros</p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>10+ Años</h3>
                <p style={{ color: 'var(--text-muted)' }}>De experiencia en el arte de la barbería</p>
              </div>
            </div>
          </section>

          {/* CTA Final */}
          <section style={{ textAlign: 'center', padding: '3rem 2rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '1rem' }}>
              ¿Listo para tu nuevo look?
            </h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
              Reserva tu turno ahora y experimenta el mejor servicio de barbería en Campana
            </p>
            <Link href="/reserva" className="btn-fresha btn-primary-fresha" style={{ fontSize: '1.125rem', padding: '1rem 2.5rem' }}>
              Reservar mi turno
            </Link>
          </section>
        </div>
      </main>

      {/* WhatsApp Float */}
      <a 
        href="https://wa.me/5493489594230" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="whatsapp-float" 
        aria-label="WhatsApp"
      >
        💬
      </a>
    </>
  )
}
