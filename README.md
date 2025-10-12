# Barber Ares — Sistema de Turnos (Starter)

Este repositorio contiene un **proyecto starter** (Next.js + Tailwind + Supabase) listo para subir a **GitHub** y desplegar en **Vercel**.

**Importante**: el ZIP NO incluye tu `logo.png` ni **secretos**. Sigue las instrucciones para añadir el logo y configurar variables.

---

## ¿Qué hay en este ZIP?
- Código fuente en `src/` con páginas: Home, Register, Login, Reserva, Admin (básico).
- Componentes: Header y CalendarPicker (sencillo).
- `lib/supabase.ts` para conectar con Supabase (cliente).
- `README.md` (este archivo).
- `.env.example` con variables necesarias.
- `vercel.json` para despliegue.

---

## Antes de subir: crear cuentas (NO es necesario instalar apps)
1. Crear cuenta en **GitHub** si no tienes.
2. Crear cuenta en **Vercel** si no tienes.
3. Crear proyecto en **Supabase** (gratuito, PostgreSQL + Auth).

---

## Pasos rápidos para desplegar (resumen)
1. Extrae este ZIP en tu PC.
2. Abre la carpeta en VS Code (opcional).
3. Coloca el logo en `public/logo.png` (descárgalo de Instagram: abre el perfil y guarda la imagen).
4. Crear un repo en GitHub y subir todo (git init, add, commit, push).
5. En Vercel: "Import Project" → conecta tu repo de GitHub → desplegar.
6. En Vercel, añade las variables de entorno (lista abajo).
7. En Supabase: crea las tablas `clientes` y `turnos` (SQL provisto más abajo).
8. Configura Resend (opcional) y añade su API key en Vercel.

---

## Variables de entorno (ponerlas en Vercel / .env.local localmente)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY  (solo si vas a ejecutar funciones server-side)
- RESEND_API_KEY
- NEXT_PUBLIC_OWNER_EMAIL (email del dueño para ver panel admin)

> **No** subas `.env.local` a GitHub.

---

## SQL para crear tablas (en SQL editor de Supabase)
Copia y pega en el editor SQL de Supabase:

```sql
-- Tabla clientes
create table public.clientes (
  id uuid default gen_random_uuid() primary key,
  nombre text,
  apellido text,
  dni text,
  email text unique,
  whatsapp text,
  created_at timestamptz default now()
);

-- Tabla turnos
create table public.turnos (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid references public.clientes(id),
  nombre_cliente text,
  email text,
  whatsapp text,
  fecha date,
  hora text,
  estado text default 'reservado',
  created_at timestamptz default now()
);

-- Index para fecha/hora
create index on public.turnos (fecha, hora);
```

---

## Archivos principales y para qué sirven (breve)
- `src/app/layout.tsx` — Layout global (header/footer).
- `src/app/page.tsx` — Página Home.
- `src/app/register/page.tsx` — Formulario de registro de clientes.
- `src/app/login/page.tsx` — Login por email/password (Supabase Auth).
- `src/app/reserva/page.tsx` — Reserva de turnos (usa CalendarPicker).
- `src/components/Header.tsx` — Header con botón a Instagram.
- `src/components/CalendarPicker.tsx` — Selector de fecha y slots.
- `src/lib/supabase.ts` — Cliente Supabase (usa variables de entorno).
- `vercel.json` — Config mínima para Vercel.

---

## Deploy detallado paso a paso (para no programadores)

### 1) Subir a GitHub
1. Crear un nuevo repositorio en GitHub.
2. En tu PC:
   - `git init`
   - `git add .`
   - `git commit -m "primer commit - barberia-turnos"`
   - `git branch -M main`
   - `git remote add origin <url-del-repo>`
   - `git push -u origin main`

### 2) Conectar GitHub a Vercel y desplegar
1. Ingresa a Vercel (https://vercel.com) y crea un nuevo proyecto.
2. Selecciona "Importar desde Git" → elige tu repo.
3. Vercel detectará Next.js. Antes de desplegar, agrega las Variables de Entorno (ver arriba).
4. Despliega. Vercel hará build y te dará una URL pública.

### 3) Configurar Supabase
1. En supabase.com, crea un proyecto (registra password).
2. En "API" copia `URL` y `anon key` y pégalos en Vercel como:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
3. Ve a "SQL Editor" y ejecuta el SQL para crear tablas (proporcionado más arriba).

### 4) Configurar envío de emails (Resend)
1. Crear cuenta en Resend (https://resend.com) y generar API key.
2. Guardar la key en Vercel como `RESEND_API_KEY`.
3. En el proyecto, hay una función serverless (ejemplo) que usará esa key para enviar confirmaciones.

---

## Personalizaciones y notas
- Descargar logo desde Instagram manualmente y pegar en `public/logo.png`.
- Si quieres recordatorios por WhatsApp, hace falta una API externa (Twilio) y costos asociados.
- La plantilla usa Supabase Auth; los usuarios deberán confirmar email según la configuración de Supabase.

---

## ¿Necesitas ayuda manual?
Si querés, te puedo guiar paso a paso en cada punto (crear repo, conectar a Vercel, pegar variables). Dime qué parte preferís que haga contigo.

