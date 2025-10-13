// src/app/reserva/page.tsx
'use client'
import { useState } from 'react'
import CalendarPicker from '@/components/CalendarPicker'
import { supabase } from '@/lib/supabase'

export default function Reserva(){
  const [slot, setSlot] = useState<Date | null>(null)
  const [contact, setContact] = useState({ nombre:'', email:'', whatsapp:'' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleReserve = async () => {
    if (!slot) return alert('Seleccioná un horario')
    setLoading(true)
    const fecha = slot.toISOString().split('T')[0]
    const hora = slot.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
    // Guardar (simplificado)
    const { error } = await supabase.from('turnos').insert([{ nombre_cliente: contact.nombre, email: contact.email, whatsapp: contact.whatsapp, fecha, hora }])
    if (error) {
      alert('Error: ' + error.message)
    } else {
      setMessage(`Turno reservado: ${fecha} ${hora}`)
      // Opcional: podrías redirigir a una página de confirmación
    }
    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-semibold">Reservar Turno</h2>

      <CalendarPicker onSelectSlot={(d)=>setSlot(d)} />

      <div className="card">
        <h3 className="font-medium mb-3">Tus datos</h3>
        <input placeholder="Nombre" className="w-full p-3 border rounded mb-2" value={contact.nombre} onChange={e=>setContact({...contact, nombre:e.target.value})} />
        <input placeholder="Email" className="w-full p-3 border rounded mb-2" value={contact.email} onChange={e=>setContact({...contact, email:e.target.value})} />
        <input placeholder="WhatsApp" className="w-full p-3 border rounded mb-4" value={contact.whatsapp} onChange={e=>setContact({...contact, whatsapp:e.target.value})} />
        <button onClick={handleReserve} className="btn-primary w-full" disabled={loading}>{loading ? <span className="spinner" /> : 'Confirmar Turno'}</button>

        {message && <div className="mt-4 toast success">{message}</div>}
      </div>
    </div>
  )
}
