// src/components/HeroBanner.tsx
'use client'
import Link from 'next/link'

export default function HeroBanner() {
  return (
    <div className="hero-banner-container">
      {/* Imagen de Fondo */}
      <div className="hero-banner-image">
        {/* Overlay oscuro */}
        <div className="hero-banner-overlay"></div>
      </div>

      {/* Contenido sobre la imagen */}
      <div className="hero-banner-content">
        <div className="hero-banner-inner">
          {/* Badge */}
          <div className="hero-banner-badge">
            ⭐ Barbería Premium en Campana
          </div>

          {/* Título Principal */}
          <h1 className="hero-banner-title">
            Tu estilo,<br />
            nuestra <span className="hero-banner-accent">pasión</span>
          </h1>

          {/* Subtítulo */}
          <p className="hero-banner-subtitle">
            Reserva tu turno online en segundos. Estilo clásico con técnica moderna.
          </p>

          {/* Botones */}
          <div className="hero-banner-buttons">
            <Link href="/reserva" className="hero-banner-btn hero-banner-btn-primary">
              📅 Reservar turno
            </Link>

            <a 
              href="https://www.instagram.com/barber.ares" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hero-banner-btn hero-banner-btn-secondary"
            >
              📷 Instagram
            </a>
          </div>

          {/* ✅ ACTUALIZACIÓN: Stats con nuevos textos */}
          <div className="hero-banner-stats">
            <div className="hero-banner-stat">
              <div className="hero-banner-stat-value">⭐</div>
              <div className="hero-banner-stat-label">Alta<br/>Satisfacción</div>
            </div>
            <div className="hero-banner-stat">
              <div className="hero-banner-stat-value">500+</div>
              <div className="hero-banner-stat-label">Clientes</div>
            </div>
            <div className="hero-banner-stat">
              <div className="hero-banner-stat-value">+5</div>
              <div className="hero-banner-stat-label">Años</div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Estilos en CSS global en lugar de style jsx */}
      <style jsx global>{`
        .hero-banner-container {
          position: relative;
          width: 100%;
          height: auto;
          min-height: 100vh;
          overflow: hidden;
        }

        .hero-banner-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url(/hero/hero-barberia.jpg);
          background-size: cover;
          background-position: center 30%;
          background-repeat: no-repeat;
        }

        .hero-banner-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.5));
        }

        .hero-banner-content {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          text-align: center;
        }

        .hero-banner-inner {
          width: 100%;
          max-width: 600px;
        }

        .hero-banner-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 25px;
          margin-bottom: 1rem;
          color: white;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .hero-banner-title {
          font-size: clamp(2rem, 8vw, 4.5rem);
          font-weight: 800;
          color: white;
          margin-bottom: 1rem;
          line-height: 1.1;
          text-shadow: 2px 2px 8px rgba(0,0,0,0.5);
        }

        .hero-banner-accent {
          color: #f59e0b;
        }

        .hero-banner-subtitle {
          font-size: clamp(0.9rem, 3vw, 1.25rem);
          color: rgba(255, 255, 255, 0.95);
          margin-bottom: 2rem;
          line-height: 1.5;
          text-shadow: 1px 1px 4px rgba(0,0,0,0.5);
          padding: 0 0.5rem;
        }

        .hero-banner-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          width: 100%;
          max-width: 100%;
          padding: 0 0.5rem;
        }

        .hero-banner-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 1rem 1.5rem;
          font-size: 1rem;
          font-weight: 700;
          color: white;
          border: none;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
          width: 100%;
        }

        .hero-banner-btn-primary {
          background: linear-gradient(135deg, #2c6e49 0%, #1a4d2e 100%);
          box-shadow: 0 4px 14px rgba(44, 110, 73, 0.4);
        }

        .hero-banner-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(44, 110, 73, 0.6);
        }

        .hero-banner-btn-secondary {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .hero-banner-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .hero-banner-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .hero-banner-stat {
          text-align: center;
        }

        .hero-banner-stat-value {
          font-size: clamp(1.5rem, 5vw, 2rem);
          font-weight: 800;
          color: #f59e0b;
          margin-bottom: 0.25rem;
        }

        .hero-banner-stat-label {
          font-size: clamp(0.65rem, 2vw, 0.85rem);
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.3;
        }

        /* ✅ Media Queries para Desktop */
        @media (min-width: 768px) {
          .hero-banner-container {
            min-height: 80vh;
            max-height: 700px;
          }

          .hero-banner-image {
            background-position: center center;
          }

          .hero-banner-overlay {
            background: linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.3));
          }

          .hero-banner-content {
            min-height: 80vh;
            max-height: 700px;
            text-align: left;
            justify-content: flex-start;
            padding: 0 2rem;
          }

          .hero-banner-inner {
            text-align: left;
          }

          .hero-banner-buttons {
            flex-direction: row;
            max-width: fit-content;
          }

          .hero-banner-btn {
            width: auto;
          }
        }
      `}</style>
    </div>
  )
}
