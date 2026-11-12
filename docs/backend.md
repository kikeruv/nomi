# Backend de Nomi

API REST en **Node + Express 5**. Corre en un contenedor Docker en **ECS Fargate**; le llegan las peticiones por **API Gateway** (que ya revisó el token de Cognito), lee y guarda en **DynamoDB** y entrega las fotos de **S3** como URL firmada.

## Capas
```
Petición → routes/ → middlewares/sesion.js → controllers/ → data/ → DynamoDB / S3
                                                  ↓
                                            utils/menu.js
```
| Carpeta | Qué hace |
|---|---|
| `routes/` | Qué URL va a qué función |
| `middlewares/` | `sesion.js`: saca el usuario del token y revisa que solo pida sus datos |
| `controllers/` | Valida los datos y responde (200, 201, 400, 401, 403, 404, 409) |
| `data/` | Solo lee y guarda en DynamoDB y S3 |
| `utils/menu.js` | Fechas, armado del menú e ingredientes que tienes |

## Archivos

### `main.js`
- `cors()` deja que la página (otro dominio) llame a la API.
- `express.json()` convierte el body en `req.body`.
- `GET /` responde `{ ok: true }` (lo usa el health check).
- Monta `/usuarios`, `/escaneos`, `/menus` y `/recetas`.

### `middlewares/sesion.js`
- Sin header `Authorization` → `401`.
- Lee el `sub` del token (el id del usuario en Cognito). Si la URL o el body traen otro `usuario_id` → `403`.
- Guarda `req.usuarioId` para los controllers.
- El token ya lo validó el authorizer de Cognito en API Gateway.

### `routes/`
| Archivo | Rutas |
|---|---|
| `usuarios.js` | `GET /:usuario_id`, `POST /`, `PUT /:usuario_id` |
| `escaneos.js` | `POST /`, `GET /:usuario_id/ultimo` |
| `menus.js` | `GET /:usuario_id/:semana`, `PUT /:usuario_id/:semana/:dia/:tipo` |
| `recetas.js` | `GET /` (con `?categoria=`), `GET /:receta_id` |

### `controllers/`
| Archivo | Qué hace |
|---|---|
| `usuarios.js` | `revisarPerfil` valida los datos. `obtener`, `crear` (409 si ya existe) y `actualizar` (junta lo que había con los cambios; `null` borra el campo) |
| `escaneos.js` | `crear`: valida (personas, comidas, ingredientes sin vacíos ni repetidos), guarda el escaneo, arma el menú y lo guarda. `obtenerUltimo` |
| `menus.js` | `obtener` y `cambiarPlatillo`: busca la receta, revisa que sea de esa comida, arma la comida y recalcula `total_kcal` |
| `recetas.js` | Agrega a cada receta `imagen_url` y `en_refri` (ingredientes que tienes según tu último escaneo) y las ordena |

### `data/`
| Archivo | Servicio | Operaciones |
|---|---|---|
| `dynamo.js` | DynamoDB | Cliente (`DynamoDBDocumentClient`) |
| `usuarios.js` | tabla `usuarios` | Get, Put |
| `escaneos.js` | tabla `escaneos` | Put, Query (el más reciente) |
| `menus.js` | tabla `menus` | Get, Put |
| `recetas.js` | tabla `recetario` | Get, Scan, Query al índice `CategoriaIndex` |
| `imagenes.js` | S3 `nomi-photos` | URL firmada (1 hora) |

Las credenciales no van en el código: en ECS salen del rol `LabRole` (task role) y en la compu de `~/.aws/credentials`.

### `utils/menu.js`
- `fechaHora` → `"2026-11-11T13:45:00"` (SK de `escaneos`) y `semanaISO` → `"2026-W46"` (SK de `menus`).
- `ingredientesQueTienes(receta, refri)`: ingredientes de la receta que hay en el refri.
- `comidaDe(receta, refri)`: una comida del menú (copia título, kcal y macros, y calcula `usa_refri`).
- `totalKcal(comidas)`: suma las calorías del día.
- `generarMenu(usuario, escaneo, recetas)`: según `comidas_por_dia` arma los 7 días con las recetas rápidas que más ingredientes tienes, rotándolas para no repetir.

## Docker
`Dockerfile`: `node:20-alpine`, hora de México, instala dependencias, guarda versión y alumno en `version.json`, corre sin root, tiene `HEALTHCHECK` y expone el puerto 3001. `.dockerignore` deja fuera `node_modules` y `.env`.

En ECS las variables (`PORT`, `AWS_REGION`, `TZ`, `BUCKET_IMAGENES`) se ponen en el servicio, no en un `.env`.
