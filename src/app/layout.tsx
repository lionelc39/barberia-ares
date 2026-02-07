import type { Metadata } from "next"
import "./globals.css"
import Header from "@/components/Header"

export const metadata: Metadata = {
  title: "Barber Ares - Barbería en Campana",
  description: "Reserva tu turno online. Estilo clásico con técnica moderna.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Header />
        {children}
        <footer>
          <div className="footer-content">
            <div className="footer-section">
              <h4>Barber Ares</h4>
              <p>Estilo clásico con técnica moderna. Tu barbería de confianza en Campana.</p>
            </div>
            
            <div className="footer-section" id="horarios">
              <h4>Horarios de atención</h4>
              <p style={{ marginBottom: '0.5rem' }}><strong>Lunes:</strong> 16:00 - 20:00 hs</p>
              <p style={{ marginBottom: '0.5rem' }}><strong>Martes a Jueves:</strong> 10:00 - 12:30 hs y 16:00 - 20:00 hs</p>
              <p style={{ marginBottom: '0.5rem' }}><strong>Viernes y Sábado:</strong> 10:00 - 20:00 hs</p>
              <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Domingo: Cerrado</p>
            </div>
            
            <div className="footer-section" id="contacto">
              <h4>Contacto</h4>
              <p style={{ marginBottom: '0.5rem' }}>
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=Avenida+Doctor+Ricardo+Balbín+982+Campana+Buenos+Aires" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="footer-contact-link"
                  style={{ 
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem'
                  }}
                >
                  <span>📍</span>
                  <span>Av. Doctor Ricardo Balbín 982, Campana, Buenos Aires</span>
                </a>
              </p>
              <p style={{ marginBottom: '0.5rem' }}>📞 WhatsApp: +54 9 3489 594230</p>
              <a 
                href="https://www.instagram.com/barber.ares" 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-contact-link"
                style={{ textDecoration: 'none' }}
              >
                📷 @barber.ares
              </a>
            </div>
          </div>
          <div style={{ 
            textAlign: 'center', 
            marginTop: '2rem', 
            paddingTop: '2rem', 
            borderTop: '1px solid var(--border)',
            fontSize: '0.875rem',
            color: 'var(--text-muted)'
          }}>
            <p>© 2025 Barber Ares. Todos los derechos reservados.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
