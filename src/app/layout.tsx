import './globals.css'
import Header from '@/components/Header'

export const metadata = {
  title: 'Barber Ares - Reserva tu turno online',
  description: 'Reserva tu turno online en Barber Ares. Estilo clásico con técnica moderna.',
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
              <p>Martes a Sábado</p>
              <p>10:00 - 13:00 hs</p>
              <p>16:00 - 20:00 hs</p>
              <p style={{ marginTop: '0.5rem' }}>Domingo y Lunes: Cerrado</p>
            </div>
            <div className="footer-section" id="contacto">
              <h4>Contacto</h4>
              <p>📍 Campana, Buenos Aires</p>
              <p>📞 WhatsApp: +54 9 3489 594230</p>
              <a href="https://www.instagram.com/barber.ares" target="_blank" rel="noopener noreferrer">
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
