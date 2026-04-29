# Paseos Seguros — Perros de la Isla

PWA comunitaria para reportar peligros (procesionaria, garrapatas, cristales, veneno) y compartir rutas seguras de paseo de perros en Mallorca. Iniciativa de **Perros de la Isla** (adiestramiento canino profesional, Palma, desde 2019).

## Idioma

Responde **siempre en español**, sin excepción. Esto incluye:
- Respuestas normales y resúmenes.
- Explicaciones de comandos o acciones técnicas que ejecutes ("voy a hacer X porque…").
- Peticiones de permiso o confirmación antes de actuar.

Los nombres de comandos, funciones, variables y rutas se mantienen en su idioma original — no traducir código —, pero toda la narración que los acompaña va en español.

## Stack

Vanilla JS, **sin framework, sin build, sin npm**. Solo se sirve estático.

| Archivo | Rol |
|---|---|
| `index.html` | Estructura completa: onboarding, 4 pestañas, todos los modales |
| `app.js` (~1550 líneas) | Toda la lógica: perfil, mapa, alertas, rutas, GPS, ranking, insignias |
| `styles.css` | Estilos |
| `service-worker.js` | Cache offline (network-first para assets propios, cache-first para CDN) |
| `manifest.json` | PWA instalable |

**Backend:** Supabase (proyecto `vqpdrncugaipfpcmpout`).
- Tablas: `usuarios`, `avistamientos`, `rutas`.
- Storage bucket: `avistamientos` (también guarda fotos de perfil).
- **Sin auth** — la identidad es un id en `localStorage` (`pdi_user_id`). La key anon de Supabase está en cliente (`SUPA_KEY` en `app.js:2`); es esperado con RLS, no es bug.

**Mapa:** Leaflet 1.9.4 vía CDN, 4 capas (OpenTopoMap, OSM Callejero, Esri Satélite, CartoDB Dark) + reverse-geocoding con Nominatim.

## Estructura de la app

4 pestañas:
1. **Alerta** — info educativa sobre procesionaria, calendario de riesgo, síntomas, protocolo.
2. **Mapa** — dos modos: Avistamientos (reportar peligro tocando el mapa) y Rutas seguras (trazar ruta o grabar paseo por GPS).
3. **Urgencias** — lista hardcodeada de veterinarios 24h en `app.js:469` (`vets[]`).
4. **Servicios** — catálogo de adiestramiento + WhatsApp.

**Onboarding sin login** con detección de duplicados: si el nombre + perro + zona ya existe, se ofrece "recuperar perfil" con todo el historial, o crear nuevo con sufijo `(2)`.

**Gamificación:** 4 categorías de insignias (Alertas, Rutas, Difusión, Sociales/huellitas) + ranking de comunidad. Puntuación: alertas ×10, rutas ×15 (+25 si verificada), shares ×5, huellitas dadas ×1, recibidas ×3.

## Identidad de marca — RESPETAR

- **Colores:** fondo negro `#111`, acento rojo `#c0392b`, verde secundario `#9cb64b` (perfil con foto, pestaña Servicios, insignias sociales).
- **Tipografías:** `Bebas Neue` para títulos, `Inter` para el cuerpo (cargadas desde Google Fonts en `styles.css:1`).
- **Logo:** **NO tocar** el logo (`logo.png`, `icon.png`, ni la URL `https://i.ibb.co/FbBcFvBQ/logo-png.png`) salvo que Charly lo pida explícitamente.
- El nombre de la marca es **Perros de la Isla**; el subtítulo recurrente es *"Por paseos felices y seguros"*.

## Cómo trabajar en este proyecto

- **Consulta antes de hacer cambios importantes.** Para refactors, cambios de arquitectura, edits a varios archivos a la vez, eliminación de funcionalidad o cambios visuales notables: explica el plan primero y espera el OK. Para fixes pequeños y aislados puedes proceder.
- Mantén el estilo de código existente: funciones cortas, muchas en una línea, sin comentarios innecesarios. No introducir TypeScript, frameworks, ni bundlers.
- Cuando edites HTML/CSS/JS, **sube el `?v=N`** correspondiente en `index.html` (manifest, styles.css, app.js) y la `CACHE_VERSION` en `service-worker.js` para forzar refresco de cache en clientes.
- WhatsApp del negocio: `+34 622 922 173` (constante `WA` en `app.js:4`). Email: `perrosdelaislapalma@gmail.com`. IG: `@perrosdelaisla`.

## Reglas críticas aprendidas — leer SIEMPRE

### Antes de tocar `app.js`
Es un archivo grande (~1550 líneas). **Antes de editar, lee la zona afectada y verifica que estas funciones siguen presentes íntegras** (si propones un cambio que las elimina o modifica sin pedírtelo, es bug):

- `darHuellita`, `cargarMisHuellitas`, `contarHuellitasReportes`
- `abrirMiniPerfil`, `cerrarMiniPerfil`
- Bloque "POSICIÓN EN EL RANKING" en `openProfile` y `openRanking` (ambos suman huellitas: +1 dadas, +3 recibidas)
- `BADGES_SOCIALES` con los 5 emojis: 🌱🌟☀️🏝️🌊
- `showRecoverModal` y modal `#recoverModal` (z-index 5500 en CSS)
- `popstate` con orden: miniPerfil → imgModal → .modal → ranking → profile → onboarding → doble salida
- Bloque "===== SWIPE ENTRE PESTAÑAS =====" con variable `swipeBlocked`
- `shareApp` con sus 4 capas anti-abuso (cooldown 30s, máximo 10/día)
- `loadRetoWinner`, `submitClaimPrize`, `RETO_END`, `RETO_ID`
- 4 capas de mapa: `MAP_LAYERS_ORDER`, `MAP_LAYER_NEXT_LABELS`, `toggleMapLayer`

### Reglas brand voice (Charly se enfada si no las respetas)
- **NUNCA** "peludito", "peludo", "colita feliz", "amigo peludo", "bolita de pelo" → siempre **"perro"** (o "perrito" ocasional).
- **NUNCA** "precio", "coste", "cuánto cuesta", "tarifa" → siempre **"valor"** o **"inversión"**.
- Preferir **"clase"** sobre "sesión" cuando el tono lo permite. "Sesión" no es error grave, no sobrecorregir.
- Excepción para textos legales/facturación.
- Slogan oficial: **"Tu perro merece ser feliz hoy"** — frase eje de la marca, usar cuando encaje (cierres, claims, headers). El "hoy" es clave: felicidad como práctica diaria, no meta abstracta. **NO inventar slogans alternativos.**

### Reglas Supabase
- **Antes de cualquier `DELETE`**: ejecuta primero un `SELECT` con el mismo filtro y enseña a Charly los datos reales (nombre/teléfono/fecha) de las filas afectadas. Nunca borres por UUID copiado sin verificar. Cuando se pueda, envuelve operaciones destructivas en `BEGIN...COMMIT`.
- **Si una operación de escritura no tiene efecto visible**, sospecha primero RLS. Diagnóstico: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename='X'`. Si está activo y bloquea, valorar `ALTER TABLE X DISABLE ROW LEVEL SECURITY` siguiendo el patrón ya aplicado a otras tablas del proyecto.

### Reglas de flujo de trabajo
- **Nunca push automático sin permiso explícito.** Commit local primero, mostrar diff, esperar OK.
- **Cuando edites un archivo grande**, devuelve solo el bloque modificado con 5-8 líneas de contexto antes y después, no el archivo entero — salvo que Charly diga lo contrario.
- **Bumpear cache es obligatorio** tras cualquier cambio en `app.js`, `styles.css`, `index.html` o `manifest.json`. Sin bump, los usuarios ven la versión vieja y parece que el cambio no funcionó.
- **Verifica antes de eliminar**: si el código define una función que parece no usarse (ej. `getPeligroColor`, `colorForRisk`), busca en todo el archivo antes de eliminarla — pueden usarse en HTML inline o en otros bloques.
