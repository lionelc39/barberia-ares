// src/app/admin/page.tsx
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
  servicio: string
  precio: number
  duracion: string
  estado: string
  created_at: string
}

export default function AdminPanel() {
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'todos' | 'hoy' | 'proximos'>('hoy')
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const ADMIN_PASSWORD = 'barberia2024'

  const cargarTurnos = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('turnos')
        .select('*')
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true })

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

  const cambiarEstado = async (id: string, nuevoEstado: string) => {
    try {
      const { error } = await supabase
        .from('turnos')
        .update({ estado: nuevoEstado })
        .eq('id', id)

      if (error) throw error
      
      setTurnos(turnos.map(t => 
        t.id === id ? { ...t, estado: nuevoEstado } : t
      ))
      
      alert('Estado actualizado')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar')
    }
  }

  const eliminarTurno = async (id: string) => {
    if (!confirm('¿Eliminar este turno?')) return
    
    try {
      const { error } = await supabase
        .from('turnos')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setTurnos(turnos.filter(t => t.id !== id))
      alert('Turno eliminado')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar')
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      cargarTurnos()
    }
  }, [filter, isAuthenticated])

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
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-4 p-3 border-2 rounded-lg"
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-7xl mx-auto px-4">
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

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card">
            <p className="text-sm text-muted mb-1">Total</p>
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
          <div className="card">
            <p className="text-sm text-muted mb-1">Ingresos estimados</p>
            <p className="text-2xl font-bold text-blue-600">
              ${turnos.reduce((sum, t) => sum + (t.precio || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Lista de turnos */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner"></div>
            </div>
          ) : turnos.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-muted">No hay turnos para mostrar</p>
            </div>
          ) : (
            turnos.map((turno) => (
              <div key={turno.id} className="card hover:shadow-lg transition-all">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Fecha y hora */}
                  <div className="md:w-48">
                    <div className="text-lg font-bold">
                      {format(parseISO(turno.fecha), "dd MMM", { locale: es })}
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {turno.hora}
                    </div>
                    <div className="text-sm text-muted">{turno.duracion}</div>
                  </div>

                  {/* Servicio */}
                  <div className="flex-1">
                    <div className="font-bold text-lg mb-1">{turno.servicio}</div>
                    <div className="text-sm text-muted mb-2">
                      Cliente: <strong>{turno.nombre_cliente}</strong>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        📧 {turno.email}
                      </span>
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        📱 {turno.whatsapp}
                      </span>
                    </div>
                  </div>

                  {/* Precio */}
                  <div className="text-right md:w-32">
                    <div className="text-2xl font-bold">
                      ${turno.precio?.toLocaleString() || '0'}
                    </div>
                  </div>

                  {/* Estado y acciones */}
                  <div className="md:w-48 space-y-2">
                    <select
                      value={turno.estado}
                      onChange={(e) => cambiarEstado(turno.id, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm border-2 font-medium"
                    >
                      <option value="reservado">⏳ Reservado</option>
                      <option value="confirmado">✅ Confirmado</option>
                      <option value="completado">✔️ Completado</option>
                      <option value="cancelado">❌ Cancelado</option>
                    </select>
                    <button
                      onClick={() => eliminarTurno(turno.id)}
                      className="w-full text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
