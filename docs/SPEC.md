# SPEC — Sitio de Nayra Lancheros

## 1. Modelo de datos (Firestore)

| Colección | Lectura | Escritura | Campos |
|---|---|---|---|
| `profile/main` (doc) | pública | admin | `name, heroBadge, tagline, bioShort, bioLong[], origin ("Bogotá"), base ("Curumaní, Cesar"), coverage, socials[] {network (instagram/tiktok/youtube/facebook), handle, url}, bookingEmail?, whatsapp?` |
| `achievements` | pública | admin | `title, subtitle, kind (ganadora/finalista/participante/tarima/reconocimiento), label, epkLine, date?, featured: bool, order` |
| `shows` | pública (el sitio solo muestra fechas `confirmado`) | admin | `venue, city, date? (YYYY-MM-DD), status (confirmado/por_confirmar), description?, videoUrl?, photos[]`. Pasado/próximo se **deriva** de `date` (hora de Bogotá), no se guarda. |
| `songs` | pública (sin `key`) | admin | `title, artist, genre (Vallenato/Rancheras/Baladas/Celebraciones/Tambora), inMainShow: bool, order`. La tonalidad es **opcional** y vive en `songs/{id}/private/meta {key}` (la manager solo la da si se la piden). |
| `formats` | pública | admin | `name, shortName, durationMin, durationMax, membersLabel ("Voz + guitarra"), membersCount, idealFor, order` |
| `videos` | pública | admin | `title, context ("YouTube · @NAYRA-Lan"), url, featured: bool, order`. Los de YouTube se incrustan con `youtube-nocookie.com` al tocar play. |
| `gallery` | pública | admin | `storagePath (public/gallery/<archivo> en Storage), alt, caption?, order`. La URL pública se arma en el repo. |
| `epk/main` (doc) | admin | admin | datos del EPK: `eyebrow, intro, rate, technicalRider[], hospitalityRider[], coverageStat` |
| `pitch/main` (doc) | admin | admin | plantillas privadas del generador (ver §4) |
| `promoters` | admin | admin | `type, name, city, contact, socialOrWeb, stage, lastContactAt, nextFollowUpAt, eventDate?, notes, source (auto/manual/web_form), createdAt`. Fechas como `YYYY-MM-DD` (Bogotá). |
| `discoveredEvents` | admin | functions + admin | `name, municipality, department, dates, type, contact?, url, sourceName, relevance (0–1), openCall: bool, deadline?, status (pending/approved/discarded), hash` |
| `bookingRequests` | create pública (validada) | admin | lo que llega del formulario de contacto + `status (nuevo/revisado)`; sin `status` cuenta como nuevo |

**`key` privado**: guárdalo en una subcolección `songs/{id}/private/meta` (admin) para que la lectura pública de `songs` no lo exponga. Las rules no filtran campos.

**Etapas (`stage`)**: `prospecto → contactado → en_negociacion → cerrado` y `descartado`. Colores en `design/mockups/Panel.dc.html`.

## 2. Security Rules (idea)
- `isAdmin()` = `request.auth.token.admin == true` (custom claim que se pone una vez con un script admin).
- Colecciones públicas: `allow read: if true; allow write: if isAdmin();`
- Privadas: `allow read, write: if isAdmin();`
- `bookingRequests`: `allow create` con validación de campos/tamaño; nunca `read` público.
- Tests de rules con el emulador.

## 3. Actualización en vivo (decidido en Fase 3)
- El sitio lee Firestore **en el servidor** (Admin SDK) y cachea cada lectura con `"use cache"` + `cacheTag("content")` + `cacheLife("days")` (`src/infrastructure/container.ts`). Los promotores reciben HTML completo: mejor SEO y menos JS.
- Las escrituras pasan por Server Actions del panel, que llaman `updateTag("content")`: el cambio se ve en la siguiente carga. No hace falta trigger de Firestore.
- Trade-off: un cambio hecho a mano en la consola de Firebase tarda hasta que caduque la caché (≤1 día). En dev, una recarga forzada lo muestra.
- `songs/{id}/private/meta` nunca se lee desde el sitio público.

## 4. Pitch / EPK
El EPK (privado, solo admin en `/panel/epk`) se arma con `profile/main` + `epk/main` + `achievements` + `formats` + `videos` + `gallery` (todo editable en el panel):
nombre artístico · bio corta (~50 palabras) · bio larga · fotos de prensa · videos en vivo · géneros · formatos · rider técnico · rider de hospitalidad · logros · prensa · redes · contacto de booking · ciudad base · tarifa ("a convenir" o rango) · disponibilidad.
`pitch/main` (solo admin) guarda únicamente las plantillas del correo por tipo de destinatario. Texto base aportado por la manager: `docs/content/pitch-base.md`.

**Generador** (`/panel/pitch`, hecho en Fase 5): el admin elige un promotor de la base (o escribe los datos) y el tipo de destinatario (`festival | corporativo | hotel | privado`, sugerido por el tipo del promotor).
- `pitch/main` = `{ body, signature, kinds: { <tipo>: { subject, paragraph } } }`. Cuerpo y firma comunes (texto de la manager); cada tipo aporta asunto y párrafo. Variables `{saludo} {nombre} {evento} {ciudad} {fecha} {formatos} {parrafo_evento} {firma} {whatsapp} {correo} {instagram} {tiktok} {facebook} {youtube}`; una variable sin dato queda visible como aviso. Editables en la pestaña «Plantillas».
- El borrador es editable. Botones: copiar, abrir en Gmail web (`authuser` = correo de booking), abrir en la app de correo (`mailto:`), descargar el EPK en PDF.
- «Ya lo envié: marcar «Contactado»» → `stage = contactado`, `lastContactAt = hoy`, `nextFollowUpAt = hoy + 7` (es explícito porque la app no ve el envío).
- La IA (Gemini, «Adaptar con IA») queda para la Fase 6, junto con la búsqueda de eventos.

**EPK privado** (`/panel/epk`) + **PDF** (`GET /panel/epk/pdf`, `@react-pdf/renderer`, solo admin) generado desde los mismos datos: portada; bio y logros; formatos y rider; contacto, videos y fotos. Texto real con metadatos (título, idioma `es`); no es PDF etiquetado (ver `docs/accessibility/AUDIT.md`). El sitio público no enlaza al EPK.

## 5. Búsqueda automática de eventos (`functions/scanEvents`)
- `onSchedule("every 72 hours")`, región cercana (ej. `us-east1`), timeout generoso.
- **No usar Google Custom Search JSON API** (cerrada a clientes nuevos). Opciones: Gemini con grounding en Google Search, o una API de búsqueda (Brave/Tavily) + Gemini para extraer.
- Flujo: queries → resultados → Gemini extrae JSON (validado con Zod) → dedupe por `hash(normalize(name)+year)` → guarda en `discoveredEvents` con `status: pending`.
- **Filtros / queries**:
  - Geografía 1: municipios del Cesar (Curumaní, Chimichagua, Tamalameque, Pailitas, Pelaya, Chiriguaná, La Jagua de Ibirico, Agustín Codazzi, Valledupar, Aguachica, Gamarra, El Paso, Bosconia…). Geografía 2: sur de La Guajira, El Banco (Magdalena), sur de Bolívar.
  - Géneros: vallenato, ranchera, balada, tambora, guacherna, cantadora.
  - Tipos: festival, feria, fiestas patronales, concurso de voces/canción, evento de alcaldía/casa de cultura, corporativo, hotel.
  - Ventana: desde hoy+14 días hasta hoy+6 meses.
  - Señales: convocatoria abierta, fecha límite de inscripción.
  - Fuentes preferidas: `.gov.co`, gobernación, casas de cultura, calendario de ferias y fiestas de Fontur, redes oficiales de festivales.
- `relevance` = puntuación por cercanía, género y tipo. Mostrar ordenado.
- Misma función (o otra diaria): marca promotores en `contactado` con `nextFollowUpAt` vencido para que el panel los resalte.

## 6. Formulario de contratación
Campos: nombre, tipo de evento, fecha, municipio, mensaje (+ teléfono/email). Crea `bookingRequests` y un `promoter` con `source: web_form`, `stage: prospecto`. Anti-spam: App Check o honeypot.

## 7. Fases
1. **Setup**: Next + TS + Tailwind + tokens + fuentes; Firebase project, emuladores, Auth, rules base, CI de lint/typecheck.
2. **Sitio público estático** fiel a los mockups (`/`, `/repertorio`, `/galeria`; EPK en `/panel/epk`) con datos de un seed local.
3. **Firestore**: modelo, seed, repos, rules + tests; el sitio lee de Firestore.
4. **Panel** (hecho): login con Google solo para cuentas en `ADMIN_EMAILS` (blocking functions + session cookie + `requireAdmin()` + rules); `/panel` = inicio con resumen (pendientes, solicitudes, encontrados, analytics en Fase 7); CRUD de shows (incluye el último show), galería (subir/borrar/ordenar), logros, repertorio (tonalidad opcional), formatos, datos del EPK (`/panel/epk/editar`); promotores como `Panel.dc.html` en `/panel/promotores` (filtro en la URL, exportar CSV para Excel, publicar «Cerrado» como show). Todo el panel funciona en celular.
5. **Pitch** (hecho): editor de `pitch/main`, generador, PDF del EPK; auditoría de accesibilidad WCAG 2.2 AA + ISO 9241-110 con tests e2e en CI.
6. **scanEvents** + pestaña "Encontrados automáticamente" + aprobación.
7. **Formulario de contratación**, SEO (metadata, OG image), analítica, deploy, dominio.
