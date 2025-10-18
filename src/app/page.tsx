// src/app/page.tsx
'use client'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-modern">
        <div className="hero-content-modern">
          <h1 className="hero-title">Tu estilo, nuestra pasión</h1>
          <p className="hero-subtitle">
            Reservá tu turno online en segundos. Profesionales expertos te esperan.
          </p>
          <div className="hero-actions">
            <Link href="/reserva" className="btn-primary-modern">
              Reservar turno
            </Link>
          </div>
          
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">5.0</span>
              <span className="stat-label">⭐ Rating</span>
            </div>
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Clientes satisfechos</span>
            </div>
            <div className="stat">
              <span className="stat-number">10+</span>
              <span className="stat-label">Años de experiencia</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="container-modern">
          <h2 className="section-title-modern">Nuestros servicios</h2>
          <div className="services-grid-modern">
            <Link href="/reserva" className="service-card-modern">
              <div className="service-header-modern">
                <div>
                  <div className="service-name">Corte Personalizado</div>
                  <div className="service-duration">⏱ 45 min</div>
                </div>
                <div className="service-price">$28.000</div>
              </div>
              <div className="service-description">
                Corte de cabello personalizado adaptado a tu estilo y preferencias
              </div>
            </Link>

            <Link href="/reserva" className="service-card-modern">
              <div className="service-header-modern">
                <div>
                  <div className="service-name">Ritual de Barba</div>
                  <div className="service-duration">⏱ 45 min</div>
                </div>
                <div className="service-price">$32.000</div>
              </div>
              <div className="service-description">
                Servicio personalizado con afeitado, toalla caliente y productos premium
              </div>
            </Link>

            <Link href="/reserva" className="service-card-modern">
              <div className="service-header-modern">
                <div>
                  <div className="service-name">Corte + Ritual de Barba</div>
                  <div className="service-duration">⏱ 1h 15min</div>
                </div>
                <div className="service-price">$38.000</div>
              </div>
              <div className="service-description">
                Experiencia completa: corte personalizado y ritual de barba profesional
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
