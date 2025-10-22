'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

const SERVICIOS = [
  {
    id: 'corte-personalizado',
    nombre: 'Corte Personalizado',
    duracion: '45 min',
    precio: 28000,
    descripcion: 'Corte de cabello personalizado'
  },
  {
    id: 'ritual-barba',
    nombre: 'Ritual de Barba',
    duracion: '45 min',
    precio: 32000,
    descripcion: 'Afeitado profesional con toallas calientes'
  },
  {
    id: 'corte-barba',
    nombre: 'Corte + Ritual de Barba',
    duracion: '1h 15min',
    precio: 38000,
    descripcion: 'Experiencia completa de barberia'
  }
]

const generarHorarios = (fecha: Date) => {
  const dia = fecha.getDay()
  if (dia === 0 || dia === 1) return []
  
  const horarios = []
  for (let h = 10; h < 13; h++) {
    for (let m of [0, 30]) {
      horarios.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
    }
  }
  for (let h = 16; h < 20; h++) {
    for (let m of [0, 30]) {
      horarios.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
    }
  }
  return horarios
}

export default function Reserva() {
  const router = useRouter()
  
  const [paso, setPaso] = useState(1)
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null)
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null)
  const [horaSeleccionada, setHoraSeleccionada] = useState(null)
  const [contact, setContact] = useState({ nombre: '', email: '', whatsapp: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [horariosOcupados, setHorariosOcupados] = useState([])
  const [mesActual, setMesActual] = useState(new Date())

  useEffect(() => {
    if (fechaSeleccionada) {
      cargarHorariosOcupados()
    }
  }, [fechaSeleccionada])

  const cargarHorariosOcupados = async () => {
    if (!fechaSeleccionada) return
    const fecha = fechaSeleccionada.toISOString().split('T')[0]
    const { data } = await supabase.from('turnos').select('hora').eq('fecha', fecha)
    setHorariosOcupados((data || []).map((r) => r.hora))
  }

  const getDiasDelMes = () => {
    const year = mesActual.getFullYear()
    const month = mesActual.getMonth()
    const primerDia = new Date(year, month, 1)
    const ultimoDia = new Date(year, month + 1, 0)
    const dias = []
    for (let i = 0; i < primerDia.getDay(); i++) {
      dias.push(null)
    }
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      dias.push(new Date(year, month, dia))
    }
    return dias
  }

  const cambiarMes = (direccion) => {
    const nuevoMes = new Date(mesActual)
    nuevoMes.setMonth(mesActual.getMonth() + direccion)
    setMesActual(nuevoMes)
  }

  const handleReserve = async () => {
    setError('')
    setMessage('')

    if (!servicioSeleccionado || !fechaSeleccionada || !horaSeleccionada) {
      setError('Por favor completa todos los pasos')
      return
    }

    if (!contact.nombre.trim() || !contact.email.trim() || !contact.whatsapp.trim()) {
      setError('Por favor completa todos tus datos')
      return
    }

    setLoading(true)

    try {
      const fecha = fechaSeleccionada.toISOString().split('T')[0]

      const { data: turnoExistente } = await supabase
        .from('turnos')
        .select('id')
        .eq('fecha', fecha)
        .eq('hora', horaSeleccionada)
        .single()

      if (turnoExistente) {
        setError('Ese horario ya fue reservado. Elegi otro.')
        setLoading(false)
        return
      }

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

      setMessage('Turno confirmado!')
      
      setTimeout(() => {
        router.push('/')
      }, 2000)

    } catch (error) {
      console.error('Error:', error)
      setError('Hubo un error al reservar. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className={paso >= 1 ? 'step-active' : 'step-inactive'}>
            <div className="step-number">{paso >= 1 ? '✓' : '1'}</div>
            <span className="hidden md:block">Servicio</span>
          </div>
          <div className={paso >= 2 ? 'line-active' : 'line-inactive'}></div>
          <div className={paso >= 2 ? 'step-active' : 'step-inactive'}>
            <div className="step-number">{paso >= 2 ? '✓' : '2'}</div>
            <span className="hidden md:block">Fecha y hora</span>
          </div>
          <div className={paso >= 3 ? 'line-active' : 'line-inactive'}></div>
          <div className={paso >= 3 ? 'step-active' : 'step-inactive'}>
            <div className="step-number">{paso >= 3 ? '✓' : '3'}</div>
            <span className="hidden md:block">Confirmar</span>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">{error}</div>}
      {message && <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">{message}</div>}

      {paso === 1 && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Elegi tu servicio</h2>
            <p className="text-muted">Selecciona el servicio que deseas</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {SERVICIOS.map((servicio) => (
              <div
                key={servicio.id}
                onClick={() => {
                  setServicioSeleccionado(servicio)
                  setPaso(2)
                }}
                className="card cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-black"
              >
                <h3 className="text-xl font-bold mb-2">{servicio.nombre}</h3>
                <p className="text-muted text-sm mb-3">{servicio.descripcion}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm bg-blue-100 px-3 py-1 rounded">{servicio.duracion}</span>
                  <span className="text-xl font-bold">${servicio.precio.toLocaleString()}</span>
                </div>
                <button className="btn-primary w-full">Seleccionar</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {paso === 2 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2">Elegi fecha y horario</h2>
            <p className="text-muted">Servicio: {servicioSeleccionado?.nombre}</p>
            <button onClick={() => setPaso(1)} className="text-sm text-blue-600 hover:underline mt-2">
              Cambiar servicio
            </button>
          </div>

          <div className="card max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {format(mesActual, "MMMM yyyy", { locale: es })}
              </h3>
              <div className="flex gap-2">
                <button onClick={() => cambiarMes(-1)} className="px-4 py-2 border rounded hover:bg-gray-100">←</button>
                <button onClick={() => cambiarMes(1)} className="px-4 py-2 border rounded hover:bg-gray-100">→</button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map((dia) => (
                <div key={dia} className="text-center font-semibold text-sm">{dia}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {getDiasDelMes().map((dia, index) => {
                if (!dia) return <div key={index}></div>

                const hoy = new Date()
                hoy.setHours(0, 0, 0, 0)
                const esPasado = dia < hoy
                const esDomingo = dia.getDay() === 0
                const esLunes = dia.getDay() === 1
                const esSeleccionado = fechaSeleccionada?.toDateString() === dia.toDateString()
                const deshabilitado = esPasado || esDomingo || esLunes

                return (
                  <button
                    key={index}
                    onClick={() => !deshabilitado && setFechaSeleccionada(dia)}
                    disabled={deshabilitado}
                    className={`aspect-square rounded-lg font-medium transition-all ${
                      esSeleccionado ? 'bg-black text-white' : ''
                    } ${deshabilitado ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                  >
                    {dia.getDate()}
                  </button>
                )
              })}
            </div>

            {fechaSeleccionada && (
              <div className="mt-6">
                <h3 className="font-bold mb-3">
                  Horarios para el {format(fechaSeleccionada, "d 'de' MMMM", { locale: es })}
                </h3>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  {generarHorarios(fechaSeleccionada).map((hora) => {
                    const ocupado = horariosOcupados.includes(hora)
                    return (
                      <button
                        key={hora}
                        onClick={() => !ocupado && setHoraSeleccionada(hora)}
                        disabled={ocupado}
                        className={`py-3 rounded-lg font-medium transition-all ${
                          horaSeleccionada === hora ? 'bg-black text-white' : ''
                        } ${ocupado ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'border-2 hover:border-black'}`}
                      >
                        {hora}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {fechaSeleccionada && horaSeleccionada && (
              <button onClick={() => setPaso(3)} className="btn-primary w-full mt-6">
                Continuar
              </button>
            )}
          </div>
        </div>
      )}

      {paso === 3 && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2">Confirma tus datos</h2>
            <button onClick={() => setPaso(2)} className="text-sm text-blue-600 hover:underline">
              Cambiar fecha/hora
            </button>
          </div>

          <div className="card">
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-bold mb-3">Resumen de tu reserva</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Servicio:</span>
                  <strong>{servicioSeleccionado?.nombre}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Fecha:</span>
                  <strong>{fechaSeleccionada && format(fechaSeleccionada, "EEEE d 'de' MMMM", { locale: es })}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Hora:</span>
                  <strong>{horaSeleccionada} hs</strong>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span>Total:</span>
                  <strong className="text-lg">${servicioSeleccionado?.precio.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre completo</label>
                <input
                  type="text"
                  placeholder="Ej: Juan Perez"
                  className="w-full p-3 border-2 rounded-lg"
                  value={contact.nombre}
                  onChange={(e) => setContact({ ...contact, nombre: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  placeholder="Ej: juan@ejemplo.com"
                  className="w-full p-3 border-2 rounded-lg"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">WhatsApp</label>
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
                className="btn-primary w-full text-lg py-4"
              >
                {loading ? 'Reservando...' : `Confirmar Reserva - ${fechaSeleccionada && format(fechaSeleccionada, "EEEE", { locale: es })} ${horaSeleccionada} hs`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
