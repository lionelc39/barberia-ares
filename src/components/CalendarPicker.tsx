// src/components/CalendarPicker.tsx
'use client'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useState, useEffect } from 'react'
import { getAvailableSlots, isSlotAvailable } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

export default function CalendarPicker({ onSelectSlot }: { onSelectSlot: (d: Date) => void }) {
  const [date, setDate] = useState<Date | null>(new Date())
  const [selected, setSelected] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)
  const [busySlots, setBusySlots] = useState<string[]>([])

  useEffect(()=>{
    if (!date) return
    // cargar slots ocupados para la fecha (simple: consulta por fecha)
    const fetchBusy = async ()=>{
      const fecha = date.toISOString().split('T')[0]
      const { data } = await supabase.from('turnos').select('hora').eq('fecha', fecha)
      setBusySlots((data || []).map((r:any)=>r.hora))
    }
    fetchBusy()
  },[date])

  const slots = date ? getAvailableSlots(date) : []

  const handleSelect = async (s: Date) => {
    // hora formato 09:00
    const hora = s.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (busySlots.includes(hora)) { alert('Horario ocupado'); return }
    setSelected(s)
    onSelectSlot(s)
  }

  return (
    <div className="card">
      <h3 className="section-title">Seleccioná fecha y horario</h3>
      <div className="md:flex gap-6">
        <div className="md:w-1/2">
          <DatePicker
            selected={date}
            onChange={(d:any)=>setDate(d)}
            inline
            filterDate={(d)=>d.getDay() !== 0} /* bloquear domingos */
          />
        </div>
        <div className="md:w-1/2">
          <div>
            <h4 className="font-medium mb-2">Horarios</h4>
            <div className="grid grid-cols-3 gap-2">
              {slots.map((s, i) => {
                const hora = s.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit'})
                const busy = busySlots.includes(hora)
                return (
                  <button key={i} onClick={()=>handleSelect(s)} disabled={busy} className={`p-2 rounded ${busy ? 'bg-gray-100 text-muted' : (selected?.getTime()===s.getTime() ? 'bg-black text-white' : 'bg-white border')}`}>
                    {hora}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="text-sm text-muted mt-3">Mostrar sólo horarios libres — los ocupados aparecen atenuados.</div>
    </div>
  )
} 
