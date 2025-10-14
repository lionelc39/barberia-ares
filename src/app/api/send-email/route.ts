// Archivo: src/app/api/send-email/route.ts
// Coloca este archivo en: src/app/api/send-email/route.ts

import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: Request) {
  // Inicializar Resend DENTRO de la función (no afuera)
  const apiKey = process.env.RESEND_API_KEY
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'RESEND_API_KEY no está configurada' },
      { status: 500 }
    )
  }
  
  const resend = new Resend(apiKey)
  try {
    // Obtener datos del body
    const { to, subject, tipo, datos } = await request.json()

    // Validar que tenemos los datos necesarios
    if (!to || !tipo || !datos) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    let htmlContent = ''
    let subjectEmail = subject || 'Confirmación'

    // ===============================
    // PLANTILLA: Confirmación de turno
    // ===============================
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
              background: linear-gradient(135deg, #0b0b0b 0%, #2a2a2a 100%);
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
              background: #f5f5f6;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #caa93b;
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
              color: #0b0b0b;
            }
            .button {
              display: inline-block;
              background: #0b0b0b;
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
            .highlight {
              color: #caa93b;
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
              <h3 style="margin-top: 0; color: #0b0b0b;">📋 Detalles de tu turno</h3>
              
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
            
            <h3>⚠️ Importante:</h3>
            <ul>
              <li>Por favor, llegá <strong>5 minutos antes</strong> de tu turno.</li>
              <li>Si necesitás cancelar o reprogramar, avisanos con <strong>24 horas de anticipación</strong>.</li>
              <li>Traé una toalla si lo preferís (también tenemos disponibles).</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="https://wa.me/5493489324301" class="button">
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
            <p>Barber Ares - Barbería Premium</p>
            <p>📍 [Tu dirección aquí]</p>
            <p>📞 WhatsApp: +54 9 3489 324301</p>
            <p style="font-size: 0.8rem; color: #999; margin-top: 15px;">
              Este es un email automático. Si no solicitaste este turno, por favor ignorá este mensaje.
            </p>
          </div>
        </body>
        </html>
      `
    }

    // ===============================
    // PLANTILLA: Bienvenida (registro)
    // ===============================
    else if (tipo === 'bienvenida') {
      subjectEmail = '👋 Bienvenido a Barber Ares'
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
              background: linear-gradient(135deg, #0b0b0b 0%, #2a2a2a 100%);
              color: white;
              padding: 40px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: white;
              padding: 30px;
              border: 1px solid #eaeaea;
              border-top: none;
            }
            .button {
              display: inline-block;
              background: #0b0b0b;
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
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 2rem;">¡Bienvenido a Barber Ares! 💈</h1>
          </div>
          
          <div class="content">
            <p>Hola <strong>${datos.nombre}</strong>,</p>
            
            <p>¡Gracias por registrarte! Tu cuenta ha sido creada exitosamente.</p>
            
            <p>Ya podés:</p>
            <ul>
              <li>✅ Reservar turnos online</li>
              <li>✅ Ver tu historial de cortes</li>
              <li>✅ Recibir notificaciones</li>
              <li>✅ Acceder a promociones exclusivas</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="[URL_DE_TU_SITIO]/reserva" class="button">
                📅 Reservar mi primer turno
              </a>
            </div>
            
            <p style="margin-top: 30px;">
              Si tenés alguna consulta, no dudes en contactarnos.
            </p>
            
            <p style="margin-top: 30px; color: #666;">
              Saludos,<br>
              <strong>El equipo de Barber Ares</strong>
            </p>
          </div>
          
          <div class="footer">
            <p>Barber Ares - Barbería Premium</p>
            <p>📱 WhatsApp: +54 9 3489 324301</p>
          </div>
        </body>
        </html>
      `
    }

    // ===============================
    // PLANTILLA: Recordatorio 24hs antes
    // ===============================
    else if (tipo === 'recordatorio') {
      subjectEmail = '⏰ Recordatorio: Tu turno es mañana'
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
              background: #caa93b;
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: white;
              padding: 30px;
              border: 1px solid #eaeaea;
              border-top: none;
            }
            .alert {
              background: #fff3cd;
              border: 2px solid #caa93b;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              text-align: center;
            }
            .button {
              display: inline-block;
              background: #0b0b0b;
              color: white;
              padding: 14px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 10px 5px;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #666;
              font-size: 0.9rem;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 1.8rem;">⏰ ¡Tu turno es mañana!</h1>
          </div>
          
          <div class="content">
            <p>Hola <strong>${datos.nombre}</strong>,</p>
            
            <p>Te recordamos que tenés un turno agendado para <strong>mañana</strong>:</p>
            
            <div class="alert">
              <h2 style="margin: 0 0 10px 0; color: #0b0b0b;">
                📅 ${datos.fecha} a las ${datos.hora}
              </h2>
            </div>
            
            <p>Por favor:</p>
            <ul>
              <li>Llegá <strong>5 minutos antes</strong></li>
              <li>Si no podés asistir, avisanos lo antes posible</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="https://wa.me/5493489324301?text=Hola, necesito cancelar mi turno" class="button">
                ❌ Cancelar turno
              </a>
              <a href="https://wa.me/5493489324301" class="button">
                💬 Contactar
              </a>
            </div>
            
            <p style="margin-top: 30px; text-align: center; color: #666;">
              ¡Te esperamos! 💈<br>
              <strong>Barber Ares</strong>
            </p>
          </div>
          
          <div class="footer">
            <p>📱 WhatsApp: +54 9 3489 324301</p>
          </div>
        </body>
        </html>
      `
    }

    // Enviar el email usando Resend
    const { data, error } = await resend.emails.send({
      from: 'Barber Ares <noreply@tudominio.com>', // Cambia esto por tu dominio verificado
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
