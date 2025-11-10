'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

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
  barbero_nombre: string
  created_at: string
}

export default function PanelBarbero() {
  const router = useRouter()
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'todos' | 'hoy' | 'proximos'>('hoy')
  const [user, setUser] = useState<any>(null)
  const [barberoInfo, setBarberoInfo] = useState<any>(null)

  useEffect(() => {
    verificarAcceso()
  }, [])

  const verificarAcceso = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/login')
      return
    }

    setUser(session.user)

    // Buscar información del barbero
    const { data: barbero } = await supabase
      .from('barberos')
      .select('*')
      .eq('email', session.user.email)
      .single()

    if (!barbero) {
      alert('No tienes permisos para acceder a este panel')
      router.push('/')
      return
    }

    setBarberoInfo(barbero)
    cargarTurnos(barbero.id)
  }

  const cargarTurnos = async (barberoId?: string) => {
    setLoading(true)
    try {
      let query = supabase
        .from('turnos')
        .select('*')
        .eq('barbero_id', barberoId || barberoInfo?.id)
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

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  useEffect(() => {
    if (barberoInfo) {
      cargarTurnos()
    }
  }, [filter])

  if (!barberoInfo) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
      </div>
    )
  }

  return (
    <div className="admin-container">
      <div className="container" style={{ maxWidth: '1400px' }}>
        <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="admin-title">Panel de {barberoInfo.nombre}</h1>
            <p className="admin-subtitle">Gestiona tus turnos y ganancias</p>
          </div>
          <button 
            onClick={cerrarSesion}
            className="btn-fresha btn-secondary-fresha"
          >
            Cerrar sesión
          </button>
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
            onClick={() => cargarTurnos()}
            className="btn-fresha btn-secondary-fresha"
          >
            🔄 Actualizar
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">Mis turnos</p>
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
            <p className="stat-label">Mis ingresos estimados</p>
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
                Los turnos aparecerán aquí cuando los clientes reserven contigo
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}