# Pendientes

## Entrega intermedia
- [x] Diseño nuevo de la página (foto del refri → menú semanal con calorías)
- [x] HTML, CSS y JS de todas las páginas
- [x] Modelo de datos y diagrama en Lucidchart
- [x] Tablas en DynamoDB (`crear_tablas.py`) y datos de prueba (`cargar_datos.py`)
- [x] Página subida al bucket `nomi-page-2026`
- [x] Imágenes en el bucket de imágenes
- [x] Backend (API) en `src/backend` con los endpoints de `docs/api.md`
- [ ] API Gateway (HTTP API) con CORS apuntando a la EC2
- [x] EC2 `nomi-api` con Docker y Elastic IP corriendo el backend
- [x] Quitar `datos_ejemplo.js` (la página ya usa el backend)
- [ ] Poner la Invoke URL de API Gateway en `config.js` y volver a subir la página
- [ ] Probar el caso de uso: `POST /escaneos` + `GET /menus`
- [ ] Completar "Cómo recrear los recursos" en el README

## Entrega final
- [ ] Detección automática de ingredientes con la foto del refri
- [ ] Inicio de sesión real con Cognito (reemplaza `USUARIO_ID` fijo)
- [ ] Subir la foto del refri a S3 desde la página
