# Pendientes

## Hecho (entrega intermedia)
- Página en S3 (`nomi-page-2026`) conectada al backend — Enrique
- Backend Node con Dockerfile corriendo en EC2 `nomi-api` (`--restart always`, Elastic IP) — Enrique
- DynamoDB: 4 tablas con datos de prueba (`crear_tablas.py`, `cargar_datos.py`) — Enrique
- Fotos de recetas en `nomi-photos/recetas/` con URL firmada — Enrique
- API Gateway `nomi` (stage `dev`) con `GET` y `POST /photos` → Lambda, subida a S3 y Rekognition — Alan

## Falta
| Pendiente | Quién | Para |
|---|---|---|
| Agregar `ANY /{proxy+}` (HTTP proxy a la EC2) al API Gateway `nomi`, CORS y Deploy al stage `dev`; cambiar `API_URL` en `config.js` | Enrique y Alan | Intermedia |
| Diagrama `docs/solucion.png` (desplegado vs planeado) | Enrique y Alan | Intermedia |
| Capturas faltantes en `docs/evidencias/` (tabla con datos, `docker logs`, respuesta de curl) | Enrique | Intermedia |
| CORS en la API y el bucket de fotos para el origen de la página | Alan | Intermedia |
| Juntar las ramas `enrique` y `alan` en `main` | Enrique y Alan | Intermedia |
| Llenar los ingredientes del escaneo con lo que detecta Rekognition | Alan | Final |
| Nombres de tablas en el `.env` del backend | Enrique | Final |
| Inicio de sesión con Cognito (quita el `USUARIO_ID` fijo) | Alan | Final |
| Imagen en ECR y HTTPS de punta a punta | Enrique | Final |

## Riesgos
- **Learner Lab:** las credenciales y la sesión vencen; al reiniciar el lab la EC2 se apaga. El contenedor arranca solo, pero hay que prender la instancia.
- **IP fija en `config.js`:** si se pierde la Elastic IP la página deja de funcionar; con `/{proxy+}` la página solo usa la URL del API Gateway.
- **Un solo API Gateway en la cuenta de Alan:** si su lab no está activo no se puede editar el API; tu EC2 tiene que estar prendida para que respondan las rutas del backend.
