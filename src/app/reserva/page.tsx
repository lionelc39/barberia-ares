// Archivo: src/app/reserva/page.tsx
// Reemplaza todo el contenido del archivo actual

'use client'
import { useState, useEffect } from 'react'
import CalendarPicker from '@/components/CalendarPicker'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

export default function Reserva() {
  const router = useRouter()
  const [slot, setSlot] = useState<Date | null>(null)
  const [contact, setContact] = useState({ 
    nombre: '', 
    email: '', 
    whatsapp: '' 
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)

  // Verificar si el usuario está logueado
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        // Si está logueado, buscar sus datos en la tabla clientes
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

  // Validar formulario
  const validarFormulario = () => {
    if (!slot) {
      setError('Por favor, seleccioná un horario')
      return false
    }
    if (!contact.nombre.trim()) {
      setError('Por favor, ingresá tu nombre')
      return false
    }
    if (!contact.email.trim()) {
      setError('Por favor, ingresá tu email')
      return false
    }
    if (!contact.whatsapp.trim()) {
      setError('Por favor, ingresá tu WhatsApp')
      return false
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(contact.email)) {
      setError('Por favor, ingresá un email válido')
      return false
    }
    
    return true
  }

  // Enviar email de confirmación
  const enviarEmailConfirmacion = async (datosReserva: any) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: contact.email,
          tipo: 'confirmacion_turno',
          datos: {
            nombre: contact.nombre,
            fecha: datosReserva.fecha_formatted,
            hora: datosReserva.hora,
            whatsapp: contact.whatsapp
          }
        })
      })

      if (!response.ok) {
        console.error('Error al enviar email:', await response.text())
      }
    } catch (error) {
      console.error('Error al enviar email:', error)
      // No bloqueamos la reserva si falla el email
    }
  }

  // Manejar la reserva
  const handleReserve = async () => {
    // Limpiar mensajes anteriores
    setError('')
    setMessage('')

    // Validar
    if (!validarFormulario()) {
      return
    }

    setLoading(true)

    try {
      // Formatear fecha y hora
      const fecha = slot!.toISOString().split('T')[0]
      const hora = slot!.toLocaleTimeString('es-AR', {
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      })

      // Verificar si el horario sigue disponible
      const { data: turnoExistente } = await supabase
        .from('turnos')
        .select('id')
        .eq('fecha', fecha)
        .eq('hora', hora)
        .single()

      if (turnoExistente) {
        setError('Lo sentimos, ese horario ya fue reservado. Por favor, elegí otro.')
        setLoading(false)
        return
      }

      // Buscar si el cliente ya existe
      let cliente_id = null
      if (user) {
        const { data: clienteExistente } = await supabase
          .from('clientes')
          .select('id')
          .eq('email', contact.email)
          .single()
        
        if (clienteExistente) {
          cliente_id = clienteExistente.id
        }
      }

      // Insertar el turno
      const { data: nuevoTurno, error: errorTurno } = await supabase
        .from('turnos')
        .insert([{
          cliente_id: cliente_id,
          nombre_cliente: contact.nombre,
          email: contact.email,
          whatsapp: contact.whatsapp,
          fecha: fecha,
          hora: hora,
          estado: 'reservado'
        }])
        .select()
        .single()

      if (errorTurno) {
        throw errorTurno
      }

      // Formatear fecha para mostrar
      const fechaFormatted = format(slot!, "EEEE d 'de' MMMM", { locale: es })

      // Enviar email de confirmación (no esperamos a que termine)
      enviarEmailConfirmacion({
        fecha_formatted: fechaFormatted,
        hora: hora
      })

      // Mostrar mensaje de éxito
      setMessage(`¡Turno confirmado! 🎉\n${fechaFormatted} a las ${hora}`)
      
      // Limpiar formulario
      setSlot(null)
      
      // Opcional: redirigir después de 3 segundos
      setTimeout(() => {
        router.push('/')
      }, 3000)

    } catch (error: any) {
      console.error('Error al reservar:', error)
      setError('Hubo un error al reservar tu turno. Por favor, intentá nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      {/* Encabezado */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-3">Reservar Turno</h2>
        <p className="text-muted">
          Elegí el día y horario que mejor te convenga
        </p>
      </div>

      {/* Mensajes de error/éxito */}
      {error && (
        <div className="toast error">
          ⚠️ {error}
        </div>
      )}

      {message && (
        <div className="toast success">
          ✅ {message}
        </div>
      )}

      {/* Selector de calendario */}
      <CalendarPicker onSelectSlot={(d) => {
        setSlot(d)
        setError('') // Limpiar error al seleccionar
      }} />

      {/* Formulario de datos */}
      <div className="card">
        <h3 className="section-title">Tus datos</h3>
        
        {!user && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <p className="text-sm">
              💡 <strong>Tip:</strong> Si ya tenés cuenta, 
              <a href="/login" className="font-semibold text-blue-700 hover:underline ml-1">
                iniciá sesión
              </a> para que tus datos se completen automáticamente.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Nombre completo *
            </label>
            <input
              type="text"
              placeholder="Ej: Juan Pérez"
              className="w-full"
              value={contact.nombre}
              onChange={(e) => setContact({ ...contact, nombre: e.target.value })}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email *
            </label>
            <input
              type="email"
              placeholder="Ej: juan@ejemplo.com"
              className="w-full"
              value={contact.email}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              WhatsApp * (con código de área)
            </label>
            <input
              type="tel"
              placeholder="Ej: 11 2345-6789"
              className="w-full"
              value={contact.whatsapp}
              onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
              disabled={loading}
            />
          </div>

          {/* Resumen de la reserva */}
          {slot && (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mt-4">
              <h4 className="font-semibold mb-2">📋 Resumen de tu reserva:</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Fecha:</strong> {format(slot, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                </p>
                <p>
                  <strong>Hora:</strong> {slot.toLocaleTimeString('es-AR', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  })}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleReserve}
            className="btn-primary w-full"
            disabled={loading || !slot}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner"></span>
                Reservando...
              </span>
            ) : (
              '✅ Confirmar Turno'
            )}
          </button>

          <p className="text-xs text-muted text-center mt-2">
            Al confirmar, aceptás recibir un email de confirmación y recordatorios por WhatsApp.
          </p>
        </div>
      </div>

      {/* Información adicional */}
      <div className="card bg-gray-50">
        <h3 className="section-title">ℹ️ Información importante</h3>
        <ul className="space-y-2 text-sm text-muted">
          <li>✓ Llegá <strong>5 minutos antes</strong> de tu turno</li>
          <li>✓ Para cancelar o reprogramar, avisanos con <strong>24 horas de anticipación</strong></li>
          <li>✓ Recibirás un recordatorio 24 horas antes por email</li>
          <li>✓ Si tenés alguna duda, contactanos por WhatsApp</li>
        </ul>
      </div>
    </div>
  )
}
