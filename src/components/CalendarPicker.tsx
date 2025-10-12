'use client'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useState } from 'react'
import { getAvailableSlots } from '@/lib/utils'

export default function CalendarPicker({ onSelectSlot }: { onSelectSlot: (d: Date) => void }) {
  const [date, setDate] = useState<Date | null>(new Date())
  const [selected, setSelected] = useState<Date | null>(null)

  const slots = date ? getAvailableSlots(date) : []

  return (
    <div className="card">
      <h3 className="font-semibold mb-3">Seleccioná fecha</h3>
      <DatePicker selected={date} onChange={(d:any)=>setDate(d)} inline />
      <div className="mt-4">
        <h4 className="font-medium mb-2">Horarios</h4>
        <div className="grid grid-cols-3 gap-2">
          {slots.map((s, i) => (
            <button key={i} onClick={() => { setSelected(s); onSelectSlot(s) }} className={'p-2 border rounded ' + (selected?.getTime()===s.getTime() ? 'bg-black text-white' : '')}>
              {s.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
