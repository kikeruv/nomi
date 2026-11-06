# Frontend de Nomi

HTML, CSS y JavaScript sin frameworks. Se publica como sitio estático en el bucket `nomi-page-2026`.

## Archivos comunes
| Archivo | Qué hace |
|---|---|
| `css/tokens.css` | Colores, letras y espacios; tema oscuro y claro (`data-theme`) |
| `css/estilos.css` | Clases de todas las páginas |
| `js/tema.js` | Aplica el tema guardado y el botón de sol/luna |
| `js/config.js` | `API_URL`, `USUARIO_ID` y `API_REFRI_URL` |
| `js/api.js` | Funciones para llamar a la API de Nomi (`obtenerUsuario`, `guardarEscaneo`, `obtenerMenu`, …) y utilidades (`semanaISO`, `formatoNumero`, `crear`, `ponerAvatar`, …) |
| `js/semana.js` | Pinta los 7 días del menú (lo usan Mi semana y Menú) |

Orden de los `<script>` en cada página: `tema.js` (en `<head>`), luego `config.js`, `api.js` y el JS de la página.

## Páginas
| Página | JS | Qué hace | Endpoints |
|---|---|---|---|
| `index.html` | — | Inicio público | — |
| `login.html` | `login.js` | Valida el formulario y entra a Mi semana (sin login real todavía) | — |
| `crear_cuenta.html` | `crear_cuenta.js` | Crea el usuario (la contraseña no se guarda) | `POST /usuarios` |
| `dashboard.html` | `dashboard.js` | Calorías de hoy, macros, último escaneo, qué comes hoy y la semana | `GET /usuarios`, `GET /menus`, `GET /escaneos/.../ultimo` |
| `escanear_refri.html` | `escanear_refri.js` | Sube la foto del refri, muestra el historial con ingredientes detectados, lista de ingredientes y genera el menú | API de fotos `POST`/`GET /photos`, `POST /escaneos` |
| `menu.html` | `menu.js` | Resumen, 7 días y cambiar un platillo | `GET /menus`, `GET /recetas?categoria=`, `PUT /menus` |
| `recetas.html` | `recetas.js` | Catálogo con filtros y buscador | `GET /recetas` |
| `receta.html` | `receta.js` | Detalle de una receta (`?receta_id=`) | `GET /recetas/:id` |
| `perfil.html` | `perfil.js` | Datos, cómo se arma el menú, preferencias y tema | `GET` y `PUT /usuarios` |
| `error.html` | — | Página 404 del sitio | — |

## Sin datos fijos
Todo sale de la API. Si la API no responde, la página muestra "No pudimos conectar con el servidor". Si un endpoint responde 404 (por ejemplo, no hay menú esa semana), la página muestra un aviso en lugar de un error.

## Notas
- `USUARIO_ID` es fijo (`u1`) hasta tener Cognito.
- Todos los `<script>` son normales (sin `type="module"`) para que funcionen también abriendo el archivo con doble clic.
