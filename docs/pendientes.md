# Pendientes

## Entrega intermedia
- [x] Diseño nuevo de la página (foto del refri → menú semanal con calorías)
- [x] HTML, CSS y JS de todas las páginas (con datos de ejemplo mientras no hay API)
- [x] Modelo de datos y diagrama en Lucidchart
- [x] Tablas en DynamoDB (`crear_tablas.py`) y datos de prueba (`cargar_datos.py`)
- [x] Página subida al bucket `nomi-page-2026`
- [x] Imágenes en el bucket de imágenes
- [ ] Backend (API) en `src/backend` con los endpoints de `docs/api.md`
- [ ] `Dockerfile` del backend
- [ ] EC2 con `LabInstanceProfile` corriendo el contenedor
- [ ] API Gateway (HTTP API) con CORS apuntando a la EC2
- [ ] Poner `API_URL` en `config.js`, quitar `datos_ejemplo.js` y volver a subir la página
- [ ] Probar el caso de uso: `POST /escaneos` + `GET /menus`
- [ ] Completar "Cómo recrear los recursos" en el README

## Entrega final
- [ ] Detección automática de ingredientes con la foto del refri
- [ ] Inicio de sesión real con Cognito (reemplaza `USUARIO_ID` fijo)
- [ ] Subir la foto del refri a S3 desde la página
