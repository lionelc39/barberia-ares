// Archivo: src/app/admin/page.tsx
// Coloca este archivo en: src/app/admin/page.tsx

'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

type Turno = {
  id: string
  nombre_cliente: string
  email: string
  whatsapp: string
  fecha: string
  hora: string
  estado: string
  created_at: string
}

export default function AdminPanel() {
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'todos' | 'hoy' | 'proximos'>('hoy')
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Contraseña simple (cámbiala por una más segura)
  const ADMIN_PASSWORD = 'barberia2024'

  // Cargar turnos desde Supabase
  const cargarTurnos = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('turnos')
        .select('*')
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true })

      // Filtros según selección
      const hoy = new Date().toISOString().split('T')[0]
      
      if (filter === 'hoy') {
        query = query.eq('fecha', hoy)
      } else if (filter === 'proximos') {
        query = query.gte('fecha', hoy)
      }

      const { data, error } = await query

      if (error) throw error
      setTurnos(data || [])
    } catch (error) {
      console.error('Error al cargar turnos:', error)
      alert('Error al cargar los turnos')
    } finally {
      setLoading(false)
    }
  }

  // Cambiar estado del turno
  const cambiarEstado = async (id: string, nuevoEstado: string) => {
    try {
      const { error } = await supabase
        .from('turnos')
        .update({ estado: nuevoEstado })
        .eq('id', id)

      if (error) throw error
      
      // Actualizar la lista local
      setTurnos(turnos.map(t => 
        t.id === id ? { ...t, estado: nuevoEstado } : t
      ))
      
      alert('Estado actualizado correctamente')
    } catch (error) {
      console.error('Error al actualizar estado:', error)
      alert('Error al actualizar el estado')
    }
  }

  // Eliminar turno
  const eliminarTurno = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este turno?')) return
    
    try {
      const { error } = await supabase
        .from('turnos')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setTurnos(turnos.filter(t => t.id !== id))
      alert('Turno eliminado correctamente')
    } catch (error) {
      console.error('Error al eliminar:', error)
      alert('Error al eliminar el turno')
    }
  }

  // Cargar turnos al cambiar filtro
  useEffect(() => {
    if (isAuthenticated) {
      cargarTurnos()
    }
  }, [filter, isAuthenticated])

  // Pantalla de login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card max-w-md w-full">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            🔒 Panel de Administración
          </h2>
          <form onSubmit={(e) => {
            e.preventDefault()
            if (password === ADMIN_PASSWORD) {
              setIsAuthenticated(true)
            } else {
              alert('Contraseña incorrecta')
            }
          }}>
            <input
              type="password"
              placeholder="Contraseña de administrador"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-4"
              autoFocus
            />
            <button type="submit" className="btn-primary w-full">
              Acceder
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Panel de administración
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-6xl">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
          <p className="text-muted">Gestiona los turnos de la barbería</p>
        </div>

        {/* Filtros */}
        <div className="card mb-6">
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setFilter('hoy')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'hoy'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              📅 Hoy
            </button>
            <button
              onClick={() => setFilter('proximos')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'proximos'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              📆 Próximos
            </button>
            <button
              onClick={() => setFilter('todos')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'todos'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              📋 Todos
            </button>
            
            <button
              onClick={cargarTurnos}
              className="ml-auto btn-ghost"
            >
              🔄 Actualizar
            </button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card">
            <p className="text-sm text-muted mb-1">Total de turnos</p>
            <p className="text-2xl font-bold">{turnos.length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-muted mb-1">Confirmados</p>
            <p className="text-2xl font-bold text-green-600">
              {turnos.filter(t => t.estado === 'confirmado').length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-muted mb-1">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-600">
              {turnos.filter(t => t.estado === 'reservado').length}
            </p>
          </div>
        </div>

        {/* Lista de turnos */}
        <div className="card">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner"></div>
            </div>
          ) : turnos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted">No hay turnos para mostrar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left py-3 px-4">Fecha/Hora</th>
                    <th className="text-left py-3 px-4">Cliente</th>
                    <th className="text-left py-3 px-4">Contacto</th>
                    <th className="text-left py-3 px-4">Estado</th>
                    <th className="text-left py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {turnos.map((turno) => (
                    <tr key={turno.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="font-medium">
                          {format(parseISO(turno.fecha), "dd 'de' MMMM", { locale: es })}
                        </div>
                        <div className="text-sm text-muted">{turno.hora}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium">{turno.nombre_cliente}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          📧 {turno.email}
                        </div>
                        <div className="text-sm">
                          📱 {turno.whatsapp}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={turno.estado}
                          onChange={(e) => cambiarEstado(turno.id, e.target.value)}
                          className="px-3 py-1 rounded-lg text-sm border-2"
                        >
                          <option value="reservado">⏳ Reservado</option>
                          <option value="confirmado">✅ Confirmado</option>
                          <option value="completado">✔️ Completado</option>
                          <option value="cancelado">❌ Cancelado</option>
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => eliminarTurno(turno.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          🗑️ Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}