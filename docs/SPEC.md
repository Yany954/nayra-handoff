# SPEC — Sitio de Nayra Lancheros

## 1. Modelo de datos (Firestore)

| Colección | Lectura | Escritura | Campos |
|---|---|---|---|
| `profile/main` (doc) | pública | admin | `name, heroBadge, tagline, bioShort, bioLong[], origin ("Bogotá"), base ("Curumaní, Cesar"), coverage, socials[] {network (instagram/tiktok/youtube/facebook), handle, url}, bookingEmail?, whatsapp?` |
| `achievements` | pública | admin | `title, subtitle, kind (ganadora/finalista/participante/tarima/reconocimiento), label, epkLine, date?, featured: bool, order` |
| `shows` | pública (el sitio solo muestra fechas `confirmado`) | admin | `venue, city, date? (YYYY-MM-DD), status (confirmado/por_confirmar), description?, videoUrl?, photos[]`. Pasado/próximo se **deriva** de `date` (hora de Bogotá), no se guarda. |
| `songs` | pública (sin `key`) | admin | `title, artist, genre (Vallenato/Rancheras/Baladas/Celebraciones/Tambora), inMainShow: bool, key (privado), order` |
| `formats` | pública | admin | `name, shortName, durationMin, durationMax, membersLabel ("Voz + guitarra"), membersCount, idealFor, order` |
| `videos` | pública | admin | `title, context ("YouTube · @NAYRA-Lan"), url, featured: bool, order`. Los de YouTube se incrustan con `youtube-nocookie.com` al tocar play. |
| `gallery` | pública | admin | `src (Storage), alt, caption?, order` |
| `epk/main` (doc) | admin | admin | datos del EPK: `eyebrow, intro, rate, technicalRider[], hospitalityRider[], coverageStat` |
| `pitch/main` (doc) | admin | admin | plantillas privadas del generador (ver §4) |
| `promoters` | admin | admin | `type, name, city, contact, socialOrWeb, stage, lastContactAt, nextFollowUpAt, eventDate?, notes, source (auto/manual/web_form), createdAt` |
| `discoveredEvents` | admin | functions + admin | `name, municipality, department, dates, type, contact?, url, sourceName, relevance (0–1), openCall: bool, deadline?, status (pending/approved/discarded), hash` |
| `bookingRequests` | create pública (validada) | admin | lo que llega del formulario de contacto |

**`key` privado**: guárdalo en una subcolección `songs/{id}/private/meta` (admin) para que la lectura pública de `songs` no lo exponga. Las rules no filtran campos.

**Etapas (`stage`)**: `prospecto → contactado → en_negociacion → cerrado` y `descartado`. Colores en `design/mockups/Panel.dc.html`.

## 2. Security Rules (idea)
- `isAdmin()` = `request.auth.token.admin == true` (custom claim que se pone una vez con un script admin).
- Colecciones públicas: `allow read: if true; allow write: if isAdmin();`
- Privadas: `allow read, write: if isAdmin();`
- `bookingRequests`: `allow create` con validación de campos/tamaño; nunca `read` público.
- Tests de rules con el emulador.

## 3. Actualización en vivo
- El sitio público lee Firestore. Para que un logro nuevo aparezca "de una": `onSnapshot` en el cliente para secciones dinámicas (logros, próximas fechas), **o** render en servidor + `revalidateTag` disparado por un trigger de Firestore. Explícame el trade-off (SEO vs simplicidad) antes de elegir.

## 4. Pitch / EPK
El EPK (privado, solo admin en `/panel/epk`) se arma con `profile/main` + `epk/main` + `achievements` + `formats` + `videos` + `gallery` (todo editable en el panel):
nombre artístico · bio corta (~50 palabras) · bio larga · fotos de prensa · videos en vivo · géneros · formatos · rider técnico · rider de hospitalidad · logros · prensa · redes · contacto de booking · ciudad base · tarifa ("a convenir" o rango) · disponibilidad.
`pitch/main` (solo admin) guarda únicamente las plantillas del correo por tipo de destinatario. Texto base aportado por la manager: `docs/content/pitch-base.md`.

**Generador**: el admin elige destinatario (`festival | corporativo | hotel | privado`) → plantilla base + párrafo adaptado (puede ser plantilla fija o Gemini) → asunto + cuerpo. Botones: copiar, abrir en Gmail (`mailto:`), y al enviar: el promotor pasa a `contactado`, `lastContactAt = now`, `nextFollowUpAt = now + 7d`.
**EPK privado** (`/panel/epk`) + PDF generado desde los mismos datos, que la manager adjunta en sus correos. El sitio público no enlaza al EPK.

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
4. **Panel**: login admin, CRUD de logros, repertorio, formatos, shows; tabla de promotores con filtro por etapa (mockup `Panel.dc.html`).
5. **Pitch**: editor de `pitch/main`, generador, EPK privado y PDF.
6. **scanEvents** + pestaña "Encontrados automáticamente" + aprobación.
7. **Formulario de contratación**, SEO (metadata, OG image), analítica, deploy, dominio.
