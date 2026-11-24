# Mockups — cómo leerlos

Los archivos `mockups/*.dc.html` vienen de un canvas de diseño. **No son código de producción**: son la referencia visual exacta (estilos inline con colores, tamaños, espaciados y radios reales). No se abren tal cual en el navegador porque dependen del runtime del canvas.

Sintaxis que vas a ver:
- `<x-dc>…</x-dc>` envuelve el markup; `<helmet>` contiene fuentes y estilos base.
- `{{ algo }}` = valor que viene de `renderVals()` en el `<script type="text/x-dc">` del final. `{{accent}}` = `#F0B24A`.
- `<sc-for list="{{ items }}" as="item">` = un `.map()` en React.
- `<sc-if value="{{ cond }}">` = render condicional.
- `onClick="{{ fn }}"` = handler definido en `renderVals()`.
- Los datos de ejemplo (canciones, promotores, eventos) están en los arrays de `renderVals()`: úsalos como **seed**, no los hardcodees en componentes.
- `<a href="Otro.dc.html">` = link entre pantallas → mapea a las rutas de `CLAUDE.md`.

| Archivo | Pantalla |
|---|---|
| `Main.dc.html` | Inicio desktop (hero, logros, formatos, videos, historia, contacto) |
| `Mobile.dc.html` | Hero del inicio en móvil (390×844) |
| `Repertorio.dc.html` | Repertorio con filtros por categoría |
| `EPK.dc.html` | EPK público + generador de pitch (este último va en el panel) |
| `Panel.dc.html` | Panel de la manager: promotores por etapa + eventos encontrados |

`assets/` tiene las fotos reales. `screenshots/` es para las capturas PNG exportadas del canvas.
