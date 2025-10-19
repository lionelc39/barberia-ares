// src/app/reserva/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

// Definir los servicios disponibles
const SERVICIOS = [
  {
    id: 'corte-personalizado',
    nombre: 'Corte Personalizado',
    duracion: '45 min',
    precio: 28000,
    descripcion: 'Corte de cabello personalizado adaptado a tu estilo y preferencias'
  },
  {
    id: 'ritual-barba',
    nombre: 'Ritual de Barba',
    duracion: '45 min',
    precio: 32000,
    descripcion: 'Servicio personalizado con afeitado, toalla caliente y productos premium'
  },
  {
    id: 'corte-barba',
    nombre: 'Corte + Ritual de Barba',
    duracion: '1h 15min',
    precio: 38000,
    descripcion: 'Experiencia completa: corte personalizado y ritual de barba profesional'
  }
]

export default function Reserva() {
  const router = useRouter()
  
  // Estados
  const [paso, setPaso] = useState<1 | 2 | 3>(1) // 1: servicio, 2: fecha/hora, 3: datos
  const [servicioSeleccionado, setServicioSeleccionado] = useState<any>(null)
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null)
  const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null)
  const [contact, setContact] = useState({ nombre: '', email: '', whatsapp: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([])

  // Verificar usuario logueado
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: cliente } = await supabase
          .from('clientes')
          .select('*')
          .eq('email', user.email)
          .single()
        
        if (cliente) {
          setContact({
            nombre: `${cliente.nombre} ${cliente.apellido}`,
            email: cliente.email,
            whatsapp: cliente.whatsapp || ''
          })
        }
      }
    }
    checkUser()
  }, [])

  // Cargar horarios ocupados cuando cambia la fecha
  useEffect(() => {
    if (fechaSeleccionada) {
      cargarHorariosOcupados()
    }
  }, [fechaSeleccionada])

  const cargarHorariosOcupados = async () => {
    if (!fechaSeleccionada) return
    
    const fecha = fechaSeleccionada.toISOString().split('T')[0]
    const { data } = await supabase
      .from('turnos')
      .select('hora')
      .eq('fecha', fecha)
    
    setHorariosOcupados((data || []).map((r: any) => r.hora))
  }

  // Generar horarios disponibles
  const generarHorarios = () => {
    const horarios = []
    for (let h = 9; h < 18; h++) {
      for (let m of [0, 30]) {
        const hora = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
        horarios.push(hora)
      }
    }
    return horarios
  }

  const handleReserve = async () => {
    setError('')
    setMessage('')

    if (!servicioSeleccionado || !fechaSeleccionada || !horaSeleccionada) {
      setError('Por favor completá todos los pasos')
      return
    }

    if (!contact.nombre.trim() || !contact.email.trim() || !contact.whatsapp.trim()) {
      setError('Por favor completá todos tus datos')
      return
    }

    setLoading(true)

    try {
      const fecha = fechaSeleccionada.toISOString().split('T')[0]

      // Verificar disponibilidad
      const { data: turnoExistente } = await supabase
        .from('turnos')
        .select('id')
        .eq('fecha', fecha)
        .eq('hora', horaSeleccionada)
        .single()

      if (turnoExistente) {
        setError('Lo sentimos, ese horario ya fue reservado.')
        setLoading(false)
        return
      }

      // Insertar turno con servicio
      const { error: errorTurno } = await supabase
        .from('turnos')
        .insert([{
          nombre_cliente: contact.nombre,
          email: contact.email,
          whatsapp: contact.whatsapp,
          fecha: fecha,
          hora: horaSeleccionada,
          servicio: servicioSeleccionado.nombre,
          servicio_id: servicioSeleccionado.id,
          precio: servicioSeleccionado.precio,
          duracion: servicioSeleccionado.duracion,
          estado: 'reservado'
        }])

      if (errorTurno) throw errorTurno

      const fechaFormatted = format(fechaSeleccionada, "EEEE d 'de' MMMM", { locale: es })

      // Enviar email
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: contact.email,
            tipo: 'confirmacion_turno',
            datos: {
              nombre: contact.nombre,
              fecha: fechaFormatted,
              hora: horaSeleccionada,
              whatsapp: contact.whatsapp,
              servicio: servicioSeleccionado.nombre,
              precio: servicioSeleccionado.precio
            }
          })
        })
      } catch (e) {
        console.error('Error enviando email:', e)
      }

      setMessage(`¡Turno confirmado! 🎉\n${fechaFormatted} a las ${horaSeleccionada}`)
      
      setTimeout(() => {
        router.push('/')
      }, 3000)

    } catch (error: any) {
      console.error('Error:', error)
      setError('Hubo un error al reservar. Intentá nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className={`flex items-center gap-2 ${paso >= 1 ? 'text-black' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${paso >= 1 ? 'bg-black text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="font-medium hidden md:block">Servicio</span>
          </div>
          <div className={`h-1 w-16 ${paso >= 2 ? 'bg-black' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center gap-2 ${paso >= 2 ? 'text-black' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${paso >= 2 ? 'bg-black text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="font-medium hidden md:block">Fecha y hora</span>
          </div>
          <div className={`h-1 w-16 ${paso >= 3 ? 'bg-black' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center gap-2 ${paso >= 3 ? 'text-black' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${paso >= 3 ? 'bg-black text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="font-medium hidden md:block">Confirmar</span>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="toast error mb-4">⚠️ {error}</div>
      )}
      {message && (
        <div className="toast success mb-4">✅ {message}</div>
      )}

      {/* PASO 1: Selección de Servicio */}
      {paso === 1 && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Elegí tu servicio</h2>
            <p className="text-muted">Seleccioná el servicio que deseas</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {SERVICIOS.map((servicio) => (
              <div
                key={servicio.id}
                onClick={() => {
                  setServicioSeleccionado(servicio)
                  setPaso(2)
                }}
                className={`cursor-pointer transition-all ${
                  servicioSeleccionado?.id === servicio.id
                    ? 'ring-4 ring-black'
                    : 'hover:shadow-xl'
                } service-card-modern`}
              >
                <div className="service-header-modern">
                  <div>
                    <div className="service-name">{servicio.nombre}</div>
                    <div className="service-duration">⏱ {servicio.duracion}</div>
                  </div>
                  <div className="service-price">${servicio.precio.toLocaleString()}</div>
                </div>
                <div className="service-description">{servicio.descripcion}</div>
                <button className="btn-primary-modern w-full mt-4">
                  Seleccionar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PASO 2: Selección de Fecha y Hora */}
      {paso === 2 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2">Elegí fecha y horario</h2>
            <p className="text-muted">
              Servicio seleccionado: <strong>{servicioSeleccionado?.nombre}</strong>
            </p>
            <button
              onClick={() => setPaso(1)}
              className="text-sm text-blue-600 hover:underline mt-2"
            >
              ← Cambiar servicio
            </button>
          </div>

          <div className="card max-w-4xl mx-auto">
            {/* Calendario moderno */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-4">Seleccioná una fecha</h3>
              <div className="grid grid-cols-7 gap-2">
                {/* Encabezados de días */}
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia) => (
                  <div key={dia} className="text-center font-semibold text-sm text-gray-600 py-2">
                    {dia}
                  </div>
                ))}
                
                {/* Días del mes */}
                {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => {
                  const fecha = new Date(2025, 9, dia) // Octubre 2025
                  const esDomingo = fecha.getDay() === 0
                  const esHoy = dia === 18
                  const esPasado = dia < 18
                  
                  return (
                    <button
                      key={dia}
                      onClick={() => !esDomingo && !esPasado && setFechaSeleccionada(fecha)}
                      disabled={esDomingo || esPasado}
                      className={`
                        aspect-square rounded-lg font-medium transition-all
                        ${esDomingo || esPasado ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : ''}
                        ${esHoy && !esDomingo ? 'ring-2 ring-blue-500' : ''}
                        ${fechaSeleccionada?.getDate() === dia ? 'bg-black text-white' : ''}
                        ${!esDomingo && !esPasado && fechaSeleccionada?.getDate() !== dia ? 'hover:bg-gray-100' : ''}
                      `}
                    >
                      {dia}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Horarios disponibles */}
            {fechaSeleccionada && (
              <div>
                <h3 className="font-semibold text-lg mb-4">
                  Horarios disponibles para el {format(fechaSeleccionada, "d 'de' MMMM", { locale: es })}
                </h3>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  {generarHorarios().map((hora) => {
                    const ocupado = horariosOcupados.includes(hora)
                    return (
                      <button
                        key={hora}
                        onClick={() => !ocupado && setHoraSeleccionada(hora)}
                        disabled={ocupado}
                        className={`
                          py-3 px-4 rounded-lg font-medium transition-all
                          ${ocupado ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                          ${horaSeleccionada === hora ? 'bg-black text-white' : ''}
                          ${!ocupado && horaSeleccionada !== hora ? 'bg-white border-2 border-gray-200 hover:border-black' : ''}
                        `}
                      >
                        {hora}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {fechaSeleccionada && horaSeleccionada && (
              <button
                onClick={() => setPaso(3)}
                className="btn-primary-modern w-full mt-6"
              >
                Continuar →
              </button>
            )}
          </div>
        </div>
      )}

      {/* PASO 3: Datos del Cliente */}
      {paso === 3 && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2">Confirmá tus datos</h2>
            <button
              onClick={() => setPaso(2)}
              className="text-sm text-blue-600 hover:underline"
            >
              ← Cambiar fecha/hora
            </button>
          </div>

          <div className="card">
            {/* Resumen */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-3">📋 Resumen de tu reserva</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Servicio:</span>
                  <span className="font-semibold">{servicioSeleccionado?.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha:</span>
                  <span className="font-semibold">
                    {fechaSeleccionada && format(fechaSeleccionada, "EEEE d 'de' MMMM", { locale: es })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hora:</span>
                  <span className="font-semibold">{horaSeleccionada}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold text-lg">${servicioSeleccionado?.precio.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre completo *</label>
                <input
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  className="w-full p-3 border-2 rounded-lg"
                  value={contact.nombre}
                  onChange={(e) => setContact({ ...contact, nombre: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  placeholder="Ej: juan@ejemplo.com"
                  className="w-full p-3 border-2 rounded-lg"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">WhatsApp *</label>
                <input
                  type="tel"
                  placeholder="Ej: 11 2345-6789"
                  className="w-full p-3 border-2 rounded-lg"
                  value={contact.whatsapp}
                  onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                />
              </div>

              <button
                onClick={handleReserve}
                disabled={loading}
                className="btn-primary-modern w-full"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner"></span>
                    Reservando...
                  </span>
                ) : (
                  '✅ Confirmar Reserva'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
