# Auditoría de accesibilidad y usabilidad

**Alcance:** sitio público (`/`, `/repertorio`, `/galeria`) y panel de la manager (`/panel/**`, incluido el login).
**Fecha:** 2026-11-25 · **Estado del código:** rama `feat/phase-1-2-public-site` (Fase 5, Parte A).
**Se actualiza en cada fase.** Los tests de `tests/e2e/` impiden que lo corregido vuelva a romperse.

## 1. Normas de referencia

| Norma | Qué es | Cómo se aplica aquí |
|---|---|---|
| **WCAG 2.2 nivel AA** (W3C) | Criterios de accesibilidad web | Objetivo de conformidad. Contiene todo WCAG 2.0 |
| **ISO/IEC 40500:2012** | La norma ISO de accesibilidad web: es WCAG 2.0 publicado por ISO | Se cumple al cumplir WCAG 2.2 AA (que es un superconjunto) |
| **NTC 5854** (ICONTEC) | Norma técnica colombiana de accesibilidad web, basada en WCAG | Misma conformidad AA |
| **Resolución MinTIC 1519 de 2020** (Anexo 1) | Obligatoria para entidades públicas en Colombia; exige WCAG 2.1 AA | El sitio es privado: se usa como referencia, y se cumple |
| **ISO 9241-110:2020** | Principios de interacción (diálogo) | §5: mapa de los 7 principios |
| **ISO 9241-11:2018** | Usabilidad = eficacia, eficiencia y satisfacción en un contexto de uso | Usuarios y tareas del §2; verificado con recorridos de tarea |

> Ningún sitio queda "certificado ISO" por su código. Lo que este documento demuestra es **conformidad verificada criterio por criterio**, con evidencia automatizada.

## 2. Usuarios y contexto de uso (ISO 9241-11)

- **Promotores** (sitio público): miran en celular, a menudo con datos móviles. Tareas: entender quién es Nayra, ver formatos y fechas, contactar.
- **La manager** (panel): usa sobre todo el **celular**. Tareas: revisar pendientes, actualizar promotores, shows, fotos y EPK, y enviar pitches.

## 3. Método

1. **Automático (axe-core 4, reglas `wcag2a/aa`, `wcag21a/aa`, `wcag22aa`)**: `tests/e2e/a11y.spec.ts` recorre **14 páginas × 3 anchos** (320, 390 y 1440 px) = 42 escaneos. También verifica que no haya scroll horizontal (1.4.10). Corre en CI.
2. **Manual automatizado**: `tests/e2e/keyboard.spec.ts` cubre lo que axe no ve: teclado, foco, movimiento, espaciado de texto y errores.
3. **Contraste**: cálculo del ratio WCAG de cada par texto/fondo de los tokens (§6).
4. **Revisión de código** contra *Vercel Web Interface Guidelines* (skill `web-design-guidelines`) en cada pantalla nueva.
5. **Reglas *best-practice* de axe** (no WCAG): 0 hallazgos en 11 páginas.

**Resultado actual:** 42/42 escaneos sin violaciones A/AA · 7/7 pruebas de teclado y foco · 0 hallazgos *best-practice*.

## 4. Criterios WCAG 2.2 A/AA

Estado: ✅ cumple · 🔧 corregido en esta auditoría · ⚠️ cumple con limitación · N/A no aplica.

| Criterio | Estado | Evidencia o arreglo |
|---|---|---|
| 1.1.1 Contenido no textual | ✅ | Todas las fotos tienen `alt`. En el panel, la descripción es obligatoria (≥10 caracteres) al subir. Íconos decorativos con `aria-hidden` |
| 1.2.1–1.2.5 Multimedia | ⚠️ | El video es de YouTube: la fachada tiene botón con nombre accesible, pero los subtítulos dependen del canal. **Recomendado:** activar subtítulos o letra en YouTube |
| 1.3.1 Información y relaciones | ✅ | Landmarks (`header`, `nav`, `main`, `footer`), encabezados en orden, `<table>` con `<th scope>`, `label` en cada campo |
| 1.3.2 Secuencia significativa | ✅ | El orden del DOM coincide con el visual (hero móvil y desktop con un solo DOM) |
| 1.3.4 Orientación | ✅ | Sin bloqueo de orientación |
| 1.3.5 Propósito de los campos | ✅ | `autocomplete="name"` en el formulario público. Teléfono y correo llegan con `tel`/`email` en la Fase 7 |
| 1.4.1 Uso del color | 🔧 | El seguimiento vencido en la tabla de promotores solo se veía en rojo. Ahora dice «vencido» u «hoy». Las etapas siempre llevan texto |
| 1.4.3 Contraste (mínimo) | 🔧 | Los *placeholders* del panel tenían 3,66:1 y pasaron a 6,18:1. El resto de pares cumple (§6) |
| 1.4.4 Cambio de tamaño del texto | ✅ | Tipografía en `rem`/`clamp`, sin alturas fijas en texto; probado a 200 % (equivale a 720 px) |
| 1.4.5 Imágenes de texto | ✅ | No hay texto en imágenes |
| 1.4.10 Reajuste (reflow) | 🔧 | A 320 px se desbordaban el correo de booking y la pestaña "Encontrados automáticamente". Corregido y probado en CI |
| 1.4.11 Contraste sin texto | 🔧 | Borde de campos del panel: 1,8:1 → 3,66:1. Borde de campos públicos: 1,66:1 → 4,53:1. Anillo de foco: dorado en fondos oscuros (10,35:1) y tinta en fondos claros (15,75:1; el dorado allí era 1,63:1) |
| 1.4.12 Espaciado del texto | ✅ | Test que aplica los valores del criterio y verifica que no se rompe nada |
| 1.4.13 Contenido al pasar el puntero | ✅ | Sin tooltips propios |
| 2.1.1 Teclado | ✅ | Todo con `<button>`/`<a>` reales; menús y diálogos con `<dialog>` nativo |
| 2.1.2 Sin trampas de teclado | ✅ | Test: el foco circula dentro del diálogo y `Esc` lo cierra |
| 2.1.4 Atajos de una tecla | N/A | No hay atajos |
| 2.2.1 / 2.2.2 Tiempo y movimiento | ✅ | Sin límites de tiempo en formularios. El video no se reproduce solo |
| 2.3.1 Destellos | ✅ | Ninguno |
| 2.3.3 Animación por interacción (AAA, buena práctica) | ✅ | `prefers-reduced-motion` desactiva el scroll suave y los *skeletons* animados |
| 2.4.1 Evitar bloques | 🔧 | Agregado «Saltar al contenido», primer elemento con foco en todas las páginas (test) |
| 2.4.2 Título de página | ✅ | Plantilla `%s · Nayra Lancheros` / `%s · Panel` |
| 2.4.3 Orden del foco | ✅ | Test: al cerrar un diálogo, el foco vuelve al botón que lo abrió |
| 2.4.4 Propósito de los enlaces | ✅ | Botones repetidos con nombre único (`aria-label="Editar Hotel X"`) |
| 2.4.5 Múltiples vías | ✅ | Navegación principal más enlaces internos (inicio → galería, panel → secciones) |
| 2.4.6 Encabezados y etiquetas | ✅ | Etiquetas visibles y descriptivas, con pistas (`hint`) en el panel |
| 2.4.7 Foco visible | ✅ | Anillo de 2 px en todo elemento interactivo |
| 2.4.11 Foco no oculto | 🔧 | `scroll-padding-top` en el panel móvil para que la barra fija no tape el campo enfocado (test) |
| 2.5.1–2.5.4 Puntero y movimiento | ✅ | Sin gestos. Reordenar fotos usa botones ←/→, no arrastrar |
| 2.5.3 Etiqueta en el nombre | ✅ | Los `aria-label` empiezan por el texto visible ("Editar …", "Borrar …") |
| 2.5.7 Movimientos de arrastre | ✅ | No hay arrastre |
| 2.5.8 Tamaño del objetivo | ✅ | Todo objetivo ≥44 px (más que los 24 px exigidos); utilidad `hit-44` |
| 3.1.1 Idioma de la página | ✅ | `lang="es"` |
| 3.2.1 / 3.2.2 Al foco / al cambiar | ✅ | Los filtros son enlaces; nada se envía al cambiar un campo |
| 3.2.3 / 3.2.4 Navegación e identificación consistentes | ✅ | Mismo menú y mismos patrones de formulario en todo el panel |
| 3.2.6 Ayuda consistente | ✅ | WhatsApp y correo de booking siempre en «Contacto» y en el pie |
| 3.3.1 Identificación de errores | ✅ | Error junto al campo, `aria-invalid`, `aria-describedby`, alerta, y foco en el primer campo con error (test) |
| 3.3.2 Etiquetas o instrucciones | ✅ | Cada campo con etiqueta, y pista donde hace falta (formato de fecha, tonalidad opcional, etc.) |
| 3.3.3 Sugerencias ante errores | ✅ | Los mensajes dicen cómo corregir ("Debe ser mayor o igual a la duración mínima") |
| 3.3.4 Prevención de errores | ✅ | No hay transacciones legales ni financieras. Borrar siempre pide confirmación |
| 3.3.7 Entrada redundante | ✅ | Editar precarga los datos. El pitch usa los datos del promotor |
| 3.3.8 Autenticación accesible | ✅ | Login con Google: sin contraseñas ni acertijos propios |
| 4.1.2 Nombre, función, valor | ✅ | Controles nativos; `aria-current`, `aria-pressed` y `aria-invalid` donde corresponde |
| 4.1.3 Mensajes de estado | ✅ | Confirmaciones con `role="status"` y errores con `role="alert"` |

## 5. ISO 9241-110: principios de interacción

| Principio | Cómo se cumple | Mejora pendiente |
|---|---|---|
| **Adecuación a la tarea** | El inicio del panel muestra primero lo que hay que hacer hoy (seguimientos vencidos, solicitudes, eventos). Publicar un cierre como show toma un clic | Atajos desde el inicio a cada pendiente (Fase 6) |
| **Autodescriptividad** | Cada show dice cómo lo usa el sitio («Último show en el sitio», «Por confirmar · no se muestra»). Pistas en los campos | — |
| **Conformidad con las expectativas** | Mismos patrones en todas las secciones (lista → Editar/Borrar → diálogo), etapas con los colores del mockup, español de Colombia (fechas «25 nov») | — |
| **Facilidad de aprendizaje** | Estados vacíos que explican qué aparecerá y cuándo ("Cuando marques un promotor como «Contactado»…") | Guía breve para la manager en la Fase 7 |
| **Controlabilidad** | Cancelar en todo diálogo, `Esc` para cerrar, filtros en la URL (se pueden guardar y compartir), orden manual de fotos | — |
| **Robustez ante errores de uso** | Validación en servidor con mensajes concretos, confirmación al borrar, archivo falso rechazado por su contenido real, aviso al salir del editor del EPK con cambios sin guardar 🔧, «Publicar como show» no duplica | No hay deshacer después de borrar (la confirmación lo mitiga) |
| **Compromiso del usuario** | Diseño fiel a la marca, saludo por nombre y confirmaciones claras | — |

## 6. Contraste de los tokens (ratio WCAG)

| Par | Ratio | Uso |
|---|---|---|
| `text-light` / `ink` | 17,06 | Texto principal oscuro |
| `muted-on-dark` / `ink` | 10,74 | Texto secundario oscuro |
| `muted-on-dark` / `card-dark` | 9,73 | Texto en tarjetas glass |
| `accent` / `ink` | 10,35 | Dorado, anillo de foco oscuro |
| `text-dark` / `cream` | 15,75 | Texto principal claro, anillo de foco claro |
| `text-body` / `cream` | 11,10 | Cuerpo en el panel |
| `muted-on-light` / `cream` | 5,35 | Texto secundario claro |
| `muted-on-light` / `white` | 6,18 | Secundario en tarjetas y *placeholders* 🔧 |
| Error `#8F2D1F` / `white` | 8,19 | Mensajes de error |
| Éxito `#1F5130` / `cream` | 7,99 | Confirmaciones |
| Pastillas de etapa (texto/fondo) | 6,13–8,46 | Las 5 etapas |
| Borde de campo panel `#8E847B` / `white` | 3,66 | Contorno de campos (≥3:1) 🔧 |
| Borde de campo público `white/45` / `field` | 4,53 | Contorno de campos (≥3:1) 🔧 |

## 7. Limitaciones conocidas

- **Subtítulos de video (1.2.x):** dependen de YouTube. Recomendación: subir la letra o activar los subtítulos.
- **PDF del EPK (Fase 5):** `@react-pdf/renderer` produce texto real, seleccionable y con metadatos de idioma y título, pero **no PDF etiquetado (PDF/UA)**. La versión web del EPK es la alternativa accesible.
- **Lectores de pantalla:** la estructura está verificada por código y axe, pero no se ha probado aún con VoiceOver/TalkBack en un dispositivo real. Pendiente antes del deploy (Fase 7).
- **Formulario de contacto público:** su envío se activa en la Fase 7; entonces se auditan sus errores y confirmaciones.

## 8. Cómo correrlo

```
npm run emulators          # terminal 1
npm run seed && npm run dev  # terminal 2
npx playwright install chromium   # una vez
npm run test:e2e           # axe (42 escaneos) + teclado y foco (7 pruebas)
```
