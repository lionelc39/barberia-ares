'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  filtrarTurnos, 
  contarPorEstado, 
  clasificarTurno, 
  calcularGananciaTurno,
  getColorEstado,
  getIconoEstado,
  type Turno,
  type EstadoTurno
} from '@/lib/turnos-utils'

type Barbero = {
  id: string
  nombre: string
  email: string
}

type FiltroTipo = 'todos' | 'en_curso' | 'hoy' | 'proximos' | 'pasados'

export default function AdminPanel() {
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [turnosFiltrados, setTurnosFiltrados] = useState<Turno[]>([])
  const [barberos, setBarberos] = useState<Barbero[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FiltroTipo>('hoy')
  const [barberoFilter, setBarberoFilter] = useState<string>('todos')
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const ADMIN_PASSWORD = 'barberia2024'

  // Cargar barberos
  useEffect(() => {
    if (isAuthenticated) {
      cargarBarberos()
    }
  }, [isAuthenticated])

  const cargarBarberos = async () => {
    const { data } = await supabase
      .from('barberos')
      .select('*')
      .eq('activo', true)
      .order('nombre')
    
    setBarberos(data || [])
  }

  const cargarTurnos = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('turnos')
        .select('*')
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true })

      // Filtro por barbero
      if (barberoFilter !== 'todos') {
        query = query.eq('barbero_id', barberoFilter)
      }

      const { data, error } = await query

      if (error) throw error
      
      setTurnos(data || [])
      
      // Aplicar filtro temporal
      const filtrados = filtrarTurnos(data || [], filter)
      setTurnosFiltrados(filtrados)
      
    } catch (error) {
      console.error('Error al cargar turnos:', error)
      alert('Error al cargar los turnos')
    } finally {
      setLoading(false)
    }
  }

  // Aplicar filtros cuando cambian
  useEffect(() => {
    if (turnos.length > 0) {
      const filtrados = filtrarTurnos(turnos, filter)
      setTurnosFiltrados(filtrados)
    }
  }, [filter, turnos])

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

  const marcarSenaPagada = async (id: string, pagada: boolean) => {
    try {
      const updateData: any = { 
        sena_pagada: pagada 
      }
      
      // Si se marca como pagada, guardar fecha
      if (pagada) {
        updateData.fecha_pago_sena = new Date().toISOString()
      } else {
        updateData.fecha_pago_sena = null
      }

      const { error } = await supabase
        .from('turnos')
        .update(updateData)
        .eq('id', id)

      if (error) throw error
      
      setTurnos(turnos.map(t => 
        t.id === id ? { ...t, ...updateData } : t
      ))
      
      alert(pagada ? 'Seña marcada como pagada' : 'Seña marcada como pendiente')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar la seña')
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
  }, [barberoFilter, isAuthenticated])

  // Calcular ganancias por barbero
  const calcularGanancias = () => {
    const gananciaPorBarbero: Record<string, number> = {}
    
    turnos.forEach(turno => {
      const barberoId = turno.barbero_id || 'sin-asignar'
      const monto = calcularGananciaTurno(turno)
      gananciaPorBarbero[barberoId] = (gananciaPorBarbero[barberoId] || 0) + monto
    })
    
    return gananciaPorBarbero
  }

  const ganancias = calcularGanancias()
  const gananciaTotal = Object.values(ganancias).reduce((sum, val) => sum + val, 0)

  // Contar turnos por estado
  const conteo = contarPorEstado(turnos)

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

        {/* Filtros mejorados con badges */}
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '12px', 
          border: '1px solid var(--border)',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            flexWrap: 'wrap', 
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Filtros temporales con badges */}
              <button
                onClick={() => setFilter('en_curso')}
                className={`btn-fresha ${filter === 'en_curso' ? 'btn-primary-fresha' : 'btn-secondary-fresha'}`}
                style={{
                  backgroundColor: filter === 'en_curso' ? '#ef4444' : undefined,
                  borderColor: filter === 'en_curso' ? '#ef4444' : undefined,
                  position: 'relative',
                  paddingRight: '2.5rem'
                }}
              >
                🔴 En curso
                {conteo.en_curso > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: '#dc2626',
                    color: 'white',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    border: '2px solid white'
                  }}>
                    {conteo.en_curso}
                  </span>
                )}
              </button>

              <button
                onClick={() => setFilter('hoy')}
                className={`btn-fresha ${filter === 'hoy' ? 'btn-primary-fresha' : 'btn-secondary-fresha'}`}
                style={{
                  backgroundColor: filter === 'hoy' ? '#10b981' : undefined,
                  borderColor: filter === 'hoy' ? '#10b981' : undefined,
                  position: 'relative',
                  paddingRight: '2.5rem'
                }}
              >
                📅 Hoy
                {conteo.hoy > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: '#059669',
                    color: 'white',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    border: '2px solid white'
                  }}>
                    {conteo.hoy}
                  </span>
                )}
              </button>

              <button
                onClick={() => setFilter('proximos')}
                className={`btn-fresha ${filter === 'proximos' ? 'btn-primary-fresha' : 'btn-secondary-fresha'}`}
                style={{
                  position: 'relative',
                  paddingRight: '2.5rem'
                }}
              >
                📆 Próximos
                {conteo.proximo > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: '#3b82f6',
                    color: 'white',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    border: '2px solid white'
                  }}>
                    {conteo.proximo}
                  </span>
                )}
              </button>

              <button
                onClick={() => setFilter('pasados')}
                className={`btn-fresha ${filter === 'pasados' ? 'btn-primary-fresha' : 'btn-secondary-fresha'}`}
                style={{
                  backgroundColor: filter === 'pasados' ? '#94a3b8' : undefined,
                  borderColor: filter === 'pasados' ? '#94a3b8' : undefined,
                  position: 'relative',
                  paddingRight: '2.5rem'
                }}
              >
                📋 Pasados
                {conteo.pasado > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: '#64748b',
                    color: 'white',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    border: '2px solid white'
                  }}>
                    {conteo.pasado}
                  </span>
                )}
              </button>

              <button
                onClick={() => setFilter('todos')}
                className={`btn-fresha ${filter === 'todos' ? 'btn-primary-fresha' : 'btn-secondary-fresha'}`}
                style={{
                  position: 'relative',
                  paddingRight: '2.5rem'
                }}
              >
                📊 Todos
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: 'var(--primary)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  border: '2px solid white'
                }}>
                  {conteo.todos}
                </span>
              </button>
              
              <div style={{ borderLeft: '1px solid var(--border)', height: '40px', margin: '0 0.5rem' }}></div>
              
              {/* Filtros por Barbero */}
              <button
                onClick={() => setBarberoFilter('todos')}
                className={`btn-fresha ${barberoFilter === 'todos' ? 'btn-primary-fresha' : 'btn-secondary-fresha'}`}
              >
                👥 Todos los barberos
              </button>
              {barberos.map(barbero => (
                <button
                  key={barbero.id}
                  onClick={() => setBarberoFilter(barbero.id)}
                  className={`btn-fresha ${barberoFilter === barbero.id ? 'btn-primary-fresha' : 'btn-secondary-fresha'}`}
                >
                  {barbero.nombre}
                </button>
              ))}
            </div>
            
            <button
              onClick={cargarTurnos}
              className="btn-fresha btn-secondary-fresha"
            >
              🔄 Actualizar
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">Total de turnos</p>
            <p className="stat-value">{turnos.length}</p>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
            <p className="stat-label">🔴 En curso ahora</p>
            <p className="stat-value" style={{ color: '#ef4444' }}>
              {conteo.en_curso}
            </p>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
            <p className="stat-label">✅ Turnos hoy</p>
            <p className="stat-value" style={{ color: '#10b981' }}>
              {conteo.hoy + conteo.en_curso}
            </p>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <p className="stat-label">💰 Ingresos totales</p>
            <p className="stat-value" style={{ color: 'var(--primary)' }}>
              ${gananciaTotal.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Ganancias por Barbero */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
            💰 Ganancias por Barbero
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {barberos.map(barbero => {
              const ganancia = ganancias[barbero.id] || 0
              return (
                <div key={barbero.id} style={{
                  background: 'var(--bg-light)',
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    {barbero.nombre}
                  </p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
                    ${ganancia.toLocaleString()}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Lista de Turnos */}
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
          ) : turnosFiltrados.length === 0 ? (
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
                {filter === 'todos' 
                  ? 'Los turnos aparecerán aquí cuando los clientes realicen reservas'
                  : `No hay turnos ${filter === 'en_curso' ? 'en curso' : filter === 'hoy' ? 'para hoy' : filter === 'proximos' ? 'próximos' : 'pasados'}`
                }
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {turnosFiltrados.map((turno) => {
                const estadoTemporal = clasificarTurno(turno)
                const colorEstado = getColorEstado(estadoTemporal)
                const iconoEstado = getIconoEstado(estadoTemporal)
                
                return (
                  <div 
                    key={turno.id} 
                    className="appointment-card"
                    style={{ 
                      borderLeft: `4px solid ${colorEstado}`,
                      position: 'relative'
                    }}
                  >
                    {/* Badge de estado temporal */}
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      background: colorEstado,
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span>{iconoEstado}</span>
                      <span>{estadoTemporal === 'en_curso' ? 'EN CURSO' : 
                             estadoTemporal === 'hoy' ? 'HOY' : 
                             estadoTemporal === 'proximo' ? 'PRÓXIMO' : 'PASADO'}</span>
                    </div>

                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'auto 1fr auto',
                      gap: '2rem',
                      alignItems: 'start',
                      paddingTop: '2.5rem'
                    }}>
                      {/* Fecha y hora */}
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
                          color: colorEstado,
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

                      {/* Detalles del turno */}
                      <div>
                        <div style={{ 
                          fontSize: '1.125rem', 
                          fontWeight: '600', 
                          color: 'var(--text-dark)',
                          marginBottom: '0.5rem'
                        }}>
                          {turno.servicio}
                        </div>
                        
                        {/* Barbero */}
                        <div style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          background: '#e0f2fe',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '6px',
                          marginBottom: '0.5rem'
                        }}>
                          <span style={{ fontSize: '1rem' }}>💈</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0369a1' }}>
                            {turno.barbero_nombre}
                          </span>
                        </div>
                        
                        <div style={{ 
                          fontSize: '0.95rem', 
                          color: 'var(--text-muted)',
                          marginBottom: '0.75rem'
                        }}>
                          Cliente: <strong style={{ color: 'var(--text-dark)' }}>{turno.nombre_cliente}</strong>
                        </div>
                        
                        {/* Seña mejorada */}
                        <div style={{
                          background: turno.sena_pagada ? '#dcfce7' : '#fef3c7',
                          border: `2px solid ${turno.sena_pagada ? '#86efac' : '#fcd34d'}`,
                          borderRadius: '8px',
                          padding: '0.75rem',
                          marginBottom: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>
                              {turno.sena_pagada ? '✅' : '⏳'}
                            </span>
                            <div>
                              <p style={{ 
                                fontSize: '0.9rem', 
                                fontWeight: '600', 
                                color: turno.sena_pagada ? '#166534' : '#92400e',
                                marginBottom: '0.25rem'
                              }}>
                                {turno.sena_pagada ? 'Seña pagada' : 'Seña pendiente'}
                              </p>
                              <p style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: '700', 
                                color: turno.sena_pagada ? '#16a34a' : '#d97706'
                              }}>
                                ${turno.monto_sena?.toLocaleString() || calcularSena(turno.precio).toLocaleString()}
                              </p>
                              {turno.sena_pagada && turno.fecha_pago_sena && (
                                <p style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem' }}>
                                  Pagada el {format(parseISO(turno.fecha_pago_sena), "dd/MM 'a las' HH:mm", { locale: es })}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => marcarSenaPagada(turno.id, !turno.sena_pagada)}
                            style={{
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              border: 'none',
                              background: turno.sena_pagada ? '#f59e0b' : '#16a34a',
                              color: 'white',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {turno.sena_pagada ? 'Marcar pendiente' : 'Marcar pagada'}
                          </button>
                        </div>
                        
                        {/* Contacto */}
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

                      {/* Precio y acciones */}
                      <div style={{ minWidth: '200px' }}>
                        <div style={{ 
                          fontSize: '1.75rem', 
                          fontWeight: '700',
                          color: 'var(--text-dark)',
                          marginBottom: '1rem',
                          textAlign: 'center'
                        }}>
                          ${turno.precio?.toLocaleString() || '0'}
                        </div>

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
                )
              })}
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
