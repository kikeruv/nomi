# Nomi

Aplicación web que arma tu menú de la semana a partir de una foto de tu refri: detecta los ingredientes que tienes, genera 7 días de desayuno, comida y cena con lo que ya hay en tu refri y te dice las calorías de cada comida.

Proyecto final de **Desarrollo en la Nube** (ITESO).

## Integrantes
| Integrante | Expediente | Parte principal |
|---|---|---|
| Alan Alejandro Rodríguez Avalos | 753343 | API de fotos: API Gateway + Lambda + Rekognition |
| Enrique Alonso Ruvalcaba Martinez | 751600 | Página, backend en EC2, DynamoDB y S3 |

## Arquitectura
```
                         ┌──────────────────────────────────────────────┐
Usuario ─→ Página (S3) ──┤ API de Nomi: EC2 + Docker (Node, puerto 3001) ├─→ DynamoDB (usuarios, escaneos, menus, recetario)
       nomi-page-2026    │                                              └─→ S3 nomi-photos (fotos de recetas, URL firmada)
                         │
                         └ API de fotos: API Gateway + Lambda ──→ S3 (foto del refri) ──→ Rekognition (ingredientes)
```

| Servicio | Para qué se usa |
|---|---|
| **S3 `nomi-page-2026`** | Sitio estático: HTML, CSS y JS (público) |
| **EC2 `nomi-api` + Docker** | Backend en Node/Express. Elastic IP `32.198.178.239`, puerto `3001`. Permisos con `LabInstanceProfile` (sin llaves en el código) |
| **DynamoDB** | Tablas `usuarios`, `escaneos`, `menus` y `recetario` (ver `docs/modelo_datos.md`) |
| **S3 `nomi-photos`** | Fotos de las recetas (privado); el backend las entrega como URL firmada |
| **API Gateway + Lambda** (Alan) | `https://lnkiuphyxj.execute-api.us-east-1.amazonaws.com/dev/photos`: da una URL firmada para subir la foto del refri a S3 y regresa el historial de fotos |
| **Rekognition** (Alan) | Detecta los ingredientes en la foto del refri |

## Documentación
| Archivo | Contenido |
|---|---|
| `docs/api.md` | Todos los endpoints (API de Nomi y API de fotos) |
| `docs/modelo_datos.md` | Tablas de DynamoDB, llaves, relaciones y rutas en S3 |
| `docs/backend.md` | Cómo está hecho el backend (capas, archivos, menú) |
| `docs/frontend.md` | Páginas, qué JS usa cada una y a qué endpoints llama |
| `docs/despliegue.md` | Paso a paso para levantar todo en el Learner Lab |
| `docs/pendientes.md` | Lo que está hecho y lo que falta |

## Estructura del repositorio
```
nomi/
├── docs/                    # Documentación
└── src/
    ├── backend/             # API de Nomi (Node + Express)
    │   ├── main.js          # Arranca el servidor y junta las rutas
    │   ├── routes/          # URL → controller
    │   ├── controllers/     # Valida y responde cada petición
    │   ├── data/            # Habla con DynamoDB y S3
    │   ├── utils/menu.js    # Fechas y armado del menú de la semana
    │   ├── Dockerfile       # Imagen para correr en la EC2
    │   └── .env             # Configuración (no se sube a git)
    ├── frontend/            # Página web (se sube a S3)
    │   ├── *.html           # Una página por pantalla
    │   ├── css/             # tokens.css (colores y tema) y estilos.css
    │   └── js/              # config.js, api.js, tema.js, semana.js y un JS por página
    └── scripts/
        ├── crear_tablas.py  # Crea las tablas de DynamoDB
        └── cargar_datos.py  # Carga los datos de prueba
```

## Configuración de la página
`src/frontend/js/config.js`:
```js
const CONFIG = {
    API_URL: "http://32.198.178.239:3001",   // API de Nomi (EC2)
    USUARIO_ID: "u1",                         // Usuario fijo hasta tener Cognito
    API_REFRI_URL: "https://lnkiuphyxj.execute-api.us-east-1.amazonaws.com/dev/photos"  // API de fotos
};
```
Para probar con el backend en tu compu, cambia `API_URL` a `http://localhost:3000`.

## Correrlo en tu compu
1. Copia las credenciales del Learner Lab (**AWS Details → AWS CLI**) a `~/.aws/credentials`.
2. Crea `src/backend/.env`:
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
4. En `config.js` pon `API_URL: "http://localhost:3000"` y abre `src/frontend/index.html`.

## Subirlo a la nube
Resumen (detalle en `docs/despliegue.md`):
1. DynamoDB: `python crear_tablas.py` y `python cargar_datos.py`.
2. Fotos de recetas en `s3://nomi-photos/recetas/r1.jpg … r9.jpg`.
3. EC2 con Docker corriendo el backend en el puerto 3001 y Elastic IP.
4. Página:
   ```
   aws s3 rm s3://nomi-page-2026 --recursive
   aws s3 cp src/frontend s3://nomi-page-2026 --recursive
   ```

## Problemas comunes
| Síntoma | Causa | Solución |
|---|---|---|
| `AccessDeniedException ... voc-cancel-cred` | Se acabó la sesión del Learner Lab | Start Lab y copiar las credenciales nuevas a `~/.aws/credentials`; reiniciar `node main.js` |
| "No pudimos conectar con el servidor" | La EC2 está apagada o el contenedor no corre | Prender la EC2 y revisar `docker ps` |
| "CONFIG is not defined" | `config.js` tiene un error de sintaxis (por ejemplo `export`) | `config.js` debe ser un `<script>` normal, sin `export` |
| Error de CORS al subir la foto | La API o el bucket de fotos de Alan no aceptan el origen de la página | Configurar CORS en su API Gateway y en su bucket |
| La página no muestra los cambios | El navegador usa la versión guardada | Recargar con **Ctrl + Shift + R** |
