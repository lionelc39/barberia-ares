'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

// ✅ ACTUALIZACIÓN 1: Servicios con nuevos precios
const SERVICIOS = [
  {
    id: 'corte-personalizado',
    nombre: 'Corte Personalizado',
    duracion: '45 min',
    precio: 17000, // ✅ Actualizado de 28000 a 17000
    descripcion: 'Corte de cabello personalizado adaptado a tu estilo y preferencias',
    icono: '✂️'
  },
  {
    id: 'recorte-barba-maquinas',
    nombre: 'Corte y Recorte de Barba con Máquinas',
    duracion: '45 min',
    precio: 19000, // ✅ Nuevo servicio
    descripcion: 'Corte de cabello y recorte de barba con máquinas',
    icono: '💈'
  },
  {
    id: 'corte-jubilados',
    nombre: 'Corte Jubilados',
    duracion: '45 min',
    precio: 10000, // ✅ Actualizado de 20000 a 10000
    descripcion: 'Corte especial con tarifa reducida para jubilados',
    icono: '👴'
  },
  {
    id: 'arreglo-barba',
    nombre: 'Arreglo de Barba',
    duracion: '30 min',
    precio: 15000, // ✅ Nuevo servicio
    descripcion: 'Perfilado y arreglo profesional de barba',
    icono: '🪒'
  },
  {
    id: 'corte-ritual-barba',
    nombre: 'Corte + Ritual de Barba',
    duracion: '1h 15min',
    precio: 22000, // ✅ Actualizado de 38000 a 22000
    descripcion: 'Experiencia completa: corte de cabello y ritual de barba premium',
    icono: '💈'
  }
]

// ✅ ACTUALIZACIÓN 2: Solo Fabrizio disponible (Paul oculto)
const BARBEROS = [
  {
    id: 'fab-12345',
    nombre: 'Fabrizio',
    duracionTurno: 60,
    icono: '👨‍🦰',
    activo: true // ✅ Activo
  },
  {
    id: 'paul-67890',
    nombre: 'Paul',
    duracionTurno: 30,
    icono: '👨‍🦱',
    activo: false // ✅ OCULTO - Se puede reactivar cambiando a true
  }
].filter(b => b.activo) // ✅ Solo mostrar barberos activos

// ✅ ACTUALIZACIÓN 3: Horarios actualizados
const generarHorarios = (fecha: Date, barbero: any) => {
  const dia = fecha.getDay()
  
  // 0 = Domingo (cerrado)
  if (dia === 0) return []
  
  const horarios = []
  const intervalo = barbero?.duracionTurno || 30
  
  // ✅ Lunes (1): 16 a 20 hs
  if (dia === 1) {
    for (let h = 16; h < 20; h++) {
      for (let m = 0; m < 60; m += intervalo) {
        horarios.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
      }
    }
  }
  
  // ✅ Martes a Jueves (2-4): 10 a 12:30 y 16 a 20 hs
  else if (dia >= 2 && dia <= 4) {
    // Mañana: 10:00 - 12:30
    for (let h = 10; h < 12; h++) {
      for (let m = 0; m < 60; m += intervalo) {
        horarios.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
      }
    }
    // 12:00 y 12:30 si corresponde
    if (intervalo === 30) {
      horarios.push('12:00')
      horarios.push('12:30')
    }
    
    // Tarde: 16:00 - 20:00
    for (let h = 16; h < 20; h++) {
      for (let m = 0; m < 60; m += intervalo) {
        horarios.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
      }
    }
  }
  
  // ✅ Viernes y Sábado (5-6): 10 a 20 hs corrido
  else if (dia === 5 || dia === 6) {
    for (let h = 10; h < 20; h++) {
      for (let m = 0; m < 60; m += intervalo) {
        horarios.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
      }
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

  const handleReserve = async () => {
    console.log('🔵 ===== INICIO RESERVA =====')
    setError('')
    setMessage('')

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

      console.log('🔵 Verificando si el cliente existe en la BD...')
      
      let clienteId = null
      
      if (user) {
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
          console.log('✅ Cliente ya existe, ID:', clienteExistente.id)
          clienteId = clienteExistente.id
        } else {
          console.log('⚠️ Usuario autenticado sin registro en clientes, creando...')
          
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
      } else {
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

      const montoSena = Math.round(servicioSeleccionado.precio * 0.30)
      console.log('🔵 Seña calculada (30%):', montoSena)

      const datosInsert = {
        cliente_id: clienteId,
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
        {/* Modal de Confirmación Exitosa - ✅ ACTUALIZACIÓN 4: Mensaje de spam añadido */}
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
                marginBottom: '1rem',
                lineHeight: '1.6'
              }}>
                Recibirás un email de confirmación con todos los detalles de tu reserva.
              </p>
              
              {/* ✅ ACTUALIZACIÓN: Mensaje de spam */}
              <div style={{
                background: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: '#92400e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}>
                  <span>📧</span>
                  <span>Si no recibís el correo de confirmación, por favor revisá tu casilla de spam o correo no deseado.</span>
                </p>
              </div>

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
                  const esSeleccionado = fechaSeleccionada?.toDateString() === dia.toDateString()
                  const deshabilitado = esPasado || esDomingo

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
