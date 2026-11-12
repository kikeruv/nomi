# Frontend de Nomi

HTML, CSS y JavaScript sin frameworks, publicado en el bucket `nomi-page-2026`. Solo muestra datos: las validaciones las hacen Cognito y el backend.

## Archivos comunes
| Archivo | Qué hace |
|---|---|
| `css/tokens.css` | Colores, letras y espacios; tema oscuro y claro |
| `css/estilos.css` | Estilos de todas las páginas |
| `js/config.js` | URL de la API, URL de Cognito y Client ID (no son secretos) |
| `js/api.js` | Sesión con Cognito (crear cuenta, confirmar, iniciar sesión, renovar token, cerrar sesión), `pedir()` y una función por endpoint |
| `js/tema.js` | Tema claro u oscuro |
| `js/semana.js` | Pinta los 7 días del menú (Mi semana y Menú) |

Orden de los scripts: `tema.js` (en `<head>`), `config.js`, `api.js` y el JS de la página.

## Sesión
- `iniciarSesion` guarda el IdToken y el RefreshToken en `sessionStorage` (se borran al cerrar la pestaña). Solo se guardan los tokens, no datos del usuario.
- `pedir()` manda el token en el header `Authorization`. Si la API responde `401`, pide un token nuevo con el RefreshToken y repite la petición; si no se puede, manda al login.
- El usuario de las páginas sale del token (`sub`). Sin sesión, las páginas mandan al login.

## Páginas
| Página | Qué hace | Llama a |
|---|---|---|
| `index.html` | Inicio | — |
| `login.html` | Inicia sesión; si la cuenta no tiene perfil, le crea uno básico | Cognito, `GET`/`POST /usuarios` |
| `crear_cuenta.html` | Crea la cuenta, pide el código del correo y guarda el perfil | Cognito, `POST /usuarios` |
| `dashboard.html` | Calorías de hoy, macros, último escaneo, qué comes hoy y la semana | `/usuarios`, `/menus`, `/escaneos` |
| `escanear_refri.html` | Sube la foto (pide la URL firmada y hace el `PUT` a S3), muestra el historial con los ingredientes que detectó Rekognition, arma la lista y genera el menú | `POST`/`GET /photos`, S3, `POST /escaneos` |
| `menu.html` | Resumen, 7 días y cambiar un platillo | `/menus`, `/recetas?categoria=`, `PUT /menus/.../{dia}/{tipo}` |
| `recetas.html` | Catálogo con filtros y buscador | `/recetas` |
| `receta.html` | Detalle de una receta | `/recetas/{id}` |
| `perfil.html` | Datos, cómo se arma el menú, preferencias, tema y cerrar sesión | `GET`/`PUT /usuarios` |
| `error.html` | Página 404 del sitio | — |

Si la API responde un error, la página muestra el mensaje que manda el backend o Cognito.
