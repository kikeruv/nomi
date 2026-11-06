# API de Nomi

Base: la Invoke URL de API Gateway, o `http://localhost:3000` para probar en tu compu (se pone en `src/frontend/js/config.js` como `API_URL`).
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

## Caso de uso de la entrega intermedia
1. `escanear_refri.html` → `POST /escaneos` guarda los ingredientes y genera el menú.
2. `menu.html` → `GET /menus/{usuario_id}/{semana}` muestra los 7 días.

Flujo: página → backend en Node → DynamoDB.
