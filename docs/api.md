# APIs de Nomi

La página usa dos APIs:

| API | Base | Dónde se configura | Quién la hizo |
|---|---|---|---|
| **API de Nomi** (usuarios, escaneos, menús, recetas) | `http://32.198.178.239:3001` (EC2) o `http://localhost:3000` (tu compu) | `CONFIG.API_URL` | Enrique |
| **API de fotos** (subir la foto del refri e historial) | `https://lnkiuphyxj.execute-api.us-east-1.amazonaws.com/dev/photos` | `CONFIG.API_REFRI_URL` | Alan |

# API de Nomi

Todas las respuestas son JSON. La página llama a estos endpoints desde `src/frontend/js/api.js`.

| Código | Significado |
|---|---|
| 200 / 201 | OK / creado |
| 400 | Faltan datos o son inválidos → `{ "error": "mensaje" }` |
| 404 | No existe (la página lo toma como "sin datos") |
| 409 | Ya existe |
| 500 | Error del servidor |

### `GET /`
Revisa que la API esté viva → `{ "ok": true }`.

## Usuarios

### `GET /usuarios/{usuario_id}`
200 → item de la tabla `usuarios`.

### `POST /usuarios`
Body:
```json
{ "usuario_id": "u3", "nombre": "Nicky", "correo": "nicky@correo.com",
  "personas": 2, "comidas_por_dia": 3, "meta_calorias": 2000,
  "preferencias": [], "tema": "dark" }
```
201 → usuario creado. 400 si falta `usuario_id`, `nombre`, `correo` o `personas`. 409 si el usuario ya existe.

### `PUT /usuarios/{usuario_id}`
Body: solo los campos que cambian (`nombre`, `correo`, `personas`, `comidas_por_dia`, `dia_escaneo`, `tiempo_max_min`, `meta_calorias`, `meta_proteina`, `preferencias`, `tema`).
Un campo en `null` se borra del usuario (ej. quitar la meta de calorías).
200 → usuario actualizado. 404 si el usuario no existe.

## Escaneos

### `POST /escaneos`
Body:
```json
{ "usuario_id": "u3", "personas": 2, "comidas_por_dia": 3,
  "ingredientes": [ { "nombre": "huevo", "cantidad": "12 piezas" } ] }
```
El backend pone `fecha` (SK) y genera el menú de la semana con las recetas del recetario.
201 → `{ usuario_id, fecha, ..., semana }`. 400 si no hay ingredientes o `personas`/`comidas_por_dia` no son válidos. 404 si el usuario no existe.

### `GET /escaneos/{usuario_id}/ultimo`
200 → el escaneo más reciente (con `foto_url` firmada si tiene foto). 404 si no hay.

## Menús

### `GET /menus/{usuario_id}/{semana}`
`semana` en formato ISO, ej. `2026-W45`.
200 → `{ usuario_id, semana, dias: [...] }` (forma en `docs/modelo_datos.md`). 404 si no hay menú esa semana.

### `PUT /menus/{usuario_id}/{semana}`
Se usa al cambiar un platillo. Body: `{ "dias": [...] }` con los 7 días completos.
200 → menú actualizado.

## Recetas

### `GET /recetas?categoria=desayuno`
`categoria` opcional (`desayuno`, `comida`, `cena`). Con categoría usa `query` en el GSI `CategoriaIndex`; sin categoría regresa todas.
200 → `[ receta, ... ]` con `imagen_url` firmada.

### `GET /recetas/{receta_id}`
200 → receta con `imagen_url` firmada. 404 si no existe.

# API de fotos (API Gateway + Lambda + Rekognition)

La llama `src/frontend/js/escanear_refri.js`.

### `POST /photos`
Pide una URL firmada para subir la foto del refri directo a S3.
Body:
```json
{ "fileType": "image/jpeg", "userId": "u1" }
```
200 → `{ "url": "https://...s3...", "clave": "..." }`

Después la página sube el archivo con `PUT` a esa `url` (con `Content-Type` igual a `fileType`). Al llegar la foto a S3, Rekognition detecta los ingredientes.

### `GET /photos?userId=u1`
Historial de fotos del usuario.
200 →
```json
{ "fotos": [ { "url_foto": "https://...", "createdAt": 1793900000, "ingredientes": ["Egg", "Milk"] } ] }
```
`createdAt` está en segundos. Si `ingredientes` todavía no viene, la página muestra "Procesando con IA…".

# Caso de uso de punta a punta
1. `escanear_refri.html`: el usuario sube la foto → `POST /photos` + `PUT` a S3 → Rekognition detecta ingredientes → aparecen en el historial (`GET /photos`).
2. El usuario confirma o agrega ingredientes y da **Generar menú** → `POST /escaneos` guarda el escaneo en DynamoDB y genera el menú.
3. `menu.html` → `GET /menus/{usuario_id}/{semana}` muestra los 7 días.

Flujo: página (S3) → backend en EC2 → DynamoDB, y página → API Gateway → Lambda → S3 → Rekognition.
