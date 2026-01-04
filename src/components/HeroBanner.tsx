// src/components/HeroBanner.tsx
'use client'
import Link from 'next/link'

export default function HeroBanner() {
  return (
    <div style={{ 
      position: 'relative',
      width: '100%',
      height: '80vh',
      minHeight: '500px',
      maxHeight: '700px',
      overflow: 'hidden'
    }}>
      {/* Imagen de Fondo */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'url(/hero/hero-barberia.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        {/* Overlay oscuro para mejorar legibilidad del texto */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.3))'
        }}></div>
      </div>

      {/* Contenido sobre la imagen */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem'
      }}>
        <div style={{ maxWidth: '600px' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-block',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '0.5rem 1.25rem',
            borderRadius: '25px',
            marginBottom: '1.5rem',
            color: 'white',
            fontSize: '0.9rem',
            fontWeight: '600',
            letterSpacing: '0.5px'
          }}>
            ⭐ Barbería Premium en Campana
          </div>

          {/* Título Principal */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: '800',
            color: 'white',
            marginBottom: '1.25rem',
            lineHeight: '1.1',
            textShadow: '2px 2px 8px rgba(0,0,0,0.3)'
          }}>
            Tu estilo,<br />
            nuestra <span style={{ color: '#f59e0b' }}>pasión</span>
          </h1>

          {/* Subtítulo */}
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'rgba(255, 255, 255, 0.95)',
            marginBottom: '2.5rem',
            lineHeight: '1.6',
            textShadow: '1px 1px 4px rgba(0,0,0,0.4)'
          }}>
            Reserva tu turno online en segundos. Estilo clásico con técnica moderna. 
            Profesionales expertos te esperan en Barber Ares.
          </p>

          {/* Botones */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <Link 
              href="/reserva" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.25rem 2.5rem',
                fontSize: '1.125rem',
                fontWeight: '700',
                color: 'white',
                background: 'linear-gradient(135deg, #2c6e49 0%, #1a4d2e 100%)',
                border: 'none',
                borderRadius: '8px',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(44, 110, 73, 0.4)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(44, 110, 73, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(44, 110, 73, 0.4)'
              }}
            >
              📅 Reservar turno ahora
            </Link>

            <a 
              href="https://www.instagram.com/barber.ares" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.25rem 2.5rem',
                fontSize: '1.125rem',
                fontWeight: '700',
                color: 'white',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
              }}
            >
              📷 Ver Instagram
            </a>
          </div>

          {/* Stats/Info adicional */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
            marginTop: '3rem',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f59e0b', marginBottom: '0.25rem' }}>
                5.0
              </div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                Rating ⭐
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f59e0b', marginBottom: '0.25rem' }}>
                500+
              </div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                Clientes
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f59e0b', marginBottom: '0.25rem' }}>
                10+
              </div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                Años
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive */}
      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 1rem !important;
          }
        }
      `}</style>
    </div>
  )
}