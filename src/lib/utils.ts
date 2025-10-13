import { addMinutes, isSunday } from 'date-fns'

export const getAvailableSlots = (date: Date) => {
  if (isSunday(date)) return []
  const slots: Date[] = []
  const start = new Date(date)
  start.setHours(9,0,0,0)
  let current = new Date(start)
  while (current.getHours() < 18) {
    slots.push(new Date(current))
    current = addMinutes(current, 30)
  }
  return slots
}
// Función auxiliar para verificar si un horario está disponible
export function isSlotAvailable(selectedDate: Date, bookedSlots: Date[]) {
  return !bookedSlots.some(
    (slot) => Math.abs(slot.getTime() - selectedDate.getTime()) < 30 * 60 * 1000 // compara si hay turno reservado en ±30min
  );
}
