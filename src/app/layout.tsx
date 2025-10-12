import './globals.css'
import Header from '@/components/Header'

export const metadata = {
  title: 'Barber Ares - Reserva Turnos',
  description: 'Sistema de turnos para Barber Ares',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Header />
        <main className="container mx-auto py-8 px-4">
          {children}
        </main>
        <footer className="text-center py-6 text-sm text-gray-500">© Barber Ares</footer>
      </body>
    </html>
  )
}
