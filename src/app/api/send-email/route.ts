// src/app/api/send-email/route.ts (actualizar la plantilla)
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'RESEND_API_KEY no está configurada' },
      { status: 500 }
    )
  }
  
  const resend = new Resend(apiKey)
  
  try {
    const { to, subject, tipo, datos } = await request.json()

    if (!to || !tipo || !datos) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    let htmlContent = ''
    let subjectEmail = subject || 'Confirmación'

    if (tipo === 'confirmacion_turno') {
      subjectEmail = '✅ Turno confirmado - Barber Ares'
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .logo {
              width: 80px;
              height: 80px;
              background: white;
              border-radius: 50%;
              margin: 0 auto 15px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 2rem;
            }
            .content {
              background: white;
              padding: 30px;
              border: 1px solid #eaeaea;
              border-top: none;
            }
            .info-box {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #1a1a1a;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e0e0e0;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .label {
              font-weight: 600;
              color: #666;
            }
            .value {
              font-weight: 700;
              color: #1a1a1a;
            }
            .button {
              display: inline-block;
              background: #1a1a1a;
              color: white;
              padding: 14px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #666;
              font-size: 0.9rem;
              border-top: 1px solid #eaeaea;
            }
            .price-highlight {
              background: #1a1a1a;
              color: white;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
              margin: 20px 0;
              font-size: 1.2rem;
              font-weight: 700;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">💈</div>
            <h1 style="margin: 0; font-size: 1.8rem;">¡Tu turno está confirmado!</h1>
          </div>
          
          <div class="content">
            <p>Hola <strong>${datos.nombre}</strong>,</p>
            
            <p>Recibimos tu reserva y confirmamos tu turno en <strong>Barber Ares</strong>.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0; color: #1a1a1a;">📋 Detalles de tu turno</h3>
              
              <div class="info-row">
                <span class="label">✂️ Servicio:</span>
                <span class="value">${datos.servicio || 'Corte Personalizado'}</span>
              </div>
              
              <div class="info-row">
                <span class="label">📅 Fecha:</span>
                <span class="value">${datos.fecha}</span>
              </div>
              
              <div class="info-row">
                <span class="label">⏰ Hora:</span>
                <span class="value">${datos.hora}</span>
              </div>
              
              <div class="info-row">
                <span class="label">👤 Cliente:</span>
                <span class="value">${datos.nombre}</span>
              </div>
              
              <div class="info-row">
                <span class="label">📱 Contacto:</span>
                <span class="value">${datos.whatsapp}</span>
              </div>
            </div>
            
            ${datos.precio ? `
              <div class="price-highlight">
                Total a abonar: $${datos.precio.toLocaleString()}
              </div>
            ` : ''}
            
            <h3>⚠️ Importante:</h3>
            <ul>
              <li>Por favor, llegá <strong>5 minutos antes</strong> de tu turno.</li>
              <li>Si necesitás cancelar o reprogramar, avisanos con <strong>24 horas de anticipación</strong>.</li>
              <li>Traé una toalla si lo preferís (también tenemos disponibles).</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="https://wa.me/5493489324301?text=Hola,%20tengo%20un%20turno%20confirmado" class="button">
                💬 Contactar por WhatsApp
              </a>
            </div>
            
            <p style="margin-top: 30px;">
              ¿Tenés alguna duda? Respondé este email o escribinos por WhatsApp.
            </p>
            
            <p style="margin-top: 30px; color: #666; font-size: 0.95rem;">
              ¡Nos vemos pronto! 👋<br>
              <strong>El equipo de Barber Ares</strong>
            </p>
          </div>
          
          <div class="footer">
            <p><strong>Barber Ares</strong> - Barbería Premium</p>
            <p>📍 Campana, Buenos Aires</p>
            <p>📞 WhatsApp: +54 9 3489 324301</p>
            <p>🌐 Instagram: @barber.ares</p>
            <p style="font-size: 0.8rem; color: #999; margin-top: 15px;">
              Este es un email automático. Si no solicitaste este turno, por favor ignorá este mensaje.
            </p>
          </div>
        </body>
        </html>
      `
    }

    const { data, error } = await resend.emails.send({
      from: 'Barber Ares <onboarding@resend.dev>', // Cambiar cuando tengas dominio verificado
      to: [to],
      subject: subjectEmail,
      html: htmlContent,
    })

    if (error) {
      console.error('Error al enviar email:', error)
      return NextResponse.json(
        { error: 'Error al enviar el email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email enviado correctamente',
      data 
    })

  } catch (error) {
    console.error('Error en la API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
