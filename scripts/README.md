# Scripts de mantenimiento — Perros de la Isla

Scripts Node de uso ocasional para limpiar/auditar el backend.

## Requisitos

- **Node 18+** (usa `fetch` nativo, sin dependencias npm).
- Acceso al proyecto Supabase con la **service_role key**.

Verificar versión:
```bash
node --version   # debe ser v18.x o superior
```

## Configuración (una sola vez)

Las credenciales se leen en este orden:
1. Variables de entorno (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
2. Archivo `.env` en la raíz del repo (fallback).

### Opción A — Archivo `.env` (recomendado)

Crear `.env` en la raíz del repo (NO en `scripts/`):

```
SUPABASE_URL=https://vqpdrncugaipfpcmpout.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ El archivo `.env` está en `.gitignore`. **NUNCA lo commitees.**

### Opción B — Variables de entorno en la shell

```bash
export SUPABASE_URL="https://vqpdrncugaipfpcmpout.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJhbG..."
```

### ¿De dónde sale la service_role key?

Supabase Dashboard → Settings → API → **service_role**. Tiene permisos completos sobre la BD y bypasea RLS, así que se trata como un secreto. Distinta de la `anon` key que sí va en `app.js`.

---

## `limpieza-huerfanos.js`

Detecta archivos del bucket `avistamientos` que **no están referenciados** en ninguna fila de la BD (`avistamientos.foto`, `avistamientos.fotos[]`, `usuarios.foto`, `rutas.foto`, `intercambios.foto`).

Causas típicas de huérfanos:
- Reportes archivados que ya nadie referencia.
- Fotos de perfil viejas reemplazadas por nuevas.
- Reportes editados con cambio de foto (la vieja queda colgando).

### Modo dry-run (por defecto, no borra nada)

```bash
node scripts/limpieza-huerfanos.js
```

Imprime una tabla con nombre, peso y fecha de cada huérfano y el total. **No toca el bucket.** Para borrar hay que pasar `--confirmar`.

### Modo borrado (con doble confirmación)

```bash
node scripts/limpieza-huerfanos.js --confirmar
```

Tras la tabla, pide escribir literal `BORRAR` (en mayúsculas) para confirmar. Si la respuesta no es exactamente esa palabra, cancela. Si confirma, borra uno a uno con log por archivo y reporte final.

### Buenas prácticas

1. **Siempre ejecutar primero en dry-run** y revisar la lista. Si algún archivo te suena raro, parar e investigar antes de borrar.
2. Después de un borrado, **abrir la app en producción y verificar** que las fotos de tarjetas y perfiles siguen cargando (señal de que no se rompió ninguna referencia).
3. Si por error se borra algo importante: Supabase tiene backups automáticos diarios. Restaurar desde Dashboard → Database → Backups.

### Dependencias del script

- Lee `avistamientos`, `usuarios`, `rutas`, `intercambios` (esta última es opcional — si no existe, la salta sin error).
- Filtra "carpetas" del bucket (entradas con `id: null`).
- Soporta tanto URLs completas (`https://...supabase.co/storage/v1/object/public/avistamientos/foo.jpg`) como paths sueltos (`foo.jpg`) en los campos de la BD.
