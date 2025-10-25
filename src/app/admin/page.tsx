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
        </div>
      </div>
    )
  }

  return (
    <div className="admin-container">
      <div className="container" style={{ maxWidth: '1400px' }}>
        <div className="admin-header">
          <h1 className="admin-title">Panel de Administración</h1>
          <p className="admin-subtitle">Gestiona los turnos de Barber Ares</p>
        </div>

        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '12px', 
          border: '1px solid var(--border)',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilter('hoy')}
              className={`btn-fresha ${filter === 'hoy' ? 'btn-primary-fresha' : 'btn-secondary-fresha'}`}
            >
              📅 Hoy
            </button>
            <button
              onClick={() => setFilter('proximos')}
              className={`btn-fresha ${filter === 'proximos' ? 'btn-primary-fresha' : 'btn-secondary-fresha'}`}
            >
              📆 Próximos
            </button>
            <button
              onClick={() => setFilter('todos')}
              className={`btn-fresha ${filter === 'todos' ? 'btn-primary-fresha' : 'btn-secondary-fresha'}`}
            >
              📋 Todos
            </button>
          </div>
          
          <button
            onClick={cargarTurnos}
            className="btn-fresha btn-secondary-fresha"
          >
            🔄 Actualizar
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">Total de turnos</p>
            <p className="stat-value">{turnos.length}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Confirmados</p>
            <p className="stat-value" style={{ color: '#16a34a' }}>
              {turnos.filter(t => t.estado === 'confirmado').length}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Pendientes</p>
            <p className="stat-value" style={{ color: '#f59e0b' }}>
              {turnos.filter(t => t.estado === 'reservado').length}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Ingresos estimados</p>
            <p className="stat-value" style={{ color: 'var(--primary)' }}>
              ${turnos.reduce((sum, t) => sum + (t.precio || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div>
          {loading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              padding: '4rem',
              background: 'white',
              borderRadius: '12px',
              border: '1px solid var(--border)'
            }}>
              <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
            </div>
          ) : turnos.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '4rem',
              background: 'white',
              borderRadius: '12px',
              border: '1px solid var(--border)'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                No hay turnos para mostrar
              </h3>
              <p style={{ color: 'var(--text-muted)' }}>
                Los turnos aparecerán aquí cuando los clientes realicen reservas
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {turnos.map((turno) => (
                <div key={turno.id} className="appointment-card">
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'auto 1fr auto auto',
                    gap: '2rem',
                    alignItems: 'center'
                  }}>
                    <div style={{ minWidth: '140px' }}>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '600', 
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        marginBottom: '0.25rem'
                      }}>
                        {format(parseISO(turno.fecha), "EEE, dd MMM", { locale: es })}
                      </div>
                      <div style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: 'var(--primary)',
                        lineHeight: '1'
                      }}>
                        {turno.hora}
                      </div>
                      <div style={{ 
                        fontSize: '0.85rem', 
                        color: 'var(--text-muted)',
                        marginTop: '0.25rem'
                      }}>
                        {turno.duracion}
                      </div>
                    </div>

                    <div>
                      <div style={{ 
                        fontSize: '1.125rem', 
                        fontWeight: '600', 
                        color: 'var(--text-dark)',
                        marginBottom: '0.5rem'
                      }}>
                        {turno.servicio}
                      </div>
                      <div style={{ 
                        fontSize: '0.95rem', 
                        color: 'var(--text-muted)',
                        marginBottom: '0.75rem'
                      }}>
                        Cliente: <strong style={{ color: 'var(--text-dark)' }}>{turno.nombre_cliente}</strong>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '0.5rem',
                        fontSize: '0.875rem'
                      }}>
                        <span style={{ 
                          background: 'var(--bg-light)', 
                          padding: '0.375rem 0.75rem', 
                          borderRadius: '6px',
                          color: 'var(--text-muted)'
                        }}>
                          📧 {turno.email}
                        </span>
                        <span style={{ 
                          background: 'var(--bg-light)', 
                          padding: '0.375rem 0.75rem', 
                          borderRadius: '6px',
                          color: 'var(--text-muted)'
                        }}>
                          📱 {turno.whatsapp}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', minWidth: '120px' }}>
                      <div style={{ 
                        fontSize: '1.75rem', 
                        fontWeight: '700',
                        color: 'var(--text-dark)'
                      }}>
                        ${turno.precio?.toLocaleString() || '0'}
                      </div>
                    </div>

                    <div style={{ minWidth: '200px' }}>
                      <select
                        value={turno.estado}
                        onChange={(e) => cambiarEstado(turno.id, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          fontSize: '0.95rem',
                          fontWeight: '500',
                          marginBottom: '0.5rem',
                          cursor: 'pointer',
                          backgroundColor: 
                            turno.estado === 'confirmado' ? '#dcfce7' :
                            turno.estado === 'completado' ? '#f0f9ff' :
                            turno.estado === 'cancelado' ? '#fee2e2' :
                            'white'
                        }}
                      >
                        <option value="reservado">⏳ Reservado</option>
                        <option value="confirmado">✅ Confirmado</option>
                        <option value="completado">✔️ Completado</option>
                        <option value="cancelado">❌ Cancelado</option>
                      </select>
                      <button
                        onClick={() => eliminarTurno(turno.id)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '1px solid #fca5a5',
                          background: 'white',
                          color: '#dc2626',
                          fontSize: '0.95rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#fee2e2'
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'white'
                        }}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <style jsx>{`
          @media (max-width: 968px) {
            .appointment-card > div {
              grid-template-columns: 1fr !important;
              gap: 1rem !important;
            }
          }
        `}</style>
      </div>
    </div>
  )
}
