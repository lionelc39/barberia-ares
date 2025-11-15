// src/lib/turnos-utils.ts
import { parseISO, addMinutes, isBefore, isAfter, isToday, isSameDay } from 'date-fns'

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

/**
 * Parsea la duración en formato "45 min" o "1h 15min" a minutos
 */
export function parseDuracion(duracion: string): number {
  if (!duracion) return 30 // default
  
  let totalMinutos = 0
  
  // Buscar horas (ej: "1h")
  const horasMatch = duracion.match(/(\d+)h/)
  if (horasMatch) {
    totalMinutos += parseInt(horasMatch[1]) * 60
  }
  
  // Buscar minutos (ej: "45 min" o "15min")
  const minutosMatch = duracion.match(/(\d+)\s*min/)
  if (minutosMatch) {
    totalMinutos += parseInt(minutosMatch[1])
  }
  
  return totalMinutos || 30
}

/**
 * Clasifica un turno según su estado temporal
 */
export function clasificarTurno(turno: Turno): EstadoTurno {
  const ahora = new Date()
  const fechaTurno = parseISO(`${turno.fecha}T${turno.hora}`)
  const duracionMinutos = parseDuracion(turno.duracion)
  const finTurno = addMinutes(fechaTurno, duracionMinutos)
  
  // 1. EN CURSO (turno comenzó pero aún no terminó)
  if (isBefore(fechaTurno, ahora) && isAfter(finTurno, ahora)) {
    return 'en_curso'
  }
  
  // 2. PASADO (turno ya finalizó)
  if (isBefore(finTurno, ahora)) {
    return 'pasado'
  }
  
  // 3. HOY (turno es hoy pero aún no comenzó)
  if (isToday(fechaTurno) && isAfter(fechaTurno, ahora)) {
    return 'hoy'
  }
  
  // 4. PRÓXIMO (turno es futuro, no hoy)
  return 'proximo'
}

/**
 * Filtra turnos según el filtro seleccionado
 */
export function filtrarTurnos(turnos: Turno[], filtro: 'todos' | 'en_curso' | 'hoy' | 'proximos' | 'pasados'): Turno[] {
  if (filtro === 'todos') return turnos
  
  return turnos.filter(turno => {
    const estadoTemporal = clasificarTurno(turno)
    
    switch(filtro) {
      case 'en_curso':
        return estadoTemporal === 'en_curso'
      
      case 'hoy':
        return estadoTemporal === 'hoy' || estadoTemporal === 'en_curso'
      
      case 'proximos':
        return estadoTemporal === 'proximo'
      
      case 'pasados':
        return estadoTemporal === 'pasado'
      
      default:
        return true
    }
  })
}

/**
 * Calcula el monto de seña (30% del precio)
 */
export function calcularSena(precio: number): number {
  return Math.round(precio * 0.30)
}

/**
 * Calcula la ganancia de un turno según su estado
 */
export function calcularGananciaTurno(turno: Turno): number {
  const { estado, precio, monto_sena, sena_pagada } = turno
  
  switch(estado) {
    case 'completado':
      return precio // 100% del servicio
      
    case 'confirmado':
    case 'reservado':
      return sena_pagada ? monto_sena : 0 // Solo seña si está pagada
      
    case 'cancelado':
      return 0 // No hay ganancia si se canceló
      
    default:
      return 0
  }
}

/**
 * Obtiene el color según el estado temporal
 */
export function getColorEstado(estadoTemporal: EstadoTurno): string {
  switch(estadoTemporal) {
    case 'en_curso':
      return '#ef4444' // rojo
    case 'hoy':
      return '#10b981' // verde
    case 'proximo':
      return '#3b82f6' // azul
    case 'pasado':
      return '#94a3b8' // gris
    default:
      return '#64748b'
  }
}

/**
 * Obtiene el icono según el estado temporal
 */
export function getIconoEstado(estadoTemporal: EstadoTurno): string {
  switch(estadoTemporal) {
    case 'en_curso':
      return '🔴'
    case 'hoy':
      return '✅'
    case 'proximo':
      return '📆'
    case 'pasado':
      return '📋'
    default:
      return '📅'
  }
}

/**
 * Cuenta turnos por estado temporal
 */
export function contarPorEstado(turnos: Turno[]): Record<EstadoTurno | 'todos', number> {
  const conteo = {
    en_curso: 0,
    hoy: 0,
    proximo: 0,
    pasado: 0,
    todos: turnos.length
  }
  
  turnos.forEach(turno => {
    const estado = clasificarTurno(turno)
    conteo[estado]++
  })
  
  return conteo
}