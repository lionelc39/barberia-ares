'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Register() {
  const [form, setForm] = useState({ 
    nombre: '', 
    apellido: '', 
    dni: '', 
    email: '', 
    whatsapp: '', 
    password: '' 
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handle = async (e: any) => {
    e.preventDefault()
    setError('')
    
    if (form.password.length < 6) { 
      setError('La contraseña debe tener al menos 6 caracteres')
      return 
    }
    
    setLoading(true)
    
    try {
      // Guardar en tabla clientes
      const { error: insertErr } = await supabase.from('clientes').insert([{ 
        nombre: form.nombre, 
        apellido: form.apellido, 
        dni: form.dni, 
        email: form.email, 
        whatsapp: form.whatsapp 
      }])
      
      if (insertErr) { 
        setError(insertErr.message)
        setLoading(false)
        return 
      }
      
      // Crear usuario en Auth
      const { error: authErr } = await supabase.auth.signUp({ 
        email: form.email, 
        password: form.password 
      })
      
      if (authErr) { 
        setError(authErr.message)
        setLoading(false)
        return 
      }
      
      setLoading(false)
      alert('¡Registro exitoso! Por favor inicia sesión.')
      router.push('/login')
    } catch (err) {
      console.error('Error:', err)
      setError('Ocurrió un error inesperado')
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-light)', 
      padding: '2rem 0',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div className="container" style={{ maxWidth: '600px', width: '100%' }}>
        <div style={{ 
          background: 'white', 
          padding: '2.5rem', 
          borderRadius: '12px', 
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h2 style={{ 
              fontSize: '1.75rem', 
              fontWeight: '700', 
              color: 'var(--text-dark)', 
              marginBottom: '0.5rem' 
            }}>
              Crear cuenta
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Regístrate para reservar turnos más rápido
            </p>
          </div>

          {/* Alert Error */}
          {error && (
            <div className="alert-fresha alert-error" style={{ marginBottom: '1.5rem' }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handle}>
            {/* Nombre y Apellido */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1rem',
              marginBottom: '1.25rem'
            }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Nombre *</label>
                <input 
                  required 
                  type="text"
                  placeholder="Juan" 
                  value={form.nombre} 
                  onChange={e => setForm({...form, nombre: e.target.value})} 
                  className="input-fresha"
                />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Apellido *</label>
                <input 
                  required 
                  type="text"
                  placeholder="Pérez" 
                  value={form.apellido} 
                  onChange={e => setForm({...form, apellido: e.target.value})} 
                  className="input-fresha"
                />
              </div>
            </div>

            {/* DNI */}
            <div className="input-group">
              <label className="input-label">DNI *</label>
              <input 
                required 
                type="text"
                placeholder="12345678" 
                value={form.dni} 
                onChange={e => setForm({...form, dni: e.target.value})} 
                className="input-fresha"
              />
            </div>

            {/* Email */}
            <div className="input-group">
              <label className="input-label">Email *</label>
              <input 
                required 
                type="email" 
                placeholder="tu@email.com" 
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})} 
                className="input-fresha"
              />
            </div>

            {/* WhatsApp */}
            <div className="input-group">
              <label className="input-label">WhatsApp *</label>
              <input 
                required 
                type="tel"
                placeholder="11 2345-6789" 
                value={form.whatsapp} 
                onChange={e => setForm({...form, whatsapp: e.target.value})} 
                className="input-fresha"
              />
              <p style={{ 
                fontSize: '0.85rem', 
                color: 'var(--text-muted)', 
                marginTop: '0.25rem' 
              }}>
                Incluye código de área (ej: 11 para Buenos Aires)
              </p>
            </div>

            {/* Contraseña */}
            <div className="input-group">
              <label className="input-label">Contraseña *</label>
              <input 
                required 
                type="password" 
                placeholder="Mínimo 6 caracteres" 
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})} 
                className="input-fresha"
              />
              <p style={{ 
                fontSize: '0.85rem', 
                color: 'var(--text-muted)', 
                marginTop: '0.25rem' 
              }}>
                La contraseña debe tener al menos 6 caracteres
              </p>
            </div>

            {/* Botón Submit */}
            <button 
              type="submit"
              disabled={loading} 
              className="btn-fresha btn-primary-fresha" 
              style={{ 
                width: '100%', 
                padding: '1rem',
                marginTop: '0.5rem'
              }}
            >
              {loading ? (
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.5rem' 
                }}>
                  <div className="spinner"></div>
                  Registrando...
                </span>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>

          {/* Link a Login */}
          <p style={{ 
            marginTop: '1.5rem', 
            textAlign: 'center', 
            fontSize: '0.95rem', 
            color: 'var(--text-muted)' 
          }}>
            ¿Ya tienes cuenta?{' '}
            <Link 
              href="/login" 
              style={{ 
                color: 'var(--primary)', 
                fontWeight: '600', 
                textDecoration: 'none' 
              }}
            >
              Inicia sesión
            </Link>
          </p>
        </div>

        {/* Mensaje adicional */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '1.5rem',
          fontSize: '0.9rem',
          color: 'var(--text-muted)'
        }}>
          <p>Al registrarte aceptas nuestros términos y condiciones</p>
        </div>
      </div>
    </div>
  )
}
