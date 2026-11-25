# Nayra Lancheros — sitio de booking y panel de la manager

Sitio para que promotores, festivales, hoteles y familias contraten a **Nayra Lancheros**, cantante de vallenato, rancheras, baladas y tambora, nacida en Bogotá y radicada en Curumaní, Cesar. Incluye un **panel privado** para su manager (su mamá): CRM de promotores, contenido del sitio, EPK en PDF, generador de pitch y búsqueda automática de eventos.

| | |
|---|---|
| **Sitio público** | `/` (inicio), `/repertorio`, `/galeria` |
| **Panel** (solo 2 cuentas de Google) | `/panel` y sus secciones: promotores, logros, repertorio, shows, formatos, videos, galería, pitch y EPK |
| **Producción** | Firebase App Hosting (`nayra-lancheros`, `us-east4`), URL `*.hosted.app` (sin dominio propio por ahora) |
| **Repo** | `github.com/Yany954/nayra-handoff`. **Ojo: es público**; nada secreto va aquí (ver [Secretos](#variables-de-entorno-y-secretos)) |

---

## Contenido
1. [Qué hace](#qué-hace)
2. [Servicios y cuentas](#servicios-y-cuentas) ⭐ para no perder el rastro
3. [Variables de entorno y secretos](#variables-de-entorno-y-secretos)
4. [Arquitectura](#arquitectura)
5. [Correrlo en local](#correrlo-en-local)
6. [Tests y calidad](#tests-y-calidad)
7. [Deploy](#deploy)
8. [Estructura de carpetas](#estructura-de-carpetas)
9. [Documentos relacionados](#documentos-relacionados)

---

## Qué hace

**Sitio público.** Hero, logros, formatos del show, videos en vivo, galería, historia, próximas fechas (solo las confirmadas) y contacto por WhatsApp y correo. Repertorio con filtros por género. Las **tonalidades nunca se muestran en público**.

**Panel de la manager.** Funciona en celular.
- **Inicio:** seguimientos vencidos, solicitudes nuevas, eventos encontrados y conteo por etapa.
- **Promotores:** CRM con etapas prospecto → contactado → en negociación → cerrado / descartado. Al pasar a «Contactado» programa el seguimiento a 7 días. Exporta a Excel (CSV) y publica un «Cerrado» como show con un clic.
- **Encontrados automáticamente:** búsqueda de festivales, ferias y convocatorias cada 3 días. Nada entra a la base sin aprobación.
- **Contenido del sitio:** logros, repertorio (tonalidad opcional y privada), shows (incluye el «último show»), formatos, videos y galería (subir, ordenar, describir, borrar).
- **EPK:** vista previa, edición de textos, tarifa y riders, y **descarga en PDF** con los mismos datos.
- **Pitch:** correo por tipo de destinatario armado con el texto de la manager. Se abre en Gmail o en la app de correo, tiene la opción «Adaptar párrafo con IA» y un botón para marcar el promotor como «Contactado».

---

## Servicios y cuentas

Todos los servicios que usa el proyecto: para qué sirve cada uno, con qué cuenta está y cuánto cuesta. Cuentas: **Yany** = tu cuenta de Google personal (dev y dueña del proyecto), **Manager** = la mamá, **Booking** = `contacto.nayra.lancheros@gmail.com`.

| Servicio | Para qué | Cuenta / dueño | Dónde está la llave | Costo esperado | Consola |
|---|---|---|---|---|---|
| **Firebase / Google Cloud** (proyecto `nayra-lancheros`) | Todo el backend | Yany (owner) | — | Plan **Blaze**, ver filas siguientes | [console.firebase.google.com](https://console.firebase.google.com/project/nayra-lancheros) |
| ↳ Facturación «Pago de Firebase» | Paga el plan Blaze | Yany | — | **Alerta de presupuesto: USD 5** | [Facturación](https://console.cloud.google.com/billing) |
| ↳ **App Hosting** | Sirve el sitio Next.js (SSR) desde GitHub `main` | Proyecto | Usa la cuenta de servicio automática | ~USD 0–1/mes (escala a 0) | Firebase → App Hosting |
| ↳ **Firestore** (`us-east4`) | Base de datos: contenido, promotores, pitch, eventos | Proyecto | — | Gratis hasta 50k lecturas/día | Firebase → Firestore |
| ↳ **Storage** (`us-east1`) | Fotos de la galería (`public/gallery/`) | Proyecto | — | Gratis hasta 5 GB | Firebase → Storage |
| ↳ **Authentication + Identity Platform** | Login con Google del panel | Proyecto | — | Gratis < 50k usuarios/mes (son 2) | Firebase → Authentication |
| ↳ **Cloud Functions v2** | `onlyAdminsCanSignUp/SignIn` (solo 2 correos entran), `scanEvents` (cada 72 h), `onScanRequested` («Buscar ahora») | Proyecto | — | Gratis (2M invocaciones/mes) | Firebase → Functions |
| ↳ **Cloud Scheduler** | Dispara `scanEvents` cada 3 días | Proyecto | — | Gratis (3 jobs) | Cloud Console → Scheduler |
| ↳ **Secret Manager** | Guarda `ADMIN_EMAILS`, `OPENAI_API_KEY`, `TAVILY_API_KEY` | Proyecto | Aquí viven los secretos | ~USD 0 | Cloud Console → Secret Manager |
| **GitHub** (`Yany954/nayra-handoff`) | Código, CI (Actions), deploy automático de `main` | Yany | — | Gratis | [github.com/Yany954/nayra-handoff](https://github.com/Yany954/nayra-handoff) |
| **OpenAI API** | Extraer eventos de los resultados de búsqueda y «Adaptar párrafo con IA» (`gpt-5-mini`) | Yany (llave nueva solo para este proyecto) | Secret Manager (`OPENAI_API_KEY`) | ≈ USD 0,20/mes; **tope duro USD 5** en la cuenta | [platform.openai.com](https://platform.openai.com) |
| **Tavily** | Buscador web de eventos | Yany | Secret Manager (`TAVILY_API_KEY`) | Gratis (1.000 créditos/mes; se usan ~150) | [tavily.com](https://tavily.com) |
| **Gmail** (Booking) | Desde donde la manager envía los pitches (el panel abre Gmail con `authuser`) | Booking | — | Gratis | gmail.com |
| **YouTube** `@NAYRA-Lan` | Video principal (embed `youtube-nocookie`, carga solo al tocar play) | Nayra / Manager | — | Gratis | youtube.com |
| **Instagram / TikTok / Facebook** | Enlaces en el sitio y en el EPK | Nayra / Manager | — | Gratis | — |
| **WhatsApp** | Contacto (`wa.me/57…`) | Manager | — | Gratis | — |
| **Google Fonts** (Bricolage Grotesque, Inter) | Tipografías. En la web se autoalojan con `next/font` (no llama a Google); en el PDF van en `src/assets/fonts` (licencia OFL) | — | — | Gratis | — |

**Pendientes de cuentas:**
- Llaves de OpenAI y Tavily: hasta tenerlas, la búsqueda automática y la IA no corren en producción. Ver [`docs/scan-setup.md`](docs/scan-setup.md).
- Dominio propio: por ahora no.
- Cuenta de facturación de la empresa anterior: desvincularte de esos proyectos.

---

## Variables de entorno y secretos

**Regla:** nada secreto en el repo (es público). `.env*`, `functions/.env.local`, `functions/.secret.local` y las cuentas de servicio están en `.gitignore`.

| Variable | Dónde se usa | Local (emuladores) | Producción | Quién la pone |
|---|---|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY`, `_AUTH_DOMAIN`, `_PROJECT_ID` | Login del panel en el navegador | `.env.local` (valores `demo-…`) | `apphosting.yaml` (pública por diseño) | Yany (copiada de la app web en Firebase) |
| `NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST` | Apunta el login al emulador | `.env.local` | **No existe** | — |
| `GCLOUD_PROJECT`, `*_EMULATOR_HOST`, `FIREBASE_STORAGE_BUCKET` | Admin SDK hacia los emuladores | `.env.local` | App Hosting define `FIREBASE_CONFIG` solo | — |
| `ADMIN_EMAILS` (Next) | `requireAdmin()`: quién entra al panel | `.env.local` | Secreto de App Hosting | Yany: `firebase apphosting:secrets:set ADMIN_EMAILS` |
| `ADMIN_EMAILS` (Functions) | Blocking functions: rechazan cualquier otra cuenta | `functions/.env.local` | Parámetro que pide `firebase deploy` | Yany, al desplegar |
| `OPENAI_API_KEY` | `scanEvents` + «Adaptar con IA» | `functions/.secret.local` y `.env.local` (opcional) | Secret Manager (Functions) + secreto de App Hosting | Yany: `firebase functions:secrets:set` / `apphosting:secrets:set` |
| `TAVILY_API_KEY` | `scanEvents` | `functions/.secret.local` (opcional) | Secret Manager | Yany: `firebase functions:secrets:set TAVILY_API_KEY` |
| `OPENAI_MODEL` | Modelo de extracción (por defecto `gpt-5-mini`) | — | Parámetro de Functions / variable opcional | — |

Sin llaves de IA, en local todo funciona con **datos de prueba** que solo existen en el emulador. En producción, sin llaves, el panel avisa que falta configurarlas; nunca inventa resultados.

---

## Arquitectura

```
Promotores ──► Sitio público (Next.js SSR, "use cache" + cacheTag("content"))
                     │  lee con Admin SDK
Manager ──► /panel ──► Server Actions (requireAdmin → Zod → caso de uso → repo → updateTag)
   │            │
   │ Google     ▼
   └─► Firebase Auth ◄── blocking functions (solo ADMIN_EMAILS) ──► session cookie httpOnly
                     ▼
               Firestore + Storage  ◄── scanEvents / onScanRequested (Tavily → OpenAI → Zod → dedupe)
```

**Capas (clean architecture).** Una regla de ESLint impide importar entre capas en sentido equivocado.

| Capa | Carpeta | Regla |
|---|---|---|
| Dominio | `src/domain` | Tipos y reglas puras (etapas, seguimientos, relevancia, pitch). Sin Firebase, React ni Zod |
| Aplicación | `src/application` | Casos de uso; reciben los repositorios como argumento |
| Infraestructura | `src/infrastructure` | Firestore/Storage (Admin SDK), sesión, PDF, OpenAI, schemas Zod, seed |
| Presentación | `src/presentation` | Componentes (reciben datos y Server Actions como props) |
| Rutas | `src/app` | Solo conectan: piden datos, verifican admin y pasan acciones |

**Decisiones clave** (el detalle está en [`docs/SPEC.md`](docs/SPEC.md)):
- **Sitio servido desde el servidor y cacheado.** Cada guardado del panel llama `updateTag("content")` y el cambio se ve en la siguiente carga.
- **Datos privados** (promotores, pitch, eventos) nunca van en caché compartida.
- **Cuatro capas de acceso al panel:**
  1. blocking functions;
  2. `proxy.ts`;
  3. `requireAdmin()` en cada página y Server Action (lo verifica `panel-guard.test.ts`);
  4. reglas de Firestore y Storage.
- **Tonalidades** en `songs/{id}/private/meta`, que solo lee el admin.
- **Búsqueda de eventos.** Proveedores detrás de interfaces; la IA solo extrae y el código calcula la relevancia. Tiene topes de gasto por ejecución.

---

## Correrlo en local

Requisitos: Node 22, Java 21 (para los emuladores) y Firebase CLI.

```bash
npm install && npm --prefix functions install
cp .env.example .env.local                      # Next y scripts → emuladores; agrega ADMIN_EMAILS
cp functions/.env.example functions/.env.local  # ADMIN_EMAILS para las blocking functions

npm run emulators   # terminal 1: Auth, Firestore, Storage y Functions (UI en http://localhost:4000)
npm run seed        # carga el contenido inicial y datos [ejemplo] (solo emuladores)
npm run dev         # terminal 2: http://localhost:3000
```

**Entrar al panel en local:** abre `/panel/login`, toca «Entrar con Google», luego «Add new account» y escribe uno de los correos de `ADMIN_EMAILS`. El emulador simula Google.

---

## Tests y calidad

```bash
npm run lint && npm run typecheck && npm test   # unitarios (dominio, casos de uso, schemas, scan)
npm run test:rules                               # reglas de Firestore/Storage (emuladores corriendo)
npx playwright install chromium                  # una vez
npm run seed && npm run test:e2e                 # navegador: accesibilidad (axe), teclado, pitch, encontrados
```

- **Accesibilidad:** WCAG 2.2 AA (incluye ISO/IEC 40500 y NTC 5854). 48 escaneos de axe a 320, 390 y 1440 px, más pruebas de teclado y foco. Ver [`docs/accessibility/AUDIT.md`](docs/accessibility/AUDIT.md).
- **CI** (`.github/workflows/ci.yml`, en `main` y pull requests): lint, typecheck, unitarios, build de functions, reglas, seed, build de Next y e2e contra `next start`.

---

## Deploy

**Producción = rama `main`.** Cada push a `main` crea un *rollout* en App Hosting.

**Primera vez:**
1. En la consola de Firebase:
   - crear **Firestore** (`us-east4`) y **Storage** (`us-east1`);
   - registrar la **app web**;
   - poner la `apiKey` en `apphosting.yaml`.
2. Crear el backend de **App Hosting**: GitHub `Yany954/nayra-handoff`, rama `main`, región `us-east4`.
3. Secretos y reglas:
   ```bash
   firebase apphosting:secrets:set ADMIN_EMAILS
   firebase deploy --only firestore:rules,storage,functions:onlyAdminsCanSignUp,functions:onlyAdminsCanSignIn --project nayra-lancheros
   ```
4. Contenido inicial. Solo agrega donde está vacío; nunca borra:
   ```bash
   gcloud auth application-default login
   npm run seed:prod -- --project nayra-lancheros
   ```
5. En Authentication, agregar el dominio `*.hosted.app` a **Dominios autorizados**.
6. **Búsqueda automática**, cuando tengas las llaves (ver [`docs/scan-setup.md`](docs/scan-setup.md)):
   ```bash
   firebase functions:secrets:set OPENAI_API_KEY
   firebase functions:secrets:set TAVILY_API_KEY
   firebase deploy --only functions --project nayra-lancheros
   ```

---

## Estructura de carpetas

```
src/
  app/                  rutas: (public)/, panel/login, panel/(admin)/… (+ actions.ts, loading.tsx)
  domain/               entidades y reglas puras
  application/          casos de uso (sitio público y panel)
  infrastructure/       firebase/, repositories/, auth/, pdf/, ai/, schemas/, seed/
  presentation/         components/ (home, gallery, repertoire, panel), ui/
  assets/fonts/         fuentes del PDF (OFL)
  proxy.ts              redirección optimista de /panel sin cookie
functions/src/          blocking auth + scan/ (búsqueda de eventos)
scripts/                seed-emulator.ts (dev) · seed-prod.ts (producción, solo agrega)
tests/                  rules/ (reglas de seguridad) · e2e/ (Playwright + axe)
design/                 mockups (*.dc.html) y fotos originales: fuente de verdad del diseño
docs/                   SPEC, auditoría de accesibilidad, guía de la búsqueda, textos de la manager
firestore.rules · storage.rules · firebase.json · apphosting.yaml
```

---

## Documentos relacionados
- [`CLAUDE.md`](CLAUDE.md): reglas del proyecto (cómo trabajamos, tokens de diseño, rutas, lo que no se rompe).
- [`docs/SPEC.md`](docs/SPEC.md): modelo de datos, reglas, decisiones y fases.
- [`docs/accessibility/AUDIT.md`](docs/accessibility/AUDIT.md): auditoría WCAG 2.2 AA e ISO 9241-110.
- [`docs/scan-setup.md`](docs/scan-setup.md): cómo activar la búsqueda real de eventos.
- [`docs/content/pitch-base.md`](docs/content/pitch-base.md): texto base del pitch, escrito por la manager.
