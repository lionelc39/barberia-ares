'use client'
import { useState } from 'react'
import CalendarPicker from '@/components/CalendarPicker'
import { supabase } from '@/lib/supabase'
import { User, Mail, Phone, Calendar, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function Reserva() {
  const [slot, setSlot] = useState<Date | null>(null)
  const [contact, setContact] = useState({ nombre: '', email: '', whatsapp: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleReserve = async () => {
    if (!slot) {
      showErrorToast('Por favor selecciona un horario')
      return
    }

    if (!contact.nombre || !contact.email || !contact.whatsapp) {
      showErrorToast('Por favor completa todos los campos')
      return
    }

    setLoading(true)

    try {
      const fecha = slot.toISOString().split('T')[0]
      const hora = slot.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

      const { error } = await supabase.from('turnos').insert([
        {
          nombre_cliente: contact.nombre,
          email: contact.email,
          whatsapp: contact.whatsapp,
          fecha,
          hora,
        },
      ])

      if (error) {
        showErrorToast(error.message)
      } else {
        setSuccess(true)
        showSuccessToast('¡Turno reservado con éxito!')
      }
    } catch (err) {
      showErrorToast('Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const showSuccessToast = (message: string) => {
    const toast = document.createElement('div')
    toast.className =
      'fixed top-4 right-4 z-50 bg-green-50 shadow-2xl rounded-xl p-4 border-l-4 border-green-500 animate-slideIn max-w-md'
    toast.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-900">${message}</p>
        </div>
      </div>
    `
    document.body.appendChild(toast)
    setTimeout(() => {
      toast.style.opacity = '0'
      toast.style.transform = 'translateX(100%)'
      toast.style.transition = 'all 0.3s ease-out'
      setTimeout(() => document.body.removeChild(toast), 300)
    }, 4000)
  }

  const showErrorToast = (message: string) => {
    const toast = document.createElement('div')
    toast.className =
      'fixed top-4 right-4 z-50 bg-red-50 shadow-2xl rounded-xl p-4 border-l-4 border-red-500 animate-slideIn max-w-md'
    toast.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-900">${message}</p>
        </div>
      </div>
    `
    document.body.appendChild(toast)
    setTimeout(() => {
      toast.style.opacity = '0'
      toast.style.transform = 'translateX(100%)'
      toast.style.transition = 'all 0.3s ease-out'
      setTimeout(() => document.body.removeChild(toast), 300)
    }, 4000)
  }

  const resetForm = () => {
    setSlot(null)
    setContact({ nombre: '', email: '', whatsapp: '' })
    setSuccess(false)
  }

  if (success) {
    return (
      <div className="page-container min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="card text-center animate-fadeIn">
            <div className="inline-block p-6 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">¡Reserva Confirmada!</h2>
            <p className="text-gray-600 mb-2">
              Tu turno ha sido reservado exitosamente para:
            </p>
            <div className="bg-[#D4AF37]/10 rounded-xl p-4 mb-6">
              <p className="font-bold text-lg text-gray-900">
                {slot?.toLocaleDateString('es-AR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
              <p className="text-2xl font-bold text-[#D4AF37] mt-2">
                {slot?.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Te enviamos un email de confirmación a <strong>{contact.email}</strong>
            </p>
            <div className="space-y-3">
              <button onClick={resetForm} className="btn-primary btn-gold w-full justify-center">
                <Calendar className="w-5 h-5" />
                Reservar Otro Turno
              </button>
              <Link href="/" className="btn-primary btn-outline w-full justify-center">
                Volver al Inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#D4AF37] mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Volver al inicio</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-block p-4 bg-gradient-to-r from-[#0A0A0A] to-[#1A1A1A] rounded-2xl mb-4">
            <Calendar className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Reservar Turno</h1>
          <p className="text-gray-600">
            Elegí tu día y horario preferido. Te esperamos en Barber Ares.
          </p>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendario (2 columnas en desktop) */}
          <div className="lg:col-span-2">
            <CalendarPicker onSelectSlot={(d) => setSlot(d)} />
          </div>

          {/* Formulario de contacto (1 columna en desktop) */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24 animate-fadeIn">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Tus Datos</h3>

              <div className="space-y-4">
                {/* Nombre */}
                <div>
                  <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="nombre"
                      placeholder="Juan Pérez"
                      className="input-field pl-11"
                      value={contact.nombre}
                      onChange={(e) => setContact({ ...contact, nombre: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      className="input-field pl-11"
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* WhatsApp */}
                <div>
                  <label htmlFor="whatsapp" className="block text-sm font-semibold text-gray-700 mb-2">
                    WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="whatsapp"
                      placeholder="+54 9 11 1234-5678"
                      className="input-field pl-11"
                      value={contact.whatsapp}
                      onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Te enviaremos recordatorios por WhatsApp
                  </p>
                </div>

                {/* Resumen */}
                {slot && (
                  <div className="bg-[#D4AF37]/10 rounded-xl p-4 animate-fadeIn">
                    <p className="text-xs font-semibold text-gray-700 mb-2">TURNO SELECCIONADO</p>
                    <p className="font-bold text-gray-900">
                      {slot.toLocaleDateString('es-AR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                    <p className="text-xl font-bold text-[#D4AF37] mt-1">
                      {slot.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}

                {/* Botón confirmar */}
                <button
                  onClick={handleReserve}
                  className="btn-primary btn-black w-full justify-center text-base py-3.5"
                  disabled={loading || !slot}
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      <span>Reservando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Confirmar Turno</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Al confirmar aceptas recibir notificaciones sobre tu turno
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 card animate-fadeIn">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Información importante</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-[#D4AF37] mt-1">•</span>
              <span>Llega con 5 minutos de anticipación a tu turno</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4AF37] mt-1">•</span>
              <span>Si necesitas cancelar, contactanos con al menos 2 horas de anticipación</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4AF37] mt-1">•</span>
              <span>
                Aceptamos efectivo y transferencias bancarias. No trabajamos con tarjetas de crédito
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4AF37] mt-1">•</span>
              <span>Duración aproximada del servicio: 30-45 minutos</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
