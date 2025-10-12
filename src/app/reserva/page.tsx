'use client'
import { useState } from 'react'
import CalendarPicker from '@/components/CalendarPicker'
import { supabase } from '@/lib/supabase'

export default function Reserva() {
  const [slot, setSlot] = useState<Date | null>(null)
  const [contact, setContact] = useState({ nombre:'', email:'', whatsapp:'' })
  const [loading, setLoading] = useState(false)

  const handleReserve = async () => {
    if (!slot) return alert('Seleccioná un horario')
    setLoading(true)
    // Guardar cliente si no existe (simplificado) y guardar turno
    const fecha = slot.toISOString().split('T')[0]
    const hora = slot.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
    // Inserta un registro en turnos
    const { error } = await supabase.from('turnos').insert([{ nombre_cliente: contact.nombre, email: contact.email, whatsapp: contact.whatsapp, fecha, hora }])
    if (error) alert(error.message)
    else alert('Turno reservado: ' + fecha + ' ' + hora)
    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Reservar Turno</h2>
      <CalendarPicker onSelectSlot={(d)=>setSlot(d)} />
      <div className="card">
        <h3 className="font-semibold mb-2">Tus datos</h3>
        <input placeholder="Nombre" className="w-full p-2 border rounded mb-2" value={contact.nombre} onChange={e=>setContact({...contact, nombre:e.target.value})} />
        <input placeholder="Email" className="w-full p-2 border rounded mb-2" value={contact.email} onChange={e=>setContact({...contact, email:e.target.value})} />
        <input placeholder="WhatsApp" className="w-full p-2 border rounded mb-4" value={contact.whatsapp} onChange={e=>setContact({...contact, whatsapp:e.target.value})} />
        <button onClick={handleReserve} className="btn-primary bg-black text-white w-full py-2 rounded" disabled={loading}>{loading ? 'Reservando...' : 'Confirmar Turno'}</button>
      </div>
    </div>
  )
}
