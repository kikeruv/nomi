# Nomi

Aplicación web que arma tu menú de la semana a partir de una foto de tu refri: reconoce los ingredientes que tienes, genera 7 días de desayuno, comida y cena con lo que ya hay en tu refri y te dice las calorías de cada comida.

## Integrantes
- Alan Alejandro Rodríguez Avalos – 753343
- Enrique Alonso Ruvalcaba Martinez – 751600

## Arquitectura
```
Página (S3 nomi-page-2026) → API Gateway (https) → Docker en EC2 (backend en Node) → DynamoDB
                                                                                  ↘ S3 nomi-photos (URLs firmadas)
```

| Servicio | Uso |
|---|---|
| S3 `nomi-page-2026` | Sitio estático (HTML, CSS y JS) |
| API Gateway (HTTP API) | URL pública en https que manda las peticiones a la EC2 |
| EC2 `nomi-api` + Docker | Backend en Node (puerto 3001, Elastic IP) con `LabInstanceProfile`, sin llaves en el código |
| DynamoDB | Tablas `usuarios`, `escaneos`, `menus` y `recetario` |
| S3 `nomi-photos` (privado) | Fotos de recetas y del refri; el backend las entrega como URL firmada |

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
    │   └── js/           # Un archivo por página + api.js, config.js y tema.js
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
La página siempre usa el backend: la URL va en `src/frontend/js/config.js` como `API_URL`.

**Backend en tu compu (para probar):**
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
4. En `config.js` pon `API_URL: "http://localhost:3000"` y abre la página.

**Backend en AWS:** en `config.js` va la Invoke URL de API Gateway (`https://...execute-api.us-east-1.amazonaws.com`).

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

3. **S3: página** (`nomi-page-2026`, público). Con la URL de API Gateway en `config.js`:
   ```
   aws s3 rm s3://nomi-page-2026 --recursive
   aws s3 cp src/frontend s3://nomi-page-2026 --recursive
   ```
   En **Properties → Static website hosting**: documento de índice `index.html` y de error `error.html`.
   En **Permissions**: *Block public access* apagado y una bucket policy con `s3:GetObject` público.

4. **EC2** (`nomi-api`): Amazon Linux 2023, `t3.micro`, `LabInstanceProfile`, security group con SSH (22) y TCP 3001 abiertos, y una Elastic IP.
   ```
   sudo dnf install -y docker
   sudo systemctl enable --now docker
   sudo usermod -aG docker ec2-user
   ```
   Copia `src/backend` a `~/backend` (con su `.env` y `PORT=3001`) y:
   ```
   cd ~/backend
   docker build -t nomi-api .
   docker run -d --name nomi-api --restart always -p 3001:3001 --env-file .env nomi-api
   ```

5. **API Gateway**: HTTP API con integración HTTP `ANY http://<ELASTIC-IP>:3001/{proxy}`, ruta `ANY /{proxy+}` y CORS (`*`, `GET POST PUT OPTIONS`, `content-type`).
