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
    descripcion: 'Corte de cabello personalizado adaptado a tu estilo y preferencias',
    icono: '✂️'
  },
  {
    id: 'ritual-barba',
    nombre: 'Ritual de Barba',
    duracion: '45 min',
    precio: 32000,
    descripcion: 'Servicio personalizado con afeitado, toalla caliente y productos premium',
    icono: '🪒'
  },
  {
    id: 'corte-barba',
    nombre: 'Corte + Ritual de Barba',
    duracion: '1h 15min',
    precio: 38000,
    descripcion: 'Experiencia completa de barbería para un look impecable',
    icono: '💈'
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
  const [servicioSeleccionado, setServicioSeleccionado] = useState<any>(null)
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null)
  const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null)
  const [contact, setContact] = useState({ nombre: '', email: '', whatsapp: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([])
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

  const cambiarMes = (direccion: number) => {
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
        setError('Ese horario ya fue reservado. Elegí otro.')
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

      setMessage('¡Turno confirmado exitosamente!')
      
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
    <div style={{ minHeight: '100vh', background: 'var(--bg-light)', padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        {/* Progress Steps */}
        <div className="steps-container">
          <div className={paso >= 1 ? 'step active' : 'step inactive'}>
            <div className="step-number">{paso > 1 ? '✓' : '1'}</div>
            <span className="step-label">Servicio</span>
          </div>
          <div className="step-separator"></div>
          <div className={paso >= 2 ? 'step active' : 'step inactive'}>
            <div className="step-number">{paso > 2 ? '✓' : '2'}</div>
            <span className="step-label">Fecha y hora</span>
          </div>
          <div className="step-separator"></div>
          <div className={paso >= 3 ? 'step active' : 'step inactive'}>
            <div className="step-number">{paso > 3 ? '✓' : '3'}</div>
            <span className="step-label">Confirmar</span>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert-fresha alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="alert-fresha alert-success">
            <span>✅</span>
            <span>{message}</span>
          </div>
        )}

        {/* Paso 1: Selección de Servicio */}
        {paso === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                Elegí tu servicio
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>Selecciona el servicio que deseas reservar</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {SERVICIOS.map((servicio) => (
                <div
                  key={servicio.id}
                  onClick={() => {
                    setServicioSeleccionado(servicio)
                    setPaso(2)
                  }}
                  className="service-card-fresha"
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{servicio.icono}</div>
                  <h3 className="service-title">{servicio.nombre}</h3>
                  <p className="service-description">{servicio.descripcion}</p>
                  <div className="service-meta">
                    <span className="service-duration">⏱️ {servicio.duracion}</span>
                    <span className="service-price">${servicio.precio.toLocaleString()}</span>
                  </div>
                  <button className="btn-fresha btn-primary-fresha" style={{ width: '100%', marginTop: '1rem' }}>
                    Seleccionar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paso 2: Selección de Fecha y Hora */}
        {paso === 2 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                Elegí fecha y horario
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Servicio: <strong>{servicioSeleccionado?.nombre}</strong>
              </p>
              <button 
                onClick={() => setPaso(1)} 
                style={{ 
                  color: 'var(--primary)', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  textDecoration: 'underline'
                }}
              >
                Cambiar servicio
              </button>
            </div>

            <div className="calendar-container">
              <div className="calendar-header">
                <h3 className="calendar-month">
                  {format(mesActual, "MMMM yyyy", { locale: es })}
                </h3>
                <div className="calendar-nav">
                  <button onClick={() => cambiarMes(-1)}>←</button>
                  <button onClick={() => cambiarMes(1)}>→</button>
                </div>
              </div>

              <div className="calendar-weekdays">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia) => (
                  <div key={dia} className="calendar-weekday">{dia}</div>
                ))}
              </div>

              <div className="calendar-days">
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
                      className={`calendar-day ${esSeleccionado ? 'selected' : ''} ${deshabilitado ? 'disabled' : ''}`}
                    >
                      {dia.getDate()}
                    </button>
                  )
                })}
              </div>

              {fechaSeleccionada && (
                <div className="time-slots-container">
                  <h3 className="time-slots-title">
                    Horarios disponibles para el {format(fechaSeleccionada, "EEEE d 'de' MMMM", { locale: es })}
                  </h3>
                  <div className="time-slots-grid">
                    {generarHorarios(fechaSeleccionada).map((hora) => {
                      const ocupado = horariosOcupados.includes(hora)
                      return (
                        <button
                          key={hora}
                          onClick={() => !ocupado && setHoraSeleccionada(hora)}
                          disabled={ocupado}
                          className={`time-slot ${horaSeleccionada === hora ? 'selected' : ''} ${ocupado ? 'disabled' : ''}`}
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
                  className="btn-fresha btn-primary-fresha" 
                  style={{ width: '100%', marginTop: '2rem', padding: '1rem' }}
                >
                  Continuar →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Paso 3: Confirmación */}
        {paso === 3 && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                Confirma tus datos
              </h2>
              <button 
                onClick={() => setPaso(2)} 
                style={{ 
                  color: 'var(--primary)', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  textDecoration: 'underline'
                }}
              >
                Cambiar fecha/hora
              </button>
            </div>

            <div className="summary-card">
              <h3 className="summary-title">Resumen de tu reserva</h3>
              <div className="summary-row">
                <span className="summary-label">Servicio:</span>
                <span className="summary-value">{servicioSeleccionado?.nombre}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Fecha:</span>
                <span className="summary-value">
                  {fechaSeleccionada && format(fechaSeleccionada, "EEEE d 'de' MMMM", { locale: es })}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Hora:</span>
                <span className="summary-value">{horaSeleccionada} hs</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Total:</span>
                <span className="summary-total">${servicioSeleccionado?.precio.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div className="input-group">
                <label className="input-label">Nombre completo *</label>
                <input
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  className="input-fresha"
                  value={contact.nombre}
                  onChange={(e) => setContact({ ...contact, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Email *</label>
                <input
                  type="email"
                  placeholder="Ej: juan@ejemplo.com"
                  className="input-fresha"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">WhatsApp *</label>
                <input
                  type="tel"
                  placeholder="Ej: 11 2345-6789"
                  className="input-fresha"
                  value={contact.whatsapp}
                  onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                  required
                />
              </div>

              <button
                onClick={handleReserve}
                disabled={loading}
                className="btn-fresha btn-primary-fresha"
                style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <div className="spinner"></div>
                    Reservando...
                  </span>
                ) : (
                  `Confirmar turno - ${fechaSeleccionada && format(fechaSeleccionada, "EEEE", { locale: es })} ${horaSeleccionada} hs`
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
