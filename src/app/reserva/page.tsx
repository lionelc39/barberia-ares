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
    id: 'fab-12345',
    nombre: 'Fabrizio',
    duracionTurno: 60,
    icono: '👨‍🦰'
  },
  {
    id: 'paul-67890',
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
      console.log('🔵 Cargando datos del usuario...')
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        console.log('✅ Usuario autenticado:', session.user.email)
        setUser(session.user)
        
        // Buscar datos del cliente en la tabla clientes
        const { data: cliente, error: clienteError } = await supabase
          .from('clientes')
          .select('*')
          .eq('email', session.user.email)
          .single()
        
        if (clienteError) {
          console.warn('⚠️ Cliente no encontrado en DB:', clienteError)
        } else if (cliente) {
          console.log('✅ Datos del cliente cargados:', cliente.nombre, cliente.apellido)
          setClienteData(cliente)
          setContact({
            nombre: `${cliente.nombre} ${cliente.apellido}`,
            email: cliente.email,
            whatsapp: cliente.whatsapp
          })
        }
      } else {
        console.log('🔵 Usuario no autenticado')
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
    
    console.log('🔵 Cargando horarios ocupados...')
    const fecha = fechaSeleccionada.toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('turnos')
      .select('hora')
      .eq('fecha', fecha)
      .eq('barbero_id', barberoSeleccionado.id)
    
    if (error) {
      console.error('❌ Error al cargar horarios ocupados:', error)
    } else {
      console.log('✅ Horarios ocupados cargados:', data?.length || 0)
      setHorariosOcupados((data || []).map((r) => r.hora))
    }
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

// ✅ REEMPLAZAR la función handleReserve() completa en src/app/reserva/page.tsx
const handleReserve = async () => {
  console.log('🔵 ===== INICIO RESERVA =====')
  setError('')
  setMessage('')

  // 1. VALIDACIÓN DE PASOS
  if (!servicioSeleccionado || !barberoSeleccionado || !fechaSeleccionada || !horaSeleccionada) {
    console.error('❌ Faltan datos:', {
      servicio: servicioSeleccionado?.nombre,
      barbero: barberoSeleccionado?.nombre,
      fecha: fechaSeleccionada,
      hora: horaSeleccionada
    })
    setError('Por favor completá todos los pasos')
    return
  }

  console.log('✅ Todos los pasos completados')

  // 2. VALIDAR CAMPOS DE CONTACTO
  if (!contact.nombre.trim() || !contact.email.trim() || !contact.whatsapp.trim()) {
    console.error('❌ Campos vacíos:', contact)
    setError('Por favor, completá todos los campos antes de confirmar tu turno.')
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(contact.email)) {
    console.error('❌ Email inválido:', contact.email)
    setError('Por favor, ingresá un email válido (ejemplo: tu@email.com)')
    return
  }

  const nombreParts = contact.nombre.trim().split(' ')
  if (nombreParts.length < 2 || nombreParts.some(part => part.length < 2)) {
    console.error('❌ Nombre incompleto:', contact.nombre)
    setError('Por favor, ingresá tu nombre completo (nombre y apellido)')
    return
  }

  const whatsappNumeros = contact.whatsapp.replace(/\D/g, '')
  if (whatsappNumeros.length < 8) {
    console.error('❌ WhatsApp inválido:', contact.whatsapp)
    setError('Por favor, ingresá un número de WhatsApp válido')
    return
  }

  console.log('✅ Validación de campos OK')
  setLoading(true)

  try {
    const fecha = fechaSeleccionada.toISOString().split('T')[0]
    console.log('🔵 Fecha formateada:', fecha)

    // 3. VERIFICAR DISPONIBILIDAD
    console.log('🔵 Verificando disponibilidad del horario...')
    const { data: turnoExistente, error: errorCheck } = await supabase
      .from('turnos')
      .select('id')
      .eq('fecha', fecha)
      .eq('hora', horaSeleccionada)
      .eq('barbero_id', barberoSeleccionado.id)
      .maybeSingle()

    if (errorCheck) {
      console.error('❌ Error al verificar disponibilidad:', errorCheck)
      throw new Error(`Error al verificar disponibilidad: ${errorCheck.message}`)
    }

    if (turnoExistente) {
      console.error('❌ Turno ya existe:', turnoExistente.id)
      setError('Ese horario ya fue reservado con ese barbero. Elegí otro.')
      setLoading(false)
      return
    }

    console.log('✅ Horario disponible')

    // ✅ NUEVO: 4. ASEGURAR QUE EL CLIENTE EXISTA EN LA TABLA
    console.log('🔵 Verificando si el cliente existe en la BD...')
    
    let clienteId = null
    
    // Si hay usuario logueado, buscar su ID
    if (user) {
      const { data: clienteExistente, error: errorCliente } = await supabase
        .from('clientes')
        .select('id')
        .eq('email', contact.email)
        .maybeSingle()
      
      if (errorCliente && errorCliente.code !== 'PGRST116') { // PGRST116 = not found (normal)
        console.error('❌ Error al buscar cliente:', errorCliente)
        throw new Error('Error al verificar datos del cliente')
      }

      if (clienteExistente) {
        console.log('✅ Cliente ya existe, ID:', clienteExistente.id)
        clienteId = clienteExistente.id
      } else {
        // Cliente autenticado pero no está en la tabla (caso raro, pero posible)
        console.log('⚠️ Usuario autenticado sin registro en clientes, creando...')
        
        const [nombre, ...apellidoParts] = contact.nombre.trim().split(' ')
        const apellido = apellidoParts.join(' ')
        
        const { data: nuevoCliente, error: errorInsertCliente } = await supabase
          .from('clientes')
          .insert([{
            nombre: nombre,
            apellido: apellido || nombre, // Si no hay apellido, usar nombre
            dni: '', // No lo tenemos en este punto
            email: contact.email,
            whatsapp: contact.whatsapp
          }])
          .select('id')
          .single()
        
        if (errorInsertCliente) {
          console.error('❌ Error al crear cliente:', errorInsertCliente)
          throw new Error('Error al registrar tus datos')
        }
        
        clienteId = nuevoCliente.id
        console.log('✅ Cliente creado, ID:', clienteId)
      }
    } else {
      // Usuario NO logueado, verificar si existe por email
      console.log('🔵 Usuario sin login, buscando por email...')
      
      const { data: clienteExistente, error: errorCliente } = await supabase
        .from('clientes')
        .select('id')
        .eq('email', contact.email)
        .maybeSingle()
      
      if (errorCliente && errorCliente.code !== 'PGRST116') {
        console.error('❌ Error al buscar cliente:', errorCliente)
        throw new Error('Error al verificar datos del cliente')
      }

      if (clienteExistente) {
        console.log('✅ Cliente encontrado por email, ID:', clienteExistente.id)
        clienteId = clienteExistente.id
      } else {
        // Cliente no existe, crearlo
        console.log('🔵 Cliente nuevo, creando registro...')
        
        const [nombre, ...apellidoParts] = contact.nombre.trim().split(' ')
        const apellido = apellidoParts.join(' ')
        
        const { data: nuevoCliente, error: errorInsertCliente } = await supabase
          .from('clientes')
          .insert([{
            nombre: nombre,
            apellido: apellido || nombre,
            dni: '',
            email: contact.email,
            whatsapp: contact.whatsapp
          }])
          .select('id')
          .single()
        
        if (errorInsertCliente) {
          console.error('❌ Error al crear cliente:', errorInsertCliente)
          throw new Error('Error al registrar tus datos')
        }
        
        clienteId = nuevoCliente.id
        console.log('✅ Cliente creado, ID:', clienteId)
      }
    }

    // 5. CALCULAR SEÑA
    const montoSena = Math.round(servicioSeleccionado.precio * 0.30)
    console.log('🔵 Seña calculada (30%):', montoSena)

    // 6. PREPARAR DATOS DEL TURNO
    const datosInsert = {
      cliente_id: clienteId, // ✅ AHORA SÍ TIENE ID VÁLIDO
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
      estado: 'reservado',
      monto_sena: montoSena,
      sena_pagada: false
    }

    console.log('🔵 Datos a insertar:', JSON.stringify(datosInsert, null, 2))

    // 7. INSERTAR TURNO EN LA BASE DE DATOS
    console.log('🔵 Insertando turno...')
    const { data: turnoCreado, error: errorTurno } = await supabase
      .from('turnos')
      .insert([datosInsert])
      .select()
      .single()

    if (errorTurno) {
      console.error('❌ Error al insertar turno:', errorTurno)
      throw new Error(`Error al crear turno: ${errorTurno.message}`)
    }

    console.log('✅ Turno creado exitosamente:', turnoCreado)

    // 8. ENVIAR EMAIL (sin bloquear)
    console.log('🔵 Enviando email de confirmación...')
    
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: contact.email,
        tipo: 'confirmacion_turno',
        datos: {
          nombre: contact.nombre,
          servicio: servicioSeleccionado.nombre,
          barbero: barberoSeleccionado.nombre,
          fecha: format(fechaSeleccionada, "EEEE d 'de' MMMM 'de' yyyy", { locale: es }),
          hora: horaSeleccionada,
          whatsapp: contact.whatsapp,
          precio: servicioSeleccionado.precio,
          duracion: servicioSeleccionado.duracion,
          monto_sena: montoSena
        }
      })
    })
    .then(async (res) => {
      if (res.ok) {
        console.log('✅ Email enviado correctamente')
      } else {
        const errorData = await res.json()
        console.warn('⚠️ Error al enviar email (no crítico):', errorData)
      }
    })
    .catch(err => {
      console.warn('⚠️ Error en envío de email (no crítico):', err)
    })

    // 9. MOSTRAR ÉXITO
    console.log('✅ ===== RESERVA COMPLETADA =====')
    setLoading(false)
    setShowSuccessModal(true)
    
    setTimeout(() => {
      console.log('🔵 Redirigiendo al inicio...')
      router.push('/')
    }, 3000)

  } catch (error: any) {
    console.error('💥 ===== ERROR CRÍTICO =====')
    console.error('💥 Tipo:', error.constructor.name)
    console.error('💥 Mensaje:', error.message)
    console.error('💥 Stack:', error.stack)
    
    let mensajeError = 'Hubo un error al reservar. Intenta nuevamente.'
    
    if (error.message.includes('fetch')) {
      mensajeError = 'Error de conexión. Verificá tu internet e intentá nuevamente.'
    } else if (error.message.includes('permission')) {
      mensajeError = 'Error de permisos. Contactá al administrador.'
    } else if (error.message.includes('foreign key')) {
      mensajeError = 'Error de configuración. El barbero seleccionado no existe en el sistema.'
    } else if (error.message.includes('relation')) {
      mensajeError = 'Error de base de datos. La tabla de turnos no está configurada.'
    }
    
    setError(mensajeError)
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
                    console.log('🔵 Servicio seleccionado:', servicio.nombre)
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
                    console.log('🔵 Barbero seleccionado:', barbero.nombre)
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
                      onClick={() => {
                        if (!deshabilitado) {
                          console.log('🔵 Fecha seleccionada:', dia.toISOString().split('T')[0])
                          setFechaSeleccionada(dia)
                        }
                      }}
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
                          onClick={() => {
                            if (!ocupado) {
                              console.log('🔵 Hora seleccionada:', hora)
                              setHoraSeleccionada(hora)
                            }
                          }}
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
                  onClick={() => {
                    console.log('🔵 Avanzando al paso 4')
                    setPaso(4)
                  }}
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
