# Stylo — Peluquería de autor

Sitio web de **Stylo**, salón de peluquería en Andorra la Vella. Es una landing editorial estática con una experiencia visual controlada por scroll, información de servicios y reserva online mediante Cal.com.

## Qué incluye

- Hero audiovisual: una secuencia de 120 imágenes WebP se dibuja en un `<canvas>` según el scroll, con imagen de respaldo mientras los frames cargan.
- Servicios, precios orientativos, duración, contacto y acceso directo a WhatsApp.
- Calendario de reserva embebido de Cal.com (`peluqueriaa`).
- Integración de las reservas de Cal.com con n8n para unificar el seguimiento y los recordatorios por WhatsApp.
- Diseño adaptable a escritorio, tablet y móvil; `prefers-reduced-motion` reduce las animaciones decorativas de CSS y hay focos visibles para teclado.
- Animaciones de aparición de las secciones con `IntersectionObserver`.
- Endpoint serverless opcional para crear reservas mediante la API v2 de Cal.com.

## Tecnologías

No hay dependencias de Node.js ni proceso de compilación para la web:

- HTML, CSS y JavaScript nativos.
- Google Fonts (`Instrument Sans` y `Newsreader`).
- Cal.com Embed para el calendario público.
- Vercel Functions para `api/bookings.js` cuando se despliega en Vercel.

## Estructura

```text
.
├── api/
│   └── bookings.js             # Endpoint opcional para la API de Cal.com
├── media/
│   ├── frames/                 # frame_0001.webp … frame_0120.webp
│   ├── hair-style-journey.jpg
│   └── salon-hero-poster.jpg
├── index.html                  # Contenido, calendario Cal.com y metadatos
├── script.js                   # Canvas del hero y revelado al hacer scroll
├── styles.css                  # Diseño, animaciones y reglas responsive
├── vercel.json                 # Configuración de la función serverless
└── README.md
```

## Ejecutar en local

Desde la raíz del proyecto:

```bash
python3 -m http.server 8000
```

Abre [http://localhost:8000](http://localhost:8000). La página puede abrirse como archivo, pero un servidor HTTP local evita restricciones al cargar las imágenes del hero.

La sección de reserva carga recursos de `app.cal.com`, por lo que necesita conexión a Internet. La función `api/bookings.js` no se ejecuta con `python3 -m http.server`; para probarla localmente se necesita el entorno de desarrollo de Vercel.

## Reservas

### Calendario de la web

`index.html` incrusta el calendario de Cal.com con el enlace `peluqueriaa`. Es el mecanismo de reserva que utiliza actualmente la interfaz pública. Los enlaces de cada servicio desplazan a esa sección; no seleccionan automáticamente un tipo de servicio.

Para cambiar el calendario o su presentación, edita el bloque de Cal.com en `index.html`:

- `calLink`: enlace público de Cal.com.
- `layout`: vista del calendario.
- `hideEventTypeDetails`: visibilidad de los detalles de cada tipo de evento.

### Seguimiento y recordatorios

Las reservas creadas por el agente de OpenLivery y las creadas desde la web terminan en el mismo calendario de Cal.com. Para que ambas entren en el mismo control de recordatorios, Cal.com debe enviar sus eventos a un webhook de n8n.

El flujo operativo es:

```text
OpenLivery o web → Cal.com → webhook de n8n → tabla reservas_stylo → cron de n8n → plantilla oficial de WhatsApp
```

El webhook debe crear o actualizar una fila en `reservas_stylo` con, como mínimo, el identificador de la reserva, fecha/hora, nombre, teléfono, servicio y estado. Las cancelaciones deben marcar o eliminar la fila para que no se envíe un recordatorio. El cron consultará únicamente esa tabla y marcará cada aviso como enviado para evitar duplicados.

El webhook de Cal.com está integrado con n8n para recibir los eventos de reserva y cancelación. La automatización mantiene el seguimiento en `reservas_stylo` y permite que el cron de n8n gestione los recordatorios por WhatsApp. No debe enviarse información de clientes ni secretos al repositorio.

### API opcional: `POST /api/bookings`

Al desplegar en Vercel se publica una función serverless que reenvía reservas a `https://api.cal.com/v2/bookings`. La landing no la llama por defecto: está disponible para integrar un formulario o cliente propio sin exponer una clave en el navegador.

La petición debe ser JSON y requiere:

- La cabecera `Authorization: Bearer <OPENLIVERY_BOOKING_SECRET>`.
- `start`: fecha y hora ISO 8601.
- `name`: nombre del asistente.
- `email`: correo válido del asistente.
- `phoneNumber` (o `phone_number`): teléfono del asistente.
- Uno de `eventTypeSlug` / `event_type_slug` o `eventTypeId` / `event_type_id`.

También admite `timeZone` / `time_zone` (por defecto `Europe/Andorra`), `language` (por defecto `es`), `lengthInMinutes` / `length_in_minutes`, `notes` y `username` (por defecto `peluqueriaa`).

Ejemplo:

```bash
curl -X POST https://TU-DOMINIO/api/bookings \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer TU_SECRETO_COMPARTIDO' \
  -d '{
    "start": "2026-09-15T10:00:00Z",
    "name": "Nombre del cliente",
    "email": "cliente@example.com",
    "phoneNumber": "+376600000",
    "timeZone": "Europe/Andorra",
    "eventTypeSlug": "peinados"
  }'
```

`OPENLIVERY_BOOKING_SECRET` es obligatorio: protege este endpoint para que solo el sistema autorizado pueda crear reservas. `CAL_API_KEY` es opcional; si se configura como variable de entorno de Vercel, la función la envía como `Bearer` al API de Cal.com. Nunca incluyas secretos en `index.html`, `script.js` ni en el repositorio. La función permite `POST` y solicitudes CORS `OPTIONS`, y responde sin caché.

## Despliegue

La parte estática puede publicarse en cualquier servidor de archivos estáticos conservando la estructura de `media/`. Para disponer de `/api/bookings`, despliega el proyecto en Vercel: `vercel.json` configura esa función con una duración máxima de 10 segundos.

Antes de publicar, comprueba que el enlace de Cal.com, teléfono, dirección, horarios y enlaces de redes sociales de `index.html` sean los definitivos. Los iconos de Instagram y Pinterest tienen `href="#"` actualmente y deben sustituirse por las URLs reales antes de promocionar el sitio.

## Personalización

- **Contenido comercial y contacto:** `index.html`.
- **Paleta, espaciado y comportamiento responsive:** variables y reglas de `styles.css`.
- **Hero:** reemplaza los frames en `media/frames/` y ajusta `TOTAL_FRAMES` en `script.js` si cambia su número. Deben conservar el patrón `frame_0001.webp`, `frame_0002.webp`, etc.

## Licencia

No se ha definido una licencia para este proyecto.
