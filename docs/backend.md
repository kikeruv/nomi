# Backend de Nomi

API REST en **Node + Express 5**. Recibe las peticiones de la página, lee y escribe en **DynamoDB** y entrega las fotos de **S3** como URL firmada. Corre en un contenedor Docker dentro de la EC2 `nomi-api`.

## Capas
```
Petición → routes/ → controllers/ → data/ → DynamoDB / S3
                          ↓
                    utils/menu.js
```
| Carpeta | Responsabilidad | Sabe de HTTP | Sabe de AWS |
|---|---|---|---|
| `routes/` | Qué URL va a qué función | Sí | No |
| `controllers/` | Valida, decide qué responder (200, 201, 400, 404, 409) | Sí | No |
| `data/` | Solo lee y guarda en DynamoDB y S3 | No | Sí |
| `utils/menu.js` | Fechas y armado del menú | No | No |

## Archivos

### `main.js`
- `dotenv` lee el `.env`.
- `cors()` deja que la página (en otro dominio) llame a la API.
- `express.json()` convierte el body JSON en `req.body`.
- `GET /` responde `{ ok: true }` para revisar que la API está viva.
- Monta `/usuarios`, `/escaneos`, `/menus` y `/recetas` y escucha en `PORT`.

### `routes/`
| Archivo | Rutas |
|---|---|
| `usuarios.js` | `GET /:usuario_id`, `POST /`, `PUT /:usuario_id` |
| `escaneos.js` | `POST /`, `GET /:usuario_id/ultimo` |
| `menus.js` | `GET /:usuario_id/:semana`, `PUT /:usuario_id/:semana` |
| `recetas.js` | `GET /` (con `?categoria=`), `GET /:receta_id` |

### `controllers/`
| Archivo | Qué hace |
|---|---|
| `usuarios.js` | `obtener` (404 si no existe), `crear` (400 si faltan datos, 409 si ya existe), `actualizar` (junta lo que había con los cambios; un campo en `null` se borra) |
| `escaneos.js` | `crear`: valida, revisa que el usuario exista, guarda el escaneo con su `fecha`, arma el menú con `generarMenu` y lo guarda. `obtenerUltimo`: último escaneo con `foto_url` |
| `menus.js` | `obtener` (404 si no hay menú esa semana) y `actualizar` (valida que vengan 7 días) |
| `recetas.js` | `obtenerTodas` (todas o por categoría) y `obtener`; a cada receta le agrega `imagen_url` |

### `data/`
| Archivo | Servicio | Funciones | Comando de DynamoDB |
|---|---|---|---|
| `dynamo.js` | DynamoDB | Conexión (`DynamoDBDocumentClient`) | — |
| `usuarios.js` | tabla `usuarios` | `obtener`, `guardar` | Get, Put |
| `escaneos.js` | tabla `escaneos` | `guardar`, `obtenerUltimo` | Put, Query (`ScanIndexForward: false`, `Limit: 1`) |
| `menus.js` | tabla `menus` | `obtener`, `guardar` | Get, Put |
| `recetas.js` | tabla `recetario` | `obtener`, `obtenerTodas`, `obtenerPorCategoria` | Get, Scan, Query al GSI `CategoriaIndex` |
| `imagenes.js` | S3 `nomi-photos` | `urlFirmada` (dura 1 hora) | — |

Las credenciales no van en el código: en la compu salen de `~/.aws/credentials` y en la EC2 del `LabInstanceProfile`.

### `utils/menu.js`
- `fechaHora(d)` → `"2026-11-05T13:45:00"` (SK de `escaneos`).
- `semanaISO(d)` → `"2026-W45"` (SK de `menus`; es la misma función que usa la página).
- `generarMenu(usuario, escaneo, recetas)`:
  1. Decide qué comidas armar según `comidas_por_dia` (1 = comida, 2 = comida y cena, 3 = las tres).
  2. Quita las recetas que tardan más que `tiempo_max_min` (si queda al menos una).
  3. Ordena las recetas por proporción de ingredientes que hay en el refri.
  4. Arma los 7 días de lunes a domingo, rotando las recetas para no repetir.
  5. Copia título, kcal, tiempo y macros de cada receta al menú y calcula `usa_refri` y `total_kcal`.

## Configuración (`.env`)
```
PORT=3001                     # 3000 en la compu, 3001 en la EC2
AWS_REGION=us-east-1
TZ=America/Mexico_City        # para que fechas y semana coincidan con la página
BUCKET_IMAGENES=nomi-photos
```

## Docker
`Dockerfile`: imagen `node:20-alpine` con la zona horaria de México, instala dependencias y corre `node main.js`. `.dockerignore` deja fuera `node_modules` y `.env`.

## Errores
No hay manejo de errores aparte: si algo falla con AWS, Express 5 responde `500` sin tumbar el servidor.
