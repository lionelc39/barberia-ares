// src/components/HeroBanner.tsx
'use client'
import Link from 'next/link'

export default function HeroBanner() {
  return (
    <div style={{ 
      position: 'relative',
      width: '100%',
      height: 'auto', // ✅ Cambio: height auto en lugar de fijo
      minHeight: '100vh', // ✅ Mobile: usar toda la pantalla
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
        backgroundPosition: 'center center', // ✅ Centrado para mobile
        backgroundRepeat: 'no-repeat'
      }}>
        {/* Overlay oscuro */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.5))' // ✅ Vertical para mobile
        }}></div>
      </div>

      {/* Contenido sobre la imagen */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh', // ✅ Ocupa toda la pantalla
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', // ✅ Centrado en mobile
        padding: '2rem 1rem', // ✅ Padding reducido para mobile
        textAlign: 'center' // ✅ Texto centrado en mobile
      }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-block',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '0.5rem 1rem', // ✅ Padding reducido
            borderRadius: '25px',
            marginBottom: '1rem', // ✅ Margen reducido
            color: 'white',
            fontSize: '0.8rem', // ✅ Fuente más pequeña
            fontWeight: '600',
            letterSpacing: '0.5px'
          }}>
            ⭐ Barbería Premium en Campana
          </div>

          {/* Título Principal */}
          <h1 style={{
            fontSize: 'clamp(2rem, 8vw, 4.5rem)', // ✅ Ajustado para mobile (era 2.5rem mínimo)
            fontWeight: '800',
            color: 'white',
            marginBottom: '1rem',
            lineHeight: '1.1',
            textShadow: '2px 2px 8px rgba(0,0,0,0.5)' // ✅ Sombra más fuerte para legibilidad
          }}>
            Tu estilo,<br />
            nuestra <span style={{ color: '#f59e0b' }}>pasión</span>
          </h1>

          {/* Subtítulo */}
          <p style={{
            fontSize: 'clamp(0.9rem, 3vw, 1.25rem)', // ✅ Ajustado para mobile
            color: 'rgba(255, 255, 255, 0.95)',
            marginBottom: '2rem',
            lineHeight: '1.5',
            textShadow: '1px 1px 4px rgba(0,0,0,0.5)',
            padding: '0 0.5rem' // ✅ Padding lateral para evitar pegarse a bordes
          }}>
            Reserva tu turno online en segundos. Estilo clásico con técnica moderna.
          </p>

          {/* Botones - Stack vertical en mobile */}
          <div style={{
            display: 'flex',
            flexDirection: 'column', // ✅ Columna en mobile
            gap: '0.75rem',
            width: '100%',
            maxWidth: '100%',
            padding: '0 0.5rem'
          }}>
            <Link 
              href="/reserva" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem 1.5rem', // ✅ Padding reducido
                fontSize: '1rem', // ✅ Fuente reducida
                fontWeight: '700',
                color: 'white',
                background: 'linear-gradient(135deg, #2c6e49 0%, #1a4d2e 100%)',
                border: 'none',
                borderRadius: '8px',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(44, 110, 73, 0.4)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                width: '100%' // ✅ Full width en mobile
              }}
            >
              📅 Reservar turno
            </Link>

            <a 
              href="https://www.instagram.com/barber.ares" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '700',
                color: 'white',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              📷 Instagram
            </a>
          </div>

          {/* Stats - Diseño responsive */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)', // ✅ 3 columnas siempre
            gap: '1rem', // ✅ Gap reducido
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div>
              <div style={{ 
                fontSize: 'clamp(1.5rem, 5vw, 2rem)', // ✅ Tamaño adaptativo
                fontWeight: '800', 
                color: '#f59e0b', 
                marginBottom: '0.25rem' 
              }}>
                5.0
              </div>
              <div style={{ 
                fontSize: 'clamp(0.7rem, 2vw, 0.85rem)', // ✅ Texto más pequeño en mobile
                color: 'rgba(255, 255, 255, 0.8)' 
              }}>
                Rating
              </div>
            </div>
            <div>
              <div style={{ 
                fontSize: 'clamp(1.5rem, 5vw, 2rem)', 
                fontWeight: '800', 
                color: '#f59e0b', 
                marginBottom: '0.25rem' 
              }}>
                500+
              </div>
              <div style={{ 
                fontSize: 'clamp(0.7rem, 2vw, 0.85rem)', 
                color: 'rgba(255, 255, 255, 0.8)' 
              }}>
                Clientes
              </div>
            </div>
            <div>
              <div style={{ 
                fontSize: 'clamp(1.5rem, 5vw, 2rem)', 
                fontWeight: '800', 
                color: '#f59e0b', 
                marginBottom: '0.25rem' 
              }}>
                10+
              </div>
              <div style={{ 
                fontSize: 'clamp(0.7rem, 2vw, 0.85rem)', 
                color: 'rgba(255, 255, 255, 0.8)' 
              }}>
                Años
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Media Queries para Desktop */}
      <style jsx>{`
        @media (min-width: 768px) {
          /* Desktop: Altura fija, texto alineado izquierda */
          div[style*="minHeight: 100vh"] {
            min-height: 80vh !important;
            max-height: 700px !important;
            text-align: left !important;
            justify-content: flex-start !important;
            padding: 0 2rem !important;
          }

          /* Contenido alineado izquierda */
          div[style*="width: 100%"][style*="maxWidth: 600px"] {
            text-align: left !important;
          }

          /* Botones en fila */
          div[style*="flexDirection: column"] {
            flex-direction: row !important;
            max-width: fit-content !important;
          }

          /* Overlay horizontal */
          div[style*="linear-gradient(to bottom"] {
            background: linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.3)) !important;
          }
        }
      `}</style>
    </div>
  )
}
