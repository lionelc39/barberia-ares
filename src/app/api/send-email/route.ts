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
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f8fafc;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
            }
            .header {
              background: linear-gradient(135deg, #2c6e49 0%, #1a4d2e 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .logo {
              width: 80px;
              height: 80px;
              background: white;
              border-radius: 50%;
              margin: 0 auto 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 2.5rem;
            }
            .header h1 {
              margin: 0;
              font-size: 1.8rem;
              font-weight: 700;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 1.1rem;
              margin-bottom: 20px;
            }
            .info-box {
              background: #f8fafc;
              padding: 25px;
              border-radius: 12px;
              margin: 25px 0;
              border-left: 4px solid #2c6e49;
            }
            .info-box h3 {
              margin-top: 0;
              color: #2c6e49;
              font-size: 1.2rem;
              margin-bottom: 20px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 12px 0;
              border-bottom: 1px solid #e2e8f0;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .label {
              font-weight: 600;
              color: #64748b;
            }
            .value {
              font-weight: 700;
              color: #1e293b;
              text-align: right;
            }
            .price-highlight {
              background: #2c6e49;
              color: white;
              padding: 20px;
              border-radius: 12px;
              text-align: center;
              margin: 25px 0;
              font-size: 1.3rem;
              font-weight: 700;
            }
            .important-box {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 20px;
              border-radius: 8px;
              margin: 25px 0;
            }
            .important-box h3 {
              margin-top: 0;
              color: #92400e;
              font-size: 1.1rem;
            }
            .important-box ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .important-box li {
              margin: 8px 0;
              color: #78350f;
            }
            .button {
              display: inline-block;
              background: #2c6e49;
              color: white;
              padding: 16px 40px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
              text-align: center;
            }
            .button:hover {
              background: #1a4d2e;
            }
            .footer {
              background: #f8fafc;
              text-align: center;
              padding: 30px;
              color: #64748b;
              font-size: 0.9rem;
              border-top: 1px solid #e2e8f0;
            }
            .footer-strong {
              color: #1e293b;
              font-weight: 600;
            }
            .divider {
              height: 1px;
              background: #e2e8f0;
              margin: 30px 0;
            }
            @media only screen and (max-width: 600px) {
              .content {
                padding: 30px 20px;
              }
              .info-row {
                flex-direction: column;
                gap: 5px;
              }
              .value {
                text-align: left;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <div class="logo">💈</div>
              <h1>¡Tu turno está confirmado!</h1>
            </div>
            
            <!-- Content -->
            <div class="content">
              <p class="greeting">Hola <strong>${datos.nombre}</strong>,</p>
              
              <p>Recibimos tu reserva y confirmamos tu turno en <strong>Barber Ares</strong>. ¡Nos vemos pronto!</p>
              
              <!-- Info Box -->
              <div class="info-box">
                <h3>📋 Detalles de tu turno</h3>
                
                <div class="info-row">
                  <span class="label">✂️ Servicio:</span>
                  <span class="value">${datos.servicio}</span>
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
                  <span class="label">👤 Cliente:</span>
                  <span class="value">${datos.nombre}</span>
                </div>
                
                <div class="info-row">
                  <span class="label">📱 Contacto:</span>
                  <span class="value">${datos.whatsapp}</span>
                </div>
              </div>
              
              <!-- Price -->
              <div class="price-highlight">
                Total a abonar: $${datos.precio.toLocaleString()}
              </div>
              
              <!-- Important Info -->
              <div class="important-box">
                <h3>⚠️ Importante - Lee antes de tu turno:</h3>
                <ul>
                  <li><strong>Llegá 5 minutos antes</strong> de tu horario programado.</li>
                  <li>Si necesitás <strong>cancelar o reprogramar</strong>, avisanos con al menos <strong>24 horas de anticipación</strong>.</li>
                  <li>Podés traer tu propia toalla si lo preferís (también tenemos disponibles).</li>
                  <li>El pago se realiza en efectivo o transferencia al finalizar el servicio.</li>
                </ul>
              </div>
              
              <div class="divider"></div>
              
              <!-- WhatsApp Button -->
              <div style="text-align: center;">
                <a href="https://wa.me/5493489594230?text=Hola,%20tengo%20un%20turno%20confirmado%20para%20el%20${encodeURIComponent(datos.fecha)}%20a%20las%20${datos.hora}" class="button">
                  💬 Contactar por WhatsApp
                </a>
              </div>
              
              <p style="margin-top: 30px; font-size: 0.95rem; color: #64748b;">
                ¿Tenés alguna duda o consulta? No dudes en responder este email o escribirnos por WhatsApp. Estamos para ayudarte.
              </p>
              
              <p style="margin-top: 30px; color: #1e293b;">
                ¡Gracias por confiar en nosotros! 👋<br>
                <strong>El equipo de Barber Ares</strong>
              </p>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <p class="footer-strong">Barber Ares - Barbería Premium</p>
              <p>📍 Campana, Buenos Aires, Argentina</p>
              <p>📞 WhatsApp: +54 9 3489 594230</p>
              <p>📷 Instagram: <a href="https://www.instagram.com/barber.ares" style="color: #2c6e49; text-decoration: none;">@barber.ares</a></p>
              <p style="margin-top: 20px; font-size: 0.8rem; color: #94a3b8;">
                Este es un email automático de confirmación.<br>
                Si no solicitaste este turno, por favor ignorá este mensaje o contactanos.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    }

    const { data, error } = await resend.emails.send({
      from: 'Barber Ares <onboarding@resend.dev>',
      to: [to],
      subject: subjectEmail,
      html: htmlContent,
    })

    if (error) {
      console.error('Error al enviar email:', error)
      return NextResponse.json(
        { error: 'Error al enviar el email', details: error },
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
