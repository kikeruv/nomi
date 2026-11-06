# Nomi

Aplicación web que arma tu menú de la semana a partir de una foto de tu refri: reconoce los ingredientes que tienes, genera 7 días de desayuno, comida y cena con lo que ya hay en tu refri y te dice las calorías de cada comida.

## Integrantes
- Alan Alejandro Rodríguez Avalos – 753343
- Enrique Alonso Ruvalcaba Martinez – 751600

## Arquitectura
**Entrega intermedia:** la página funciona solo con S3 (sitio estático). Los datos salen de `js/datos_ejemplo.js`, que tiene los mismos datos que se cargaron en DynamoDB.

```
Usuario → S3 nomi-page-2026 (HTML, CSS, JS e imágenes)
```

El backend en Node (`src/backend`) ya está hecho y se conecta a DynamoDB y S3. Se puede correr en la compu para probar la página con datos reales:

```
Página → backend en Node (localhost:3000) → DynamoDB
                                          ↘ S3 nomi-photos (URLs firmadas)
```

| Servicio | Uso |
|---|---|
| S3 `nomi-page-2026` | Sitio estático (HTML, CSS, JS y fotos de recetas en `img/recetas/`) |
| S3 `nomi-photos` (privado) | Fotos de recetas y del refri que usa el backend |
| DynamoDB | Tablas `usuarios`, `escaneos`, `menus` y `recetario` |

## Estructura del repositorio
```
nomi/
├── docs/
│   ├── api.md            # Endpoints de la API
│   ├── modelo_datos.md   # Tablas, llaves y relaciones
│   └── pendientes.md     # Lo que falta
└── src/
    ├── backend/          # API en Node (Express)
    │   ├── main.js       # Arranca el servidor y junta las rutas
    │   ├── routes/       # URL → controller
    │   ├── controllers/  # Valida y responde cada petición
    │   ├── data/         # Habla con DynamoDB y S3
    │   └── utils/menu.js # Fechas y armado del menú de la semana
    ├── frontend/         # Página web
    │   ├── css/          # tokens.css (colores y tema) y estilos.css
    │   ├── img/recetas/  # Fotos de las recetas (r1.jpg … r9.jpg)
    │   └── js/           # Un archivo por página + api.js, config.js, tema.js y datos_ejemplo.js
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
**Solo la página (como en S3):** abre `src/frontend/index.html` en el navegador. Con `API_URL: ""` en `src/frontend/js/config.js`, las páginas usan los datos de `js/datos_ejemplo.js`. Lo que se cambia (perfil, escaneo, platillo) dura solo mientras la página está abierta; no se guarda nada en el navegador.

**Con el backend (datos reales de DynamoDB):**
1. Copia las credenciales del Learner Lab (AWS Details → AWS CLI) a `~/.aws/credentials`.
2. En `src/backend` crea el `.env`:
   ```
   PORT=3000
   AWS_REGION=us-east-1
   TZ=America/Mexico_City
   BUCKET_IMAGENES=nomi-photos
   ```
3. Arranca el backend:
   ```
   cd src/backend
   npm install
   node main.js
   ```
4. En `src/frontend/js/config.js` pon `API_URL: "http://localhost:3000"` y abre la página.
5. Antes de subir la página a S3, regresa `API_URL` a `""`.

## Cómo recrear los recursos (Learner Lab)
Requisitos: AWS CLI configurado (`aws configure`) y Python con `boto3`.

1. **DynamoDB**
   ```
   cd src/scripts
   python crear_tablas.py
   python cargar_datos.py
   ```
   `crear_tablas.py` se salta las tablas que ya existen.

2. **S3: imágenes** (`nomi-photos`, privado)
   - `recetas/{receta_id}.jpg` (r1 a r9)
   - `escaneos/{usuario_id}/{fecha}.jpg`

   Copia las fotos de las recetas a la carpeta de la página:
   ```
   aws s3 cp s3://nomi-photos/recetas/ src/frontend/img/recetas/ --recursive
   ```

3. **S3: página** (`nomi-page-2026`, público). Con `API_URL: ""` en `config.js`:
   ```
   aws s3 rm s3://nomi-page-2026 --recursive
   aws s3 cp src/frontend s3://nomi-page-2026 --recursive
   ```
   En **Properties → Static website hosting**: documento de índice `index.html` y de error `error.html`.
   En **Permissions**: *Block public access* apagado y una bucket policy con `s3:GetObject` público.
