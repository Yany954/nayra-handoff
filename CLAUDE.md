# CLAUDE.md — Sitio de Nayra Lancheros

Sitio de booking para la cantante Nayra Lancheros (vallenato, rancheras, baladas, tambora; nacida en Bogotá, radicada en Curumaní, Cesar, Colombia).
Tiene dos partes:
1. **Sitio público**: portafolio para que promotores la contraten (el EPK es privado: la manager lo envía como PDF).
2. **Panel de la manager** (su mamá): base de datos de promotores/eventos, logros, repertorio, generador de pitch y seguimiento tipo CRM.

Spec completo (modelo de datos, reglas, funciones, fases): **`docs/SPEC.md`**. Léelo antes de planear.

## Cómo trabajar conmigo
- Soy la dev (Yany). **Quiero entender las decisiones, no solo recibir código**: antes de implementar algo no trivial, explica en 3–5 líneas el porqué (patrón, trade-off) y luego hazlo.
- Trabaja por fases (ver `docs/SPEC.md` → Fases). Empieza cada fase en plan mode y espera mi OK.
- Commits pequeños, uno por feature. No hagas push ni deploy sin que te lo pida.
- Español para el contenido del sitio y la UI. Código, nombres de variables y commits en inglés.

## Stack
- **Next.js (App Router) + TypeScript** estricto. Tailwind para estilos.
- **Firebase**: App Hosting (o Hosting), Firestore, Auth (Google + email), Storage (fotos), Cloud Functions v2 (Node/TS).
- **Gemini** (Vertex AI / Firebase AI Logic) para: extraer eventos de resultados de búsqueda y adaptar el texto del pitch.
- Plan **Blaze** (necesario para funciones programadas). Configurar alerta de presupuesto.

## Arquitectura (clean architecture)
```
src/
  domain/          # entidades y reglas puras: Promoter, Stage, Achievement, Song, Show, PitchProfile
  application/     # casos de uso: approveDiscoveredEvent, moveStage, generatePitch, publishShow
  infrastructure/  # Firestore repos, Storage, Gemini client, search provider
  presentation/    # app/ (rutas Next), components/, ui/
functions/         # Cloud Functions (scanEvents programada, triggers)
```
- `domain` no importa nada de Firebase ni de React.
- Repositorios detrás de interfaces en `domain`; implementaciones en `infrastructure`.
- Validación con Zod en los bordes (formularios, datos de Firestore, salida de Gemini).

## Diseño: la fuente de verdad son los mockups
- `design/mockups/*.dc.html` = mockups exportados del canvas. Lee `design/README.md` para entender su formato.
- `design/screenshots/` = capturas PNG de cada pantalla (si existen, úsalas para comparar visualmente).
- `design/assets/` = fotos reales de Nayra.
- Replica layout, espaciado, tipografía y colores **fielmente**. Si algo del mockup no es viable, pregúntame antes de cambiarlo.

### Tokens
| Token | Valor |
|---|---|
| `ink` (fondo oscuro) | `#0F0C0E` |
| `cream` (fondo claro) | `#F4EEE4` |
| `text-light` / `text-dark` | `#F6EFE6` / `#1A1416` |
| `muted-on-dark` / `muted-on-light` | `#C9BFB4` / `#6B5F57` |
| `accent` (dorado) | `#F0B24A` |
| `card-dark` | `rgba(255,255,255,0.05)` + borde `rgba(255,255,255,0.10)` |
| `card-light` | `#FFFFFF` + borde `#E4DACB` |
| Fuentes | Display: **Bricolage Grotesque** 500/700 · Texto: **Inter** 400/500/600 (next/font) |
| Radios | pills 999px · tarjetas 18–24px · hero/imagenes 28–32px |
- Tarjetas "glass" sobre foto: `rgba(20,16,18,0.6)` + `backdrop-filter: blur(14px)`.
- Accesibilidad: contraste AA, `<button>`/`<a>` reales, targets ≥44px, `alt` en imágenes.
- Mobile-first: todo debe funcionar a 390px (ver `Mobile.dc.html`).

## Rutas
| Ruta | Mockup | Acceso |
|---|---|---|
| `/` | `Main.dc.html` (+ `Mobile.dc.html`) | público |
| `/repertorio` | `Repertorio.dc.html` | público |
| `/galeria` | sin mockup (mismos tokens que `Main.dc.html`) | público |
| `/panel/epk` | `EPK.dc.html` (sin la sección "Generador de pitch") | solo admin |
| `/panel` | `Panel.dc.html` | solo admin |
| `/panel/pitch` | sección "Generador de pitch" de `EPK.dc.html` | solo admin |

## Reglas que no se rompen
- **Las tonalidades (`key`) del repertorio nunca se muestran en el sitio público.**
- Los datos marcados `[ejemplo]` en los mockups son falsos: en producción sale de Firestore, nunca hardcodeado.
- Nada que encuentre la búsqueda automática entra a `promoters` sin aprobación manual en el panel.
- Escritura en Firestore solo para el admin (custom claim `admin: true`). Lectura pública solo en colecciones públicas.
- Nunca commitear `.env*`, service accounts ni API keys.

## Comandos
```
cp .env.example .env.local   # una vez: apunta Next y los scripts a los emuladores
npm run emulators      # terminal 1: Auth/Firestore/Storage locales (datos en ./emulator-data)
npm run seed           # carga el contenido de src/infrastructure/seed (solo emuladores)
npm run dev            # terminal 2: Next en local, lee de Firestore
npm run lint && npm run typecheck && npm test
npm run test:rules     # tests de rules (con los emuladores corriendo)
npm run test:rules:ci  # igual, pero levanta sus propios emuladores
```
