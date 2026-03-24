'use client'
import { useState } from 'react'

const FOTOS_CORTES = [
  '/gallery/corte-1.jpg',
  '/gallery/corte-2.jpg',
  '/gallery/corte-3.jpg',
  '/gallery/corte-4.jpg',
  '/gallery/corte-5.jpg',
]

export default function GaleriaCortes() {
  const [imagenAmpliada, setImagenAmpliada] = useState<string | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <>
      <section style={{ padding: '5rem 0', background: 'var(--bg-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '1rem' }}>
              Nuestros Trabajos
            </h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
              Cada corte es una obra de arte. Mira algunos de nuestros mejores trabajos.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {FOTOS_CORTES.map((foto, index) => (
              <div
                key={index}
                onClick={() => setImagenAmpliada(foto)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  position: 'relative',
                  aspectRatio: '1 / 1',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: hoveredIndex === index
                    ? '0 10px 20px rgba(0,0,0,0.2)'
                    : '0 4px 6px rgba(0,0,0,0.1)',
                  transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s ease'
                }}
              >
                <img
                  src={foto}
                  alt={`Corte de pelo ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={(e) => {
                    e.currentTarget.src = `https://via.placeholder.com/800x800/2c6e49/ffffff?text=Corte+${index + 1}`
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, width: '100%', height: '100%',
                  background: 'rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: hoveredIndex === index ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none'
                }}>
                  <div style={{
                    background: 'white',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    🔍
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            
              href="https://www.instagram.com/barber.ares"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-fresha btn-primary-fresha"
              style={{ fontSize: '1.125rem', padding: '1rem 2.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}
            >
              📷 Ver más en Instagram
            </a>
          </div>
        </div>
      </section>

      {imagenAmpliada && (
        <div
          onClick={() => setImagenAmpliada(null)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '2rem', cursor: 'pointer'
          }}
        >
          <button
            onClick={() => setImagenAmpliada(null)}
            style={{
              position: 'absolute', top: '2rem', right: '2rem',
              background: 'white', border: 'none', borderRadius: '50%',
              width: '50px', height: '50px', fontSize: '1.5rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
            }}
          >
            ✕
          </button>
          <img
            src={imagenAmpliada}
            alt="Imagen ampliada"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90%', maxHeight: '90%',
              objectFit: 'contain', borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }}
          />
        </div>
      )}
    </>
  )
}
