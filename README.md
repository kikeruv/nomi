# Nomi

Aplicación web que arma tu menú de la semana a partir de una foto de tu refri: reconoce los ingredientes que tienes, genera 7 días de desayuno, comida y cena con lo que ya hay en tu refri y te dice las calorías de cada comida.

## Integrantes
- Alan Alejandro Rodríguez Avalos – 753343
- Enrique Alonso Ruvalcaba Martinez – 751600

## Arquitectura
Sitio estático (S3) → API Gateway → Contenedor Docker en EC2 → DynamoDB
                                                              ↘ S3 (imágenes)

| Servicio | Uso |
|---|---|
| S3 `nomi-page-2026` | Sitio estático (HTML, CSS y JS) |
| S3 (bucket de imágenes, privado) | Fotos de recetas y fotos del refri |
| API Gateway (HTTP API) | Recibe las peticiones de la página y las manda a la EC2 |
| EC2 + Docker | Backend (API) con `LabInstanceProfile`, sin llaves en el código |
| DynamoDB | Tablas `usuarios`, `escaneos`, `menus` y `recetario` |

## Estructura del repositorio
```
nomi/
├── docs/
│   ├── api.md            # Endpoints de la API
│   ├── modelo_datos.md   # Tablas, llaves y relaciones
│   └── pendientes.md     # Lo que falta
└── src/
    ├── backend/          # API (pendiente)
    ├── frontend/         # Página web
    │   ├── css/          # tokens.css (colores y tema) y estilos.css
    │   └── js/           # Un archivo por página + api.js, config.js, tema.js
    └── scripts/
        ├── crear_tablas.py   # Crea las tablas de DynamoDB
        └── cargar_datos.py   # Carga los datos de prueba
```

## Páginas
| Página | Qué hace |
|---|---|
| `index.html` | Inicio público |
| `login.html` / `crear_cuenta.html` | Iniciar sesión y crear cuenta |
| `dashboard.html` | Mi semana: calorías de hoy, último escaneo, qué comes hoy y los 7 días |
| `escanear_refri.html` | Foto del refri y lista de ingredientes |
| `menu.html` | Menú de la semana y cambiar un platillo |
| `recetas.html` / `receta.html` | Catálogo y detalle de recetas |
| `perfil.html` | Datos, preferencias del menú y tema claro/oscuro |
| `error.html` | Página 404 del sitio estático |

## Cómo correrlo
**Solo la página (sin AWS):** abre `src/frontend/index.html` en el navegador. Mientras `API_URL` esté vacío en `src/frontend/js/config.js`, las páginas usan los datos de `js/datos_ejemplo.js`. No se guarda nada en el navegador.

**Con la API:**
1. Pon la Invoke URL de API Gateway en `src/frontend/js/config.js` (sin `/` al final).
2. Borra `src/frontend/js/datos_ejemplo.js` y su `<script>` en los HTML.
3. Sube la página al bucket (ver abajo).

## Cómo recrear los recursos (Learner Lab)
Requisitos: AWS CLI configurado (`aws configure`) y Python con `boto3`.

1. **DynamoDB**
   ```
   cd src/scripts
   python crear_tablas.py
   python cargar_datos.py
   ```
   `crear_tablas.py` se salta las tablas que ya existen.

2. **S3: página**
   ```
   aws s3 rm s3://nomi-page-2026 --recursive
   aws s3 cp src/frontend s3://nomi-page-2026 --recursive
   ```
   En **Properties → Static website hosting**: documento de índice `index.html` y de error `error.html`.

3. **S3: imágenes** (bucket privado)
   - `recetas/{receta_id}.jpg` (r1 a r9)
   - `escaneos/{usuario_id}/{fecha}.jpg`

4. **Backend, EC2 y API Gateway:** _pendiente_ (ver `docs/pendientes.md`).
