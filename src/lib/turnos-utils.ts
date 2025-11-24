import { parseISO, addMinutes, isBefore, isAfter, isToday } from 'date-fns'

export type EstadoTurno = 'en_curso' | 'hoy' | 'proximo' | 'pasado'

export interface Turno {
  id: string
  nombre_cliente: string
  email: string
  whatsapp: string
  fecha: string
  hora: string
  servicio: string
  precio: number
  duracion: string
  estado: string
  barbero_id: string
  barbero_nombre: string
  monto_sena: number
  sena_pagada: boolean
  fecha_pago_sena?: string
  created_at: string
}

export function parseDuracion(duracion: string): number {
  if (!duracion) return 30
  let totalMinutos = 0
  const horasMatch = duracion.match(/(\d+)h/)
  if (horasMatch) totalMinutos += parseInt(horasMatch[1]) * 60
  const minutosMatch = duracion.match(/(\d+)\s*min/)
  if (minutosMatch) totalMinutos += parseInt(minutosMatch[1])
  return totalMinutos || 30
}

export function clasificarTurno(turno: Turno): EstadoTurno {
  const ahora = new Date()
  const fechaTurno = parseISO(`${turno.fecha}T${turno.hora}`)
  const duracionMinutos = parseDuracion(turno.duracion)
  const finTurno = addMinutes(fechaTurno, duracionMinutos)
  
  if (isBefore(fechaTurno, ahora) && isAfter(finTurno, ahora)) return 'en_curso'
  if (isBefore(finTurno, ahora)) return 'pasado'
  if (isToday(fechaTurno) && isAfter(fechaTurno, ahora)) return 'hoy'
  return 'proximo'
}

export function filtrarTurnos(turnos: Turno[], filtro: 'todos' | 'en_curso' | 'hoy' | 'proximos' | 'pasados'): Turno[] {
  if (filtro === 'todos') return turnos
  return turnos.filter(turno => {
    const estadoTemporal = clasificarTurno(turno)
    if (filtro === 'en_curso') return estadoTemporal === 'en_curso'
    if (filtro === 'hoy') return estadoTemporal === 'hoy' || estadoTemporal === 'en_curso'
    if (filtro === 'proximos') return estadoTemporal === 'proximo'
    if (filtro === 'pasados') return estadoTemporal === 'pasado'
    return true
  })
}

export function calcularSena(precio: number): number {
  return Math.round(precio * 0.30)
}

export function calcularGananciaTurno(turno: Turno): number {
  const { estado, precio, monto_sena, sena_pagada } = turno
  if (estado === 'completado') return precio
  if (estado === 'confirmado' || estado === 'reservado') return sena_pagada ? monto_sena : 0
  return 0
}

export function getColorEstado(estadoTemporal: EstadoTurno): string {
  if (estadoTemporal === 'en_curso') return '#ef4444'
  if (estadoTemporal === 'hoy') return '#10b981'
  if (estadoTemporal === 'proximo') return '#3b82f6'
  return '#94a3b8'
}

export function getIconoEstado(estadoTemporal: EstadoTurno): string {
  if (estadoTemporal === 'en_curso') return '🔴'
  if (estadoTemporal === 'hoy') return '✅'
  if (estadoTemporal === 'proximo') return '📆'
  return '📋'
}

export function contarPorEstado(turnos: Turno[]): Record<EstadoTurno | 'todos', number> {
  const conteo = { en_curso: 0, hoy: 0, proximo: 0, pasado: 0, todos: turnos.length }
  turnos.forEach(turno => {
    const estado = clasificarTurno(turno)
    conteo[estado]++
  })
  return conteo
}
