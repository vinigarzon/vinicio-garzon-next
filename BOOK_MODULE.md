# Módulo de reservas — `/book`

Agendador propio, estilo Calendly, para viniciogarzon.com. Alguien entra al link, ve la
disponibilidad real, elige día y hora y reserva; la cita se bloquea en Google Calendar y salen los
correos. Es un **módulo aditivo**: vive en sus propias carpetas y no toca la lógica del blog ni del
portafolio.

- Página pública: `https://www.viniciogarzon.com/book`
- Admin: `https://www.viniciogarzon.com/book/admin`
- Gestionar una cita: `/book/manage/<token>` (el link va en los correos)

No está enlazado desde ninguna página del sitio y responde con `noindex, nofollow`.

## Qué hace

- Disponibilidad calculada en vivo: reglas semanales − fechas bloqueadas − reservas previas (con sus
  colchones) − lo que ya esté ocupado en tu Google Calendar (`freeBusy`).
- Timezones reales: tú defines tus horarios en `America/Chicago`, el visitante los ve en su zona
  horaria y los cambios de horario de verano están cubiertos por tests.
- Doble reserva imposible: Postgres tiene una restricción de exclusión que rechaza cualquier solape
  entre citas confirmadas, incluso si dos personas confirman en el mismo segundo.
- Bilingüe ES/EN: detecta el idioma del navegador y se puede forzar con `?lang=es` o `?lang=en`.
- Cancelar y reagendar desde el link del correo, respetando las horas de corte que configures.

## Estructura

```
src/app/book/              página pública, gestión de cita y admin
src/app/api/book/          endpoints (availability, bookings, manage, google, admin, ping)
src/lib/book/              lógica: store, google, availability, service, auth, email, i18n, time
supabase/book_schema.sql   esquema de la base (correr una vez)
scripts/book-availability.test.js   tests del motor de disponibilidad
```

Archivos existentes que se tocaron: `next.config.js` (header `X-Robots-Tag` para `/book`) y
`package.json` (dependencias `@supabase/supabase-js` y `resend`, más el script `test:book`).
Nada más.

## Puesta en marcha

1. **Base de datos.** En Supabase → proyecto `viniciogarzon-book` → SQL Editor, pegar y correr
   `supabase/book_schema.sql`. Es idempotente.
2. **Variables de entorno.** Copiar `.env.book.example` a `.env.local` para desarrollo, y cargar las
   mismas variables en Netlify para producción.
3. **Google Cloud.** Proyecto propio (`viniciogarzon-book`), independiente de cualquier otro. En el
   cliente OAuth de tipo *Web application*, agregar como *Authorized redirect URIs*:
   - `https://www.viniciogarzon.com/api/book/google/callback`
   - `http://localhost:3000/api/book/google/callback`

   Scopes necesarios: `calendar.events`, `calendar.readonly`, `userinfo.email`.

   La app debe quedar **publicada en producción** (botón *Publish app* en la pestaña *Audience*).
   No hace falta pasar la verificación de Google: al ser de uso personal basta con aceptar una vez la
   pantalla de "app no verificada". Lo que **sí** importa es no dejarla en modo *Testing*: ahí Google
   caduca el refresh token cada 7 días y habría que reconectar el calendario todas las semanas.
4. **Resend.** Verificar el dominio y poner la API key. Sin esto la reserva funciona igual (la
   invitación de Google sale), pero no salen los correos con tu marca.
5. **Admin.** Entrar a `/book/admin`, conectar Google Calendar, pegar el link de Zoom y definir el
   horario semanal.
6. **Keep-alive.** Los proyectos gratuitos de Supabase se pausan tras ~7 días sin actividad. Programar
   un GET diario a `https://www.viniciogarzon.com/api/book/ping` (por ejemplo con cron-job.org) para
   que el link nunca amanezca caído.

## Comandos

```bash
npm run dev         # desarrollo
npm run build       # build de producción
npm run test:book   # tests del motor de disponibilidad (timezones, DST, buffers, límites)
```

## Decisiones que conviene recordar

- **Sin la librería `googleapis`**: se habla con la API REST usando `fetch`. Pesa decenas de MB y esto
  corre en funciones serverless.
- **El evento de Google es la fuente de verdad.** Si crear el evento falla, la reserva se revierte:
  preferimos un error visible antes que una cita que existe en la base pero no en tu calendario.
- **Los correos nunca rompen una reserva.** Si Resend falla, se registra en los logs y el flujo sigue.
- **El admin no reutiliza el patrón de `/admin`.** Aquel compara la contraseña en el navegador contra
  una variable `NEXT_PUBLIC`; aquí hay tokens de Google de por medio, así que la sesión es una cookie
  `httpOnly` firmada con HMAC y la contraseña solo se compara en el servidor.
- **RLS activo sin ninguna policy.** Las tablas solo son accesibles con la service role key, que vive
  únicamente en el servidor.
