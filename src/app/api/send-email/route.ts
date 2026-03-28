// src/app/api/send-email/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const apiKey = process.env.BREVO_API_KEY
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'BREVO_API_KEY no está configurada' },
      { status: 500 }
    )
  }
  
  try {
    const { to, tipo, datos } = await request.json()

    if (!to || !tipo || !datos) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    let htmlContent = ''
    let subjectEmail = '✅ Turno confirmado - Barber Ares'

  if (tipo === 'confirmacion_turno') {
  htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc;
        }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header {
          background: linear-gradient(135deg, #2c6e49 0%, #1a4d2e 100%);
          color: white; padding: 40px 30px; text-align: center;
        }
        .header h1 { margin: 0; font-size: 1.8rem; font-weight: 700; }
        .content { padding: 40px 30px; }
        .info-box {
          background: #f8fafc; padding: 25px; border-radius: 12px;
          margin: 25px 0; border-left: 4px solid #2c6e49;
        }
        .info-box h3 { margin-top: 0; color: #2c6e49; font-size: 1.2rem; margin-bottom: 20px; }
        .info-row {
          display: flex; justify-content: space-between;
          padding: 12px 0; border-bottom: 1px solid #e2e8f0;
        }
        .info-row:last-child { border-bottom: none; }
        .label { font-weight: 600; color: #64748b; }
        .value { font-weight: 700; color: #1e293b; text-align: right; }
        .important-box {
          background: #f0fdf4; border-left: 4px solid #22c55e;
          padding: 20px; border-radius: 8px; margin: 25px 0;
        }
        .important-box h3 { margin-top: 0; color: #15803d; font-size: 1.1rem; }
        .important-box ul { margin: 10px 0; padding-left: 20px; }
        .important-box li { margin: 8px 0; color: #166534; }
        .button {
          display: inline-block; background: #2c6e49; color: white;
          padding: 16px 40px; text-decoration: none; border-radius: 8px;
          font-weight: 600; margin: 20px 0; text-align: center;
        }
        .footer {
          background: #f8fafc; text-align: center; padding: 30px;
          color: #64748b; font-size: 0.9rem; border-top: 1px solid #e2e8f0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div style="font-size: 3rem; margin-bottom: 1rem;">💈</div>
          <h1>¡Tu turno está reservado!</h1>
        </div>
        
        <div class="content">
          <p style="font-size: 1.1rem;">Hola <strong>${datos.nombre}</strong>,</p>
          <p>Tu reserva en <strong>Barber Ares</strong> fue registrada exitosamente. Te esperamos el día indicado.</p>
          
          <div class="info-box">
            <h3>📋 Detalles de tu turno</h3>
            <div class="info-row">
              <span class="label">✂️ Servicio:</span>
              <span class="value">${datos.servicio}</span>
            </div>
            <div class="info-row">
              <span class="label">💈 Barbero:</span>
              <span class="value">${datos.barbero || 'Por asignar'}</span>
            </div>
            <div class="info-row">
              <span class="label">📅 Fecha:</span>
              <span class="value">${datos.fecha}</span>
            </div>
            <div class="info-row">
              <span class="label">⏰ Hora:</span>
              <span class="value">${datos.hora} hs</span>
            </div>
            <div class="info-row">
              <span class="label">⏱️ Duración:</span>
              <span class="value">${datos.duracion}</span>
            </div>
            <div class="info-row">
              <span class="label">💵 Precio:</span>
              <span class="value">$${datos.precio?.toLocaleString()}</span>
            </div>
          </div>
          
          <div class="important-box">
            <h3>📌 Recordatorios:</h3>
            <ul>
              <li><strong>Llegá 5 minutos antes</strong> de tu horario.</li>
              <li>Para cancelar o reprogramar, avisanos con <strong>24 horas de anticipación</strong>.</li>
              <li>Ante cualquier duda, contactanos por WhatsApp.</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="https://wa.me/5493489594230?text=Hola,%20tengo%20un%20turno%20el%20${encodeURIComponent(datos.fecha)}%20a%20las%20${datos.hora}" class="button">
              💬 Contactar por WhatsApp
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Barber Ares - Barbería Premium</strong></p>
          <p>📍 Campana, Buenos Aires</p>
          <p>📞 WhatsApp: +54 9 3489 594230</p>
          <p>📷 Instagram: <a href="https://www.instagram.com/barber.ares" style="color: #2c6e49;">@barber.ares</a></p>
        </div>
      </div>
    </body>
    </html>
  `
}
    // ✅ CAMBIO CRÍTICO: Usar email verificado de Brevo
    const senderEmail = process.env.NEXT_PUBLIC_OWNER_EMAIL || 'paulbarberiaares@gmail.com'
    
    console.log('📧 Enviando email desde:', senderEmail, 'hacia:', to)

    // Llamada a API de Brevo
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'Barber Ares',
          email: senderEmail // ✅ Email verificado en Brevo
        },
        to: [{ email: to }],
        subject: subjectEmail,
        htmlContent: htmlContent
      })
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error('❌ Error de Brevo:', responseData)
      return NextResponse.json(
        { error: 'Error al enviar el email', details: responseData },
        { status: 500 }
      )
    }

    console.log('✅ Email enviado exitosamente:', responseData)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Email enviado correctamente',
      data: responseData
    })

  } catch (error) {
    console.error('💥 Error en la API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
