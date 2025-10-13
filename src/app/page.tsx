'use client'
import Link from 'next/link'
import { Calendar, Users, Scissors, Clock, Star, MapPin } from 'lucide-react'

export default function Home() {
  return (
    <div className="page-container min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center animate-fadeIn">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 rounded-full mb-6">
            <Star className="w-4 h-4 text-[#D4AF37]" fill="#D4AF37" />
            <span className="text-sm font-medium text-gray-700">Barbería Premium</span>
          </div>

          {/* Título principal */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Bienvenido a{' '}
            <span className="text-gradient">Barber Ares</span>
          </h1>

          {/* Subtítulo */}
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Estilo clásico con técnicas modernas. Reserva tu turno online y disfruta de una experiencia de barbería única.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/reserva" className="btn-primary btn-gold w-full sm:w-auto">
              <Calendar className="w-5 h-5" />
              Reservar Turno
            </Link>
            <Link href="/register" className="btn-primary btn-outline w-full sm:w-auto">
              <Users className="w-5 h-5" />
              Crear Cuenta
            </Link>
          </div>

          {/* Quick Link */}
          <p className="text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-[#D4AF37] font-medium hover:text-[#B8941F] transition-colors">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Feature 1 */}
          <div className="card group hover:shadow-3xl cursor-pointer animate-fadeIn">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-gradient-to-r from-[#0A0A0A] to-[#1A1A1A] rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Reserva Online</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Sistema fácil e intuitivo. Elige tu día y horario en segundos.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="card group hover:shadow-3xl cursor-pointer animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-gradient-to-r from-[#0A0A0A] to-[#1A1A1A] rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <Scissors className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Servicios Premium</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Cortes clásicos y modernos, diseño de barba, afeitado tradicional.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="card group hover:shadow-3xl cursor-pointer animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-gradient-to-r from-[#0A0A0A] to-[#1A1A1A] rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Horarios Flexibles</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Lunes a sábado de 9:00 a 18:00. Elige el horario que mejor te convenga.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto card animate-fadeIn">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-[#D4AF37]/10 rounded-xl">
              <MapPin className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Visitanos</h3>
              <p className="text-gray-600">
                Ubicados en el corazón de la ciudad. Ambiente cómodo y profesional.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Horarios</p>
              <p className="text-gray-600 text-sm">Lunes a Sábado: 9:00 - 18:00</p>
              <p className="text-gray-600 text-sm">Domingo: Cerrado</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Contacto</p>
              <p className="text-gray-600 text-sm">Seguinos en Instagram</p>
              <Link 
                href="https://www.instagram.com/barber.ares" 
                target="_blank"
                className="text-[#D4AF37] text-sm font-medium hover:text-[#B8941F] transition-colors"
              >
                @barber.ares
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            ¿Listo para tu nuevo look?
          </h2>
          <p className="text-gray-600 mb-8">
            Reserva tu turno ahora y experimenta el mejor servicio de barbería.
          </p>
          <Link href="/reserva" className="btn-primary btn-black text-lg">
            <Calendar className="w-6 h-6" />
            Reservar Ahora
          </Link>
        </div>
      </section>
    </div>
  )
}
