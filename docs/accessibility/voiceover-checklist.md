# Prueba con VoiceOver (iPhone), 10 minutos

Lo que los tests automáticos no pueden juzgar: si el sitio **se entiende** escuchándolo. Hazla una vez antes de mandar el enlace a promotores y cada vez que cambie mucho una pantalla.

**Activar:** Ajustes → Accesibilidad → VoiceOver (o pídele a Siri «activa VoiceOver»). Toca una vez para escuchar, doble toque para activar, desliza a la derecha/izquierda para avanzar/retroceder, el **rotor** (girar dos dedos) para saltar por encabezados.

## Sitio público (`/`)
- [ ] Al cargar, se anuncia el título «Nayra Lancheros» y lo primero es «Saltar al contenido».
- [ ] Con el rotor en **Encabezados**, la página tiene un orden lógico (nombre, logros, formatos, en vivo, galería, historia, ¿tienes un evento?).
- [ ] Las fotos se describen con sentido (no «imagen» ni nombres de archivo).
- [ ] El video dice que es un botón para reproducir y su título.
- [ ] «Próximas fechas» se entiende: fecha, lugar y «Confirmado».
- [ ] **Formulario:** cada campo anuncia su nombre; si lo envías vacío, se anuncian los errores y el foco cae en el primero; al enviarlo bien se anuncia «Solicitud enviada».
- [ ] El aviso de cookies se encuentra y sus botones dicen «Aceptar» y «Rechazar».

## Panel (`/panel`)
- [ ] El menú se abre y se cierra; los enlaces dicen a dónde van y cuál es la página actual.
- [ ] En Promotores, los botones dicen a quién afectan («Editar Hotel X», «Pitch para …»).
- [ ] Al guardar o borrar se anuncia el resultado.
- [ ] En un formulario con error se anuncia el error y el foco va al campo.

Anota cualquier cosa rara (algo que no se anuncia, se anuncia dos veces o no se entiende) y me la pasas: se corrige y se agrega a `AUDIT.md`.
