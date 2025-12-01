'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns'
import { es } from 'date-fns/locale'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type Turno = {
  id: string
  fecha: string
  hora: string
  servicio: string
  precio: number
  estado: string
  barbero_id: string
  barbero_nombre: string
  monto_sena: number
  sena_pagada: boolean
  created_at: string
}

type RangoPreset = 'hoy' | 'semana' | 'mes' | 'personalizado'

const COLORES = ['#2c6e49', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981']

export default function EstadisticasPage() {
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [barberos, setBarberos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filtros
  const [rangoPreset, setRangoPreset] = useState<RangoPreset>('mes')
  const [fechaDesde, setFechaDesde] = useState<string>(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [fechaHasta, setFechaHasta] = useState<string>(format(endOfMonth(new Date()), 'yyyy-MM-dd'))
  const [barberoFiltro, setBarberoFiltro] = useState<string>('todos')

  // Cargar datos iniciales
  useEffect(() => {
    cargarBarberos()
    cargarTurnos()
  }, [])

  // Recargar cuando cambian filtros
  useEffect(() => {
    if (fechaDesde && fechaHasta) {
      cargarTurnos()
    }
  }, [fechaDesde, fechaHasta, barberoFiltro])

  const cargarBarberos = async () => {
    const { data } = await supabase
      .from('barberos')
      .select('*')
      .eq('activo', true)
    setBarberos(data || [])
  }

  const cargarTurnos = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('turnos')
        .select('*')
        .gte('fecha', fechaDesde)
        .lte('fecha', fechaHasta)
        .order('fecha', { ascending: true })

      if (barberoFiltro !== 'todos') {
        query = query.eq('barbero_id', barberoFiltro)
      }

      const { data } = await query
      setTurnos(data || [])
    } catch (error) {
      console.error('Error al cargar turnos:', error)
    } finally {
      setLoading(false)
    }
  }

  const aplicarRangoPreset = (preset: RangoPreset) => {
    setRangoPreset(preset)
    const hoy = new Date()
    
    switch (preset) {
      case 'hoy':
        setFechaDesde(format(hoy, 'yyyy-MM-dd'))
        setFechaHasta(format(hoy, 'yyyy-MM-dd'))
        break
      case 'semana':
        setFechaDesde(format(startOfWeek(hoy, { locale: es }), 'yyyy-MM-dd'))
        setFechaHasta(format(endOfWeek(hoy, { locale: es }), 'yyyy-MM-dd'))
        break
      case 'mes':
        setFechaDesde(format(startOfMonth(hoy), 'yyyy-MM-dd'))
        setFechaHasta(format(endOfMonth(hoy), 'yyyy-MM-dd'))
        break
    }
  }

  // ===== CÁLCULOS DE MÉTRICAS =====
  const turnosConfirmados = turnos.filter(t => ['confirmado', 'completado'].includes(t.estado))
  
  const ingresosTotal = turnosConfirmados.reduce((sum, t) => {
    if (t.estado === 'completado') return sum + t.precio
    if (t.estado === 'confirmado' && t.sena_pagada) return sum + t.monto_sena
    return sum
  }, 0)

  const promedioTicket = turnosConfirmados.length > 0 
    ? Math.round(ingresosTotal / turnosConfirmados.length) 
    : 0

  const tasaCancelacion = turnos.length > 0
    ? Math.round((turnos.filter(t => t.estado === 'cancelado').length / turnos.length) * 100)
    : 0

  const turnosPendientesSena = turnos.filter(t => 
    ['reservado', 'confirmado'].includes(t.estado) && !t.sena_pagada
  ).length

  // Datos para gráfico de líneas (Ingresos por día)
  const ingresosPorDia = () => {
    const dias = eachDayOfInterval({ start: parseISO(fechaDesde), end: parseISO(fechaHasta) })
    return dias.map(dia => {
      const fechaStr = format(dia, 'yyyy-MM-dd')
      const turnosDia = turnosConfirmados.filter(t => t.fecha === fechaStr)
      const ingresos = turnosDia.reduce((sum, t) => {
        if (t.estado === 'completado') return sum + t.precio
        if (t.sena_pagada) return sum + t.monto_sena
        return sum
      }, 0)
      
      return {
        fecha: format(dia, 'dd/MM', { locale: es }),
        ingresos
      }
    })
  }

  // Servicios más solicitados
  const serviciosMasSolicitados = () => {
    const conteo: Record<string, number> = {}
    turnos.forEach(t => {
      conteo[t.servicio] = (conteo[t.servicio] || 0) + 1
    })
    
    return Object.entries(conteo)
      .map(([servicio, cantidad]) => ({ servicio, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5)
  }

  // Distribución de ingresos por servicio
  const ingresosPorServicio = () => {
    const ingresos: Record<string, number> = {}
    turnosConfirmados.forEach(t => {
      const monto = t.estado === 'completado' ? t.precio : (t.sena_pagada ? t.monto_sena : 0)
      ingresos[t.servicio] = (ingresos[t.servicio] || 0) + monto
    })
    
    return Object.entries(ingresos)
      .map(([servicio, valor]) => ({ 
        servicio, 
        valor,
        porcentaje: Math.round((valor / ingresosTotal) * 100)
      }))
      .sort((a, b) => b.valor - a.valor)
  }

  // Mapa de calor de horarios
  const mapaCalorHorarios = () => {
    const horas = Array.from({ length: 11 }, (_, i) => i + 10) // 10:00 a 20:00
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    
    const mapa = horas.map(hora => {
      const horaStr = `${hora.toString().padStart(2, '0')}:00`
      const fila: any = { hora: horaStr }
      
      dias.forEach((dia, idx) => {
        const diaNum = idx + 1 // 1=Lun, 6=Sáb
        const turnosHora = turnos.filter(t => {
          const diaTurno = parseISO(t.fecha).getDay()
          const horaTurno = parseInt(t.hora.split(':')[0])
          return diaTurno === diaNum && horaTurno === hora
        }).length
        
        fila[dia] = turnosHora
      })
      
      return fila
    })
    
    return mapa
  }

  // Ingresos por barbero
  const ingresosPorBarbero = () => {
    const ingresos: Record<string, number> = {}
    turnosConfirmados.forEach(t => {
      const monto = t.estado === 'completado' ? t.precio : (t.sena_pagada ? t.monto_sena : 0)
      ingresos[t.barbero_nombre] = (ingresos[t.barbero_nombre] || 0) + monto
    })
    
    return Object.entries(ingresos).map(([barbero, valor]) => ({ barbero, valor }))
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
      </div>
    )
  }

  return (
    <div className="admin-container">
      <div className="container" style={{ maxWidth: '1600px' }}>
        {/* Header */}
        <div className="admin-header">
          <h1 className="admin-title">📊 Estadísticas Avanzadas</h1>
          <p className="admin-subtitle">Análisis completo del rendimiento de Barber Ares</p>
        </div>

        {/* NIVEL 1: Filtros */}
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '12px', 
          border: '1px solid var(--border)',
          marginBottom: '2rem'
        }}>
          {/* Rango Preset */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '0.75rem', display: 'block' }}>
              📅 Rango rápido:
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {(['hoy', 'semana', 'mes'] as RangoPreset[]).map(preset => (
                <button
                  key={preset}
                  onClick={() => aplicarRangoPreset(preset)}
                  className={`btn-fresha ${rangoPreset === preset ? 'btn-primary-fresha' : 'btn-secondary-fresha'}`}
                >
                  {preset === 'hoy' && '📅 Hoy'}
                  {preset === 'semana' && '📆 Esta semana'}
                  {preset === 'mes' && '🗓️ Este mes'}
                </button>
              ))}
            </div>
          </div>

          {/* Rango Personalizado */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '0.5rem', display: 'block' }}>
                Desde:
              </label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => {
                  setFechaDesde(e.target.value)
                  setRangoPreset('personalizado')
                }}
                className="input-fresha"
              />
            </div>
            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '0.5rem', display: 'block' }}>
                Hasta:
              </label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => {
                  setFechaHasta(e.target.value)
                  setRangoPreset('personalizado')
                }}
                className="input-fresha"
              />
            </div>
            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '0.5rem', display: 'block' }}>
                Barbero:
              </label>
              <select
                value={barberoFiltro}
                onChange={(e) => setBarberoFiltro(e.target.value)}
                className="input-fresha"
              >
                <option value="todos">👥 Todos</option>
                {barberos.map(b => (
                  <option key={b.id} value={b.id}>💈 {b.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* NIVEL 2: KPIs */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="stat-card" style={{ borderLeft: '4px solid #2c6e49' }}>
            <p className="stat-label">💰 Ingresos totales</p>
            <p className="stat-value" style={{ color: '#2c6e49' }}>
              ${ingresosTotal.toLocaleString()}
            </p>
          </div>
          
          <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
            <p className="stat-label">📊 Turnos confirmados</p>
            <p className="stat-value" style={{ color: '#3b82f6' }}>
              {turnosConfirmados.length}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              de {turnos.length} totales
            </p>
          </div>
          
          <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
            <p className="stat-label">⏱️ Ticket promedio</p>
            <p className="stat-value" style={{ color: '#f59e0b' }}>
              ${promedioTicket.toLocaleString()}
            </p>
          </div>
          
          <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
            <p className="stat-label">📉 Cancelaciones</p>
            <p className="stat-value" style={{ color: '#ef4444' }}>
              {tasaCancelacion}%
            </p>
          </div>
          
          <div className="stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
            <p className="stat-label">⏳ Señas pendientes</p>
            <p className="stat-value" style={{ color: '#8b5cf6' }}>
              {turnosPendientesSena}
            </p>
          </div>
          
          <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
            <p className="stat-label">🏆 Top servicio</p>
            <p className="stat-value" style={{ fontSize: '1rem', color: '#10b981' }}>
              {serviciosMasSolicitados()[0]?.servicio || 'N/A'}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {serviciosMasSolicitados()[0]?.cantidad || 0} turnos
            </p>
          </div>
        </div>

        {/* NIVEL 3: Gráficos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
          
          {/* Gráfico 1: Ingresos por día */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
              📈 Ingresos diarios
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ingresosPorDia()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="ingresos" stroke="#2c6e49" strokeWidth={2} name="Ingresos" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico 2: Servicios más solicitados */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
              ✂️ Servicios más solicitados
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviciosMasSolicitados()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="servicio" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cantidad" fill="#3b82f6" name="Cantidad" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico 3: Distribución de ingresos por servicio */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
              🥧 Distribución de ingresos
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ingresosPorServicio()}
                  dataKey="valor"
                  nameKey="servicio"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ servicio, porcentaje }) => `${servicio}: ${porcentaje}%`}
                >
                  {ingresosPorServicio().map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico 4: Ingresos por barbero */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
              💈 Ingresos por barbero
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ingresosPorBarbero()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="barbero" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="valor" fill="#f59e0b" name="Ingresos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mapa de calor */}
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '12px', 
          border: '1px solid var(--border)',
          marginTop: '2rem'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
            🗓️ Mapa de calor - Horarios más demandados
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--border)', textAlign: 'left' }}>Hora</th>
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
                    <th key={dia} style={{ padding: '0.75rem', borderBottom: '2px solid var(--border)', textAlign: 'center' }}>
                      {dia}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mapaCalorHorarios().map(fila => (
                  <tr key={fila.hora}>
                    <td style={{ padding: '0.75rem', fontWeight: '600', borderBottom: '1px solid var(--border)' }}>
                      {fila.hora}
                    </td>
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => {
                      const valor = fila[dia]
                      const color = valor === 0 ? '#f8fafc' :
                                   valor <= 2 ? '#dcfce7' :
                                   valor <= 4 ? '#fef3c7' :
                                   '#fee2e2'
                      const emoji = valor === 0 ? '' :
                                   valor <= 2 ? '🟢' :
                                   valor <= 4 ? '🟡' :
                                   '🔴'
                      
                      return (
                        <td 
                          key={dia} 
                          style={{ 
                            padding: '0.75rem', 
                            textAlign: 'center',
                            background: color,
                            borderBottom: '1px solid var(--border)',
                            fontWeight: '600'
                          }}
                        >
                          {emoji} {valor}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center', fontSize: '0.85rem' }}>
            <span>🔴 Alta demanda (5+)</span>
            <span>🟡 Media (3-4)</span>
            <span>🟢 Baja (1-2)</span>
          </div>
        </div>
      </div>
    </div>
  )
}