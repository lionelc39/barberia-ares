import './globals.css'
import Header from '@/components/Header'

export const metadata = {
  title: 'Barberia Ares - Reserva Online',
  description: 'Reserva tu turno online en la mejor barberia',
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
              <p className="text-muted mb-4">Estilo clasico con tecnica moderna. Reserva tu turno online y disfruta de una experiencia de barberia unica.</p>
              <div className="flex gap-3">
                <a href="/reserva" className="btn-primary">Reservar Turno</a>
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
              <p className="text-sm text-muted max-w-md">Estilo clasico con tecnica moderna</p>
            </div>
            <div className="text-sm">
              <p className="font-semibold">Horarios</p>
              <p className="text-muted">Martes a Sabado:</p>
              <p className="text-muted">10:00 - 13:00 hs</p>
              <p className="text-muted">16:00 - 20:00 hs</p>
              <p className="text-muted mt-2">Domingo y Lunes: Cerrado</p>
            </div>
            <div>
              <p className="font-semibold">Contacto</p>
              <p className="text-muted">WhatsApp: +54 9 3489 594230</p>
              <a href="https://www.instagram.com/barber.ares" target="_blank" rel="noopener noreferrer" className="text-sm text-black font-medium hover:underline">@barber.ares</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
