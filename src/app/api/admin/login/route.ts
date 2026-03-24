// src/app/api/health/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    console.log('🏥 Health check ejecutado:', new Date().toISOString())
    
    // Hacer una query simple para mantener Supabase activo
    const { data, error } = await supabase
      .from('turnos')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('❌ Error en health check:', error)
      return NextResponse.json(
        { 
          status: 'error', 
          message: error.message,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      status: 'ok',
      message: 'Sistema activo',
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
    
  } catch (error: any) {
    console.error('💥 Error crítico en health check:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}