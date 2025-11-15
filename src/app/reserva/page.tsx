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
  },
  {
    id: 'corte-jubilados',
    nombre: 'Corte Jubilados',
    duracion: '45 min',
    precio: 20000,
    descripcion: 'Corte especial con tarifa reducida para jubilados',
    icono: '👴'
  }
]

const BARBEROS = [
  {
    id: 'fab-12345',  // ⚠️ Debe coincidir con la tabla barberos
    nombre: 'Fabrizio',
    duracionTurno: 60,
    icono: '👨‍🦰'
  },
  {
    id: 'paul-67890',  // ⚠️ Debe coincidir con la tabla barberos
    nombre: 'Paul',
    duracionTurno: 30,
    icono: '👨‍🦱'
  }
]

const generarHorarios = (fecha: Date, barbero: any) => {
  const dia = fecha.getDay()
  if (dia === 0 || dia === 1) return []
  
  const horarios = []
  const intervalo = barbero?.duracionTurno || 30
  
  // Horarios de mañana: 10:00 - 13:00
  for (let h = 10; h < 13; h++) {
    for (let m = 0; m < 60; m += intervalo) {
      horarios.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
    }
  }
  
  // Horarios de tarde: 16:00 - 20:00
  for (let h = 16; h < 20; h++) {
    for (let m = 0; m < 60; m += intervalo) {
      horarios.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
    }
  }
  
  return horarios
}

export default function Reserva() {
  const router = useRouter()
  
  const [paso, setPaso] = useState(1)
  const [servicioSeleccionado, setServicioSeleccionado] = useState<any>(null)
  const [barberoSeleccionado, setBarberoSeleccionado] = useState<any>(null)
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null)
  const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null)
  const [contact, setContact] = useState({ nombre: '', email: '', whatsapp: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([])
  const [mesActual, setMesActual] = useState(new Date())
  const [user, setUser] = useState<any>(null)
  const [clienteData, setClienteData] = useState<any>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Cargar datos del usuario autenticado
  useEffect(() => {
    const loadUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        
        // Buscar datos del cliente en la tabla clientes
        const { data: cliente } = await supabase
          .from('clientes')
          .select('*')
          .eq('email', session.user.email)
          .single()
        
        if (cliente) {
          setClienteData(cliente)
          setContact({
            nombre: `${cliente.nombre} ${cliente.apellido}`,
            email: cliente.email,
            whatsapp: cliente.whatsapp
          })
        }
      }
    }
    
    loadUserData()
  }, [])

  useEffect(() => {
    if (fechaSeleccionada) {
      cargarHorariosOcupados()
    }
  }, [fechaSeleccionada])

  const cargarHorariosOcupados = async () => {
    if (!fechaSeleccionada || !barberoSeleccionado) return
    const fecha = fechaSeleccionada.toISOString().split('T')[0]
    const { data } = await supabase
      .from('turnos')
      .select('hora')
      .eq('fecha', fecha)
      .eq('barbero_id', barberoSeleccionado.id)
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

    if (!servicioSeleccionado || !barberoSeleccionado || !fechaSeleccionada || !horaSeleccionada) {
      setError('Por favor completá todos los pasos')
      return
    }

    // Validar campos solo si no hay usuario logueado
    if (!user) {
      // Validar que todos los campos estén completos
      if (!contact.nombre.trim() || !contact.email.trim() || !contact.whatsapp.trim()) {
        setError('Por favor, completá todos los campos antes de confirmar tu turno.')
        return
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(contact.email)) {
        setError('Por favor, ingresá un email válido (ejemplo: tu@email.com)')
        return
      }

      // Validar que el nombre tenga al menos 2 palabras (nombre y apellido)
      const nombreParts = contact.nombre.trim().split(' ')
      if (nombreParts.length < 2 || nombreParts.some(part => part.length < 2)) {
        setError('Por favor, ingresá tu nombre completo (nombre y apellido)')
        return
      }

      // Validar formato de WhatsApp (al menos 8 dígitos)
      const whatsappNumeros = contact.whatsapp.replace(/\D/g, '')
      if (whatsappNumeros.length < 8) {
        setError('Por favor, ingresá un número de WhatsApp válido')
        return
      }
    }

    setLoading(true)

    try {
      const fecha = fechaSeleccionada.toISOString().split('T')[0]

      const { data: turnoExistente } = await supabase
        .from('turnos')
        .select('id')
        .eq('fecha', fecha)
        .eq('hora', horaSeleccionada)
        .eq('barbero_id', barberoSeleccionado.id)
        .single()

      if (turnoExistente) {
        setError('Ese horario ya fue reservado con ese barbero. Elegí otro.')
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
          barbero_id: barberoSeleccionado.id,
          barbero_nombre: barberoSeleccionado.nombre,
          estado: 'reservado'
        }])

      if (errorTurno) throw errorTurno

      // Enviar email de confirmación
      try {
        const emailResponse = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: contact.email,
            tipo: 'confirmacion_turno',
            datos: {
              nombre: contact.nombre,
              servicio: servicioSeleccionado.nombre,
              fecha: format(fechaSeleccionada, "EEEE d 'de' MMMM 'de' yyyy", { locale: es }),
              hora: horaSeleccionada,
              whatsapp: contact.whatsapp,
              precio: servicioSeleccionado.precio,
              duracion: servicioSeleccionado.duracion
            }
          })
        })

        if (!emailResponse.ok) {
          console.error('Error al enviar email de confirmación')
        }
      } catch (emailError) {
        console.error('Error al enviar email:', emailError)
        // No bloqueamos la reserva si falla el email
      }

      setLoading(false)
      setShowSuccessModal(true)
      
      setTimeout(() => {
        router.push('/')
      }, 3000)

    } catch (error) {
      console.error('Error:', error)
      setError('Hubo un error al reservar. Intenta nuevamente.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-light)', padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        {/* Modal de Confirmación Exitosa */}
        {showSuccessModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{
              background: 'white',
              padding: '3rem',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              animation: 'slideIn 0.3s ease-out'
            }}>
              <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>✅</div>
              <h2 style={{ 
                fontSize: '2rem', 
                fontWeight: '700', 
                color: 'var(--primary)', 
                marginBottom: '1rem' 
              }}>
                ¡Tu turno ha sido confirmado!
              </h2>
              <p style={{ 
                fontSize: '1.125rem', 
                color: 'var(--text-muted)',
                marginBottom: '1.5rem',
                lineHeight: '1.6'
              }}>
                Recibirás un email de confirmación con todos los detalles de tu reserva.
              </p>
              <div style={{
                background: 'var(--bg-light)',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '1.5rem'
              }}>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <strong>Servicio:</strong> {servicioSeleccionado?.nombre}
                </p>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <strong>Barbero:</strong> {barberoSeleccionado?.nombre}
                </p>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <strong>Fecha:</strong> {fechaSeleccionada && format(fechaSeleccionada, "EEEE d 'de' MMMM", { locale: es })}
                </p>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                  <strong>Hora:</strong> {horaSeleccionada} hs
                </p>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Serás redirigido al inicio en unos segundos...
              </p>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="steps-container">
          <div className={paso >= 1 ? 'step active' : 'step inactive'}>
            <div className="step-number">{paso > 1 ? '✓' : '1'}</div>
            <span className="step-label">Servicio</span>
          </div>
          <div className="step-separator"></div>
          <div className={paso >= 2 ? 'step active' : 'step inactive'}>
            <div className="step-number">{paso > 2 ? '✓' : '2'}</div>
            <span className="step-label">Barbero</span>
          </div>
          <div className="step-separator"></div>
          <div className={paso >= 3 ? 'step active' : 'step inactive'}>
            <div className="step-number">{paso > 3 ? '✓' : '3'}</div>
            <span className="step-label">Fecha y hora</span>
          </div>
          <div className="step-separator"></div>
          <div className={paso >= 4 ? 'step active' : 'step inactive'}>
            <div className="step-number">{paso > 4 ? '✓' : '4'}</div>
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

        {/* Paso 2: Selección de Barbero */}
        {paso === 2 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                Elegí tu barbero
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
              {BARBEROS.map((barbero) => (
                <div
                  key={barbero.id}
                  onClick={() => {
                    setBarberoSeleccionado(barbero)
                    setPaso(3)
                  }}
                  className="service-card-fresha"
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{barbero.icono}</div>
                  <h3 className="service-title">{barbero.nombre}</h3>
                  <p className="service-description">
                    Turnos cada {barbero.duracionTurno} minutos
                  </p>
                  <button className="btn-fresha btn-primary-fresha" style={{ width: '100%', marginTop: '1rem' }}>
                    Seleccionar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paso 3: Selección de Fecha y Hora */}
        {paso === 3 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                Elegí fecha y horario
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Servicio: <strong>{servicioSeleccionado?.nombre}</strong>
              </p>
              <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Barbero: <strong>{barberoSeleccionado?.nombre}</strong> (Turnos de {barberoSeleccionado?.duracionTurno} min)
              </p>
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
                Cambiar barbero
              </button>
            </div>

            {/* Aviso de seña */}
            <div style={{
              background: '#fef3c7',
              border: '2px solid #f59e0b',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <span style={{ fontSize: '2rem' }}>⚠️</span>
              <div>
                <p style={{ fontSize: '1rem', fontWeight: '600', color: '#92400e', marginBottom: '0.5rem' }}>
                  Seña obligatoria
                </p>
                <p style={{ fontSize: '0.9rem', color: '#78350f' }}>
                  Tu turno queda confirmado únicamente una vez abonada la seña correspondiente.
                </p>
              </div>
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
                    {generarHorarios(fechaSeleccionada, barberoSeleccionado).map((hora) => {
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
                  onClick={() => setPaso(4)} 
                  className="btn-fresha btn-primary-fresha" 
                  style={{ width: '100%', marginTop: '2rem', padding: '1rem' }}
                >
                  Continuar →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Paso 4: Confirmación */}
        {paso === 4 && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                Confirma tus datos
              </h2>
              <button 
                onClick={() => setPaso(3)} 
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

            {/* Aviso de seña en resumen */}
            <div style={{
              background: '#fef3c7',
              border: '2px solid #f59e0b',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '0.95rem', fontWeight: '600', color: '#92400e', marginBottom: '0.5rem' }}>
                ⚠️ Seña obligatoria
              </p>
              <p style={{ fontSize: '0.85rem', color: '#78350f' }}>
                Recordá que tu turno queda confirmado únicamente una vez abonada la seña correspondiente.
              </p>
            </div>

            <div className="summary-card">
              <h3 className="summary-title">Resumen de tu reserva</h3>
              <div className="summary-row">
                <span className="summary-label">Servicio:</span>
                <span className="summary-value">{servicioSeleccionado?.nombre}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Barbero:</span>
                <span className="summary-value">{barberoSeleccionado?.nombre}</span>
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
              {/* Mostrar mensaje si el usuario está logueado */}
              {user && clienteData && (
                <div style={{
                  background: '#dcfce7',
                  border: '1px solid #86efac',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>👤</span>
                  <div>
                    <p style={{ fontSize: '0.95rem', color: '#166534', fontWeight: '600', marginBottom: '0.25rem' }}>
                      Hola {clienteData.nombre}!
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#166534' }}>
                      Tus datos se completaron automáticamente
                    </p>
                  </div>
                </div>
              )}

              {/* Formulario solo si NO hay usuario logueado */}
              {!user && (
                <>
                  <div className="input-group">
                    <label className="input-label">Nombre completo *</label>
                    <input
                      type="text"
                      placeholder="Ej: Juan Pérez"
                      className="input-fresha"
                      value={contact.nombre}
                      onChange={(e) => setContact({ ...contact, nombre: e.target.value })}
                      required
                      minLength={5}
                      pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$"
                      title="Ingresá tu nombre y apellido completo"
                    />
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Ingresá tu nombre y apellido
                    </p>
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
                      pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                      title="Ingresá un email válido (ejemplo: tu@email.com)"
                    />
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Debe ser un email válido (ej: tu@email.com)
                    </p>
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
                      minLength={8}
                      pattern="[\d\s\-+()]{8,}"
                      title="Ingresá un número de WhatsApp válido (mínimo 8 dígitos)"
                    />
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Incluye código de área (mínimo 8 dígitos)
                    </p>
                  </div>
                </>
              )}

              {/* Si hay usuario, mostrar datos de forma readonly */}
              {user && clienteData && (
                <div style={{ 
                  background: 'var(--bg-light)', 
                  padding: '1.5rem', 
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    <strong>Nombre:</strong> {contact.nombre}
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    <strong>Email:</strong> {contact.email}
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <strong>WhatsApp:</strong> {contact.whatsapp}
                  </p>
                </div>
              )}

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
