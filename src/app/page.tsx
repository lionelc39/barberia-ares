'use client'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="hero-modern">
        <div className="hero-content-modern">
          <h1 className="hero-title">Tu estilo, nuestra pasion</h1>
          <p className="hero-subtitle">
            Reserva tu turno online en segundos. Profesionales expertos te esperan.
          </p>
          <div className="hero-actions">
            <Link href="/reserva" className="btn-primary-modern">
              Reservar turno
            </Link>
          </div>
          
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">5.0</span>
              <span className="stat-label">Rating</span>
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

      <section className="services-section-new">
        <div className="container-modern">
          <div className="text-center mb-12">
            <h2 className="section-title-modern">Nuestros Servicios</h2>
            <p className="text-muted text-lg">Elegi el servicio que mejor se adapte a tu estilo</p>
          </div>

          <div className="services-list-modern">
            <div className="service-item-modern">
              <div className="service-icon-modern">
                <span className="text-4xl">X</span>
              </div>
              <div className="service-details-modern">
                <h3 className="service-title-modern">Corte Personalizado</h3>
                <p className="service-desc-modern">
                  Corte de cabello personalizado adaptado a tu estilo y preferencias. 
                  Nuestros barberos expertos te asesoraran para lograr el look perfecto.
                </p>
                <div className="service-meta-modern">
                  <span className="duration-badge">45 min</span>
                  <span className="price-badge">$28.000</span>
                </div>
              </div>
              <Link href="/reserva" className="btn-reserve-modern">
                Reservar
              </Link>
            </div>

            <div className="service-item-modern">
              <div className="service-icon-modern">
                <span className="text-4xl">Y</span>
              </div>
              <div className="service-details-modern">
                <h3 className="service-title-modern">Ritual de Barba</h3>
                <p className="service-desc-modern">
                  Servicio completo de barba con afeitado profesional, toallas calientes 
                  y productos premium para un acabado impecable.
                </p>
                <div className="service-meta-modern">
                  <span className="duration-badge">45 min</span>
                  <span className="price-badge">$32.000</span>
                </div>
              </div>
              <Link href="/reserva" className="btn-reserve-modern">
                Reservar
              </Link>
            </div>

            <div className="service-item-modern">
              <div className="service-icon-modern">
                <span className="text-4xl">Z</span>
              </div>
              <div className="service-details-modern">
                <h3 className="service-title-modern">Corte + Ritual de Barba</h3>
                <p className="service-desc-modern">
                  Experiencia completa que combina corte personalizado y ritual de barba. 
                  El paquete definitivo para lucir impecable.
                </p>
                <div className="service-meta-modern">
                  <span className="duration-badge">1h 15min</span>
                  <span className="price-badge">$38.000</span>
                </div>
              </div>
              <Link href="/reserva" className="btn-reserve-modern">
                Reservar
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="horarios-section">
        <div className="container-modern">
          <div className="horarios-card">
            <div className="text-center mb-8">
              <h2 className="section-title-modern">Horarios de Atencion</h2>
            </div>
            <div className="horarios-grid">
              <div className="horario-item">
                <span className="horario-dias">Martes a Sabado</span>
                <div className="horario-horas">
                  <span className="hora-bloque">10:00 - 13:00 hs</span>
                  <span className="hora-bloque">16:00 - 20:00 hs</span>
                </div>
              </div>
              <div className="horario-item cerrado">
                <span className="horario-dias">Domingo y Lunes</span>
                <span className="hora-bloque">Cerrado</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      
        href="https://wa.me/5493489594230?text=Hola!%20Quiero%20reservar%20un%20turno"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label="Contactar por WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        <span className="whatsapp-text">WhatsApp</span>
      </a>
    </div>
  )
}
