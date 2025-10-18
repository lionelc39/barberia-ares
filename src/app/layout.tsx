// src/app/layout.tsx
import './globals.css'
import Header from '@/components/Header'

export const metadata = {
  title: 'Barbería Ares - Reserva Online',
  description: 'Reservá tu turno online en la mejor barbería',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Header />
        <main>
          {children}
        </main>
        <footer className="border-t py-8 mt-10 bg-white">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold mb-2">Barbería Ares</h4>
                <p className="text-sm text-muted">
                  Estilo clásico con técnica moderna
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Horarios</h4>
                <p className="text-sm text-muted">Lunes a Sábado: 9:00 - 18:00</p>
                <p className="text-sm text-muted">Domingo: Cerrado</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Contacto</h4>
                <p className="text-sm text-muted">WhatsApp: +54 9 3489 324301</p>
                <a 
                  href="https://www.instagram.com/barber.ares" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-black font-medium hover:underline"
                >
                  @barber.ares
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
