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
      
      alert('Estado actualizado correctamente')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar el estado')
    }
  }

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
      console.error('Error:', error)
      alert('Error al eliminar el turno')
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      cargarTurnos()
    }
  }, [filter, isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="admin-container">
        <div className="container" style={{ maxWidth: '500px', paddingTop: '4rem' }}>
          <div style={{ 
            background: 'white', 
            padding: '2.5rem', 
            borderRadius: '12px', 
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                Panel de Administración
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Ingresa tu contraseña para acceder
              </p>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault()
              if (password === ADMIN_PASSWORD) {
                setIsAuthenticated(true)
              } else {
                alert('Contraseña incorrecta')
                setPassword('')
              }
            }}>
              <div className="input-group">
                <label className="input-label">Contraseña</label>
                <input
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-fresha"
                  autoFocus
                  required
                />
              </div>
              <button type="submit" className="btn-fresha btn-primary-fresha" style={{ width: '100%', padding: '1rem' }}>
                Acceder al panel
              </button>
            </form>
          </div>
