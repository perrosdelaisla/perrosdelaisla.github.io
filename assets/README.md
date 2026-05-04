# Assets — Paseos Seguros

Imágenes y archivos estáticos referenciados desde la app.

## Logos

- `logo-paseos-seguros.png` — 1024×1024 transparente. Usado como hero en pestaña INICIO.
- `logo-paseos-seguros-icon.png` — 256×256 transparente. Reservado para futuros usos (favicon, app icon).

⚠️ **Si no ves los archivos PNG aquí, hay que colocarlos manualmente.** No se commitean desde la herramienta automática (Write no maneja binarios). Tras colocarlos, hacer `git add assets/*.png && git commit --amend --no-edit && git push`.

## Carpeta `peligros/`

Reservada para fotos reales de cada peligro que reemplazarán los gradientes/emojis del carrusel "Otros peligros que también cubrimos" en la pestaña ALERTA. Nombres esperados:

- `cristales.jpg`
- `garrapatas.jpg`
- `comida-envenenada.jpg`
- `otros.jpg`

Cuando se añadan, actualizar el HTML de `index.html` (sección `.peligros-carrusel`) reemplazando los `background-color` de cada `.peligro-card` por `background-image: url('assets/peligros/...')` con `background-size: cover`.
