// src/app/layout.tsx
import './globals.css'
import Header from '@/components/Header'

export const metadata = {
  title: 'Barber Ares - Reserva Turnos',
  description: 'Barber Ares - Reserva turnos online',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Header />
        <div className="hero">
          <div className="hero-inner container">
            <div className="hero-left">
              <h1 style={{fontSize: '2.2rem'}} className="mb-3">Barber Ares</h1>
              <p className="text-muted mb-4">Estilo clásico con técnica moderna. Reservá tu turno online y disfrutá de una experiencia de barbería única.</p>
              <div className="flex gap-3">
                <a href="/reserva" className="btn-primary">Reservar Turno</a>
                <a href="/register" className="btn-ghost">Crear Cuenta</a>
              </div>
            </div>
            <div className="hero-right">
              <div className="logo-large">
                <img src="/logo.png" alt="Logo Barber Ares" style={{ width: '85%', height:'85%', objectFit:'contain' }} />
              </div>
            </div>
          </div>
        </div>

        <main className="py-10 container">
          {children}
        </main>

        <footer className="border-t py-8 mt-10">
          <div className="container flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <h4 className="font-semibold">Barber Ares</h4>
              <p className="text-sm text-muted max-w-md">Ubicados en el corazón de la ciudad. Ambiente cómodo y profesional. Seguinos en Instagram: <a href="https://www.instagram.com/barber.ares" className="text-black font-medium">@barber.ares</a></p>
            </div>

            <div className="text-sm">
              <p className="font-semibold">Horarios</p>
              <p className="text-muted">Lunes a Sábado: 9:00 - 18:00</p>
              <p className="text-muted">Domingo: Cerrado</p>
            </div>

            <div>
              <p className="font-semibold">Contacto</p>
              <p className="text-muted">Tel / WhatsApp: +54 9 ...</p>
              <p className="text-muted">Email: contacto@barberares.com</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
