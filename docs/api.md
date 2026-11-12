# API

![Diagrama de la solución](solucion.png)


## API Gateway
| API | Tipo | Stage | Invoke URL |
|---|---|---|---|
| `nomi` (`zj991lzgv6`) | REST | `dev` | `https://zj991lzgv6.execute-api.us-east-1.amazonaws.com/dev` |

| Recurso | Método | Autorización | Integración | Destino |
|---|---|---|---|---|
| `/{proxy+}` | `ANY` | Cognito (`cognito-nomi`) | HTTP proxy | `https://no-c4f1289374b3471e960787e255c0b998.ecs.us-east-1.on.aws/{proxy}` |
| `/{proxy+}` | `OPTIONS` | Ninguna (preflight de CORS) | HTTP proxy | El mismo |
| `/photos` | `POST` | Cognito (`cognito-nomi`) | Lambda proxy | `subir_foto` |
| `/photos` | `GET` | Cognito (`cognito-nomi`) | Lambda proxy | `ver_fotos` |
| `/photos` | `OPTIONS` | Ninguna | Mock (Enable CORS) | — |

`/photos` es más específico que `/{proxy+}`, así que las fotos van a las Lambdas y lo demás a ECS.

- **Authorizer:** revisa el token del header `Authorization` con el User Pool de Cognito. Sin token o con token vencido responde `401`.
- **Gateway responses (4XX y 5XX):** llevan `Access-Control-Allow-Origin: '*'` para que la página pueda leer el 401 y renovar el token.
- **¿Por qué proxy?** Express ya tiene las rutas, valida y responde con su código. Con un solo recurso `/{proxy+}` no repetimos cada endpoint en API Gateway. Las Lambdas usan Lambda proxy: reciben el evento completo (con el usuario del token en `requestContext.authorizer.claims.sub`) y arman su respuesta.

## Sesión
1. La página inicia sesión con Cognito (`USER_PASSWORD_AUTH`) y recibe un **IdToken** (60 min) y un **RefreshToken** (5 días).
2. Manda el IdToken en el header `Authorization` en cada petición.
3. Si la API responde `401`, pide un IdToken nuevo con el RefreshToken y repite la petición.
4. El backend (`middlewares/sesion.js`) saca el usuario del token (`sub`) y responde `403` si pides datos de otro usuario.

## Códigos
| Código | Significado |
|---|---|
| 200 / 201 | OK / creado |
| 400 | Datos inválidos → `{ "error": "mensaje" }` |
| 401 | Sin sesión o token vencido |
| 403 | Datos de otro usuario |
| 404 | No existe |
| 409 | Ya existe |

## Endpoints
Todos piden sesión. `usuario_id` es el `sub` de Cognito.

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/usuarios/{usuario_id}` | Perfil |
| `POST` | `/usuarios` | Crea el perfil (nombre, correo, personas) |
| `PUT` | `/usuarios/{usuario_id}` | Cambia los campos enviados; `null` borra el campo |
| `POST` | `/escaneos` | Guarda los ingredientes y arma el menú de la semana |
| `GET` | `/escaneos/{usuario_id}/ultimo` | Último escaneo |
| `GET` | `/menus/{usuario_id}/{semana}` | Menú de la semana (`2026-W46`) |
| `PUT` | `/menus/{usuario_id}/{semana}/{dia}/{tipo}` | Cambia un platillo. Body `{ "receta_id": "r9" }`, `dia` 0 = lunes … 6 = domingo |
| `GET` | `/recetas?categoria=desayuno` | Recetas (la categoría usa el índice `CategoriaIndex`), ordenadas por lo que tienes en el refri |
| `GET` | `/recetas/{receta_id}` | Una receta |

### Fotos del refri (Lambdas)
| Método | Ruta | Qué hace | Respuesta |
|---|---|---|---|
| `POST` | `/photos` | Crea la llave `escaneos/{sub}/{ms}.jpg` y una URL firmada para subirla (5 min) | `200 { "url", "clave" }` |
| `GET` | `/photos` | Fotos del usuario, la más nueva primero | `200 { "fotos": [ { "url", "fecha", "ingredientes" } ] }` |

`ingredientes` es `null` mientras Rekognition sigue procesando la foto.

**Subida de la foto:** el JS de la página (`escanear_refri.js`) pide la URL con `POST /photos` y luego hace un `PUT` directo a S3 con esa URL. La foto no pasa por API Gateway ni por la Lambda: la URL firmada solo deja subir ese archivo y vence en 5 minutos. Al llegar la foto, S3 dispara `procesar_foto`, que llama a Rekognition (`DetectLabels`), traduce las etiquetas a español y guarda `{ "ingredientes": [...] }` en un `.json` junto a la foto.

Cada receta trae `imagen_url` (URL firmada de S3, 1 hora) y `en_refri` (ingredientes que tienes, o `null` si no has escaneado).

### Lo que valida el backend
| Endpoint | Validación |
|---|---|
| Usuarios | nombre no vacío, correo con `@`, personas ≥ 1, comidas por día de 1 a 3, minutos y metas > 0 |
| Escaneos | personas ≥ 1, comidas de 1 a 3, al menos un ingrediente, sin nombres vacíos ni repetidos |
| Cambiar platillo | el día y la comida existen, la receta existe y es de esa comida |

## Caso de uso
1. **Crear cuenta:** Cognito manda un código al correo → se confirma → `POST /usuarios`.
2. **Escanear refri:** `POST /photos` → `PUT` de la foto a S3 → Rekognition detecta los ingredientes → `GET /photos` los muestra en el historial → **Usar estos ingredientes** → **Generar menú** → `POST /escaneos`.
3. **Menú:** `GET /menus/{usuario_id}/{semana}` pinta los 7 días; cambiar un platillo → `PUT /menus/.../{dia}/{tipo}`.

