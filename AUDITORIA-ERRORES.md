# Auditoría de manejo de errores en `fetch` — `app.js`

Inventario de llamadas `fetch` que NO tienen manejo robusto de errores (catch ausente, catch vacío, o feedback insuficiente al usuario).

**No arreglar todo de golpe.** Esto es un mapa para que Charly priorice. Cada arreglo idealmente: avisar al usuario con `showToast`, ofrecer reintento cuando tenga sentido, registrar en consola para debug.

---

## 🔴 CRÍTICO — perfil sin persistir en BD

### ✅ RESUELTO (04/05/2026) — `finalizeSaveProfile` — INSERT del usuario al onboarding

**Línea 247 (estado original):**
```js
fetch(SUPA_URL+"/rest/v1/usuarios", {...}).catch(()=>{});
```

**Por qué era crítico:** este es el upsert del perfil al unirse a la comunidad. Si la red falla, el usuario:
- Queda guardado en `localStorage` (ve la app funcional desde su dispositivo).
- **NO existe en BD** → invisible para el resto: nadie ve sus reportes, no aparece en ranking, su `reporter_id` apunta a un fantasma.

El fallo era **silencioso**. El usuario creía que se unió correctamente.

**Resuelto el 04/05/2026.** Ahora el `fetch` usa `await` con `try/catch` y comprueba `res.ok`. Si falla:
- Se hace rollback del `localStorage` (restaurando el perfil previo si existía, o limpiándolo si era nuevo) → no quedan perfiles fantasma en el dispositivo.
- Se loguea el error en `console.error` para diagnóstico.
- Se muestra toast de error: *"No hemos podido guardar tu perfil. Revisa tu conexión e inténtalo de nuevo."*
- El onboarding **no se oculta** → el usuario puede reintentar inmediatamente sin perder los datos del formulario.

---

## 🟡 MEDIO — features secundarias degradadas

### `loadNamesCache` — caché de nombres de usuarios

**Línea 578** (dentro de función, single-line):
```js
try{...const res=await fetch(SUPA_URL+`/rest/v1/usuarios?id=in.(${qs})...`);...}catch(e){}
```

**Impacto:** si falla, todos los reportes muestran "Un vecino de Mallorca" en lugar del nombre real del autor. Funcional pero degradado. No notifica.

---

### `loadRutas` — sub-fetch de avistamientos para "alertas cercanas"

**Línea 747** (dentro de loadRutas, sub-fetch):
```js
try{const ar=await fetch(SUPA_URL+"/rest/v1/avistamientos?...");cachedAvistamientos=await ar.json();}catch(e){}
```

**Impacto:** si falla, la pestaña Rutas no muestra el aviso "⚠️ N alertas de peligro cerca" en cada card de ruta. El feed principal (`loadAvistamientos`) sí cachea por su lado, así que solo afecta cuando el usuario entra directo a Rutas sin haber abierto Avistamientos antes.

---

### `submitClaimPrize` — notificación a Charly por ntfy

**Línea 1362:**
```js
try{...await fetch('https://ntfy.sh/perrosdelaisla-citas-2026',{...});}catch(e){console.warn('Error notificando ntfy:',e);}
```

**Impacto:** si ntfy falla, el ganador del reto envía sus datos de envío correctamente a Supabase, pero **Charly nunca se entera** vía notificación push. Tiene que mirar la tabla `premios_ganadores` manualmente.

**Sugerencia:** registrar en BD un flag `notif_enviada=false` cuando falla, para detectarlo después. O hacer un fallback a email.

---

### `openProfile` — stat boxes (varios bloques)

| Línea | Stat afectada | Si falla, queda en |
|---|---|---|
| 369 | `prof-reports` (alertas) | 0 |
| 376 | `prof-rutas` (rutas + verificadas + hasDetailed) | 0 / sin badges |
| 405-407 | rank-banner posición ranking | "Aún sin puntos · Toca para ver" o banner oculto |

**Impacto:** UX degradada al abrir el perfil propio. El usuario ve stats incorrectas pero la app no rompe. No notifica.

---

## 🟢 BAJO — telemetría / contadores secundarios

### Contadores ignorables en `openProfile`

| Línea | Stat | Si falla |
|---|---|---|
| 372 | contador "Mis reportes (N)" en botón | `(0)` |
| 386 | `prof-shares` | 0 |
| 394 | `prof-huellitas` (dadas/recibidas, pasa a renderAllBadges) | sin huellitas |

### Otros

| Línea | Función | Impacto |
|---|---|---|
| 326 | `recoverDeclineProfile` (cálculo sufijo) | sufijo arranca en `(2)` aunque haya más duplicados |
| 1483 | `loadShareCount` | botones "Compartir" muestran sin contador |

Todos tienen `try{...}catch(e){}` vacío. Sin notificar al usuario. Aceptable porque son contadores cosméticos.

---

## ⚪ EXTERNOS (low impact, por diseño)

Reverse geocoding contra Nominatim (OpenStreetMap) — servicio público externo, fuera de nuestro control. Todos siguen el patrón `.then(...).catch(()=>{})`:

| Línea | Contexto |
|---|---|
| 634 | `initMap` click en mapa |
| 669 | `traceDone` (cierre de trazado de ruta) |
| 917 | `finishLocationPicker` (mover ubicación al editar) |
| 1073 | `goToUserLocation` |
| 1202 | `stopGpsRecording` |

**Impacto:** si Nominatim falla o es lento, el campo "Ubicación" no se pre-rellena con el nombre del lugar (queda solo con coordenadas o vacío). El usuario puede escribir manualmente. **No hay regresión funcional**, solo UX algo menos cómoda.

**Recomendación:** dejarlo como está. Añadir manejo robusto aquí no aporta — Nominatim falla rara vez y el fallback (coordenadas) ya cubre.

---

## ✅ Llamadas con manejo robusto (no requieren cambios)

Listo aquí las que verifiqué para confirmar que NO hay falsos positivos en la lista anterior:

- `loadAvistamientos` (línea 709) — try/catch + render de mensaje de error en pantalla.
- `loadRutas` (línea 747, fetch principal) — idem.
- `shareApp` (líneas 1407, 1458) — try/catch + showToast.
- `confirmSighting` (línea 802) — try/catch + showToast.
- `darHuellita` (líneas 1586, 1595, 1607, 1610, 1620, 1622) — try/catch + showToast.
- `submitReport` (línea 970) — try/catch + showToast + reset de UI.
- `submitEdit` (línea 1030) — idem.
- `submitRuta` (línea 799) — try/catch + showToast.
- `deleteOwnReport` (línea 1054) — try/catch + showToast.
- `reactivarReporte` (línea 524) — try/catch + showToast.
- `submitClaimPrize` POST principal (línea 1325) — try/catch + showToast.
- `loadRetoWinner` (línea 1244) — try/catch + fallback HTML "El reto ha terminado".
- `openMisReportes` (línea 465) — try/catch + render mensaje de error.
- `openRanking` (líneas 1098, 1100, 1102) — try/catch + render mensaje de error.
- `cargarMisHuellitas`, `contarHuellitasReportes`, `abrirMiniPerfil` — try/catch con fallbacks razonables.

---

## Recomendación de orden de ataque

1. ~~**Solo el CRÍTICO** (línea 247).~~ **✅ RESUELTO el 04/05/2026** — ver bloque arriba.
2. **Notificación ntfy del reto** (1362) — si los premios son material y caros, conviene asegurar que llegan.
3. El resto (MEDIO + BAJO) puede esperar. La app funciona, solo se degrada cosméticamente. No urge.
