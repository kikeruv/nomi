# Pendientes

## Entrega intermedia
- [x] Diseño nuevo de la página (foto del refri → menú semanal con calorías)
- [x] HTML, CSS y JS de todas las páginas
- [x] Datos de ejemplo en `js/datos_ejemplo.js` (iguales a los de DynamoDB)
- [x] Modelo de datos y diagrama en Lucidchart
- [x] Tablas en DynamoDB (`crear_tablas.py`) y datos de prueba (`cargar_datos.py`)
- [x] Fotos de recetas en `nomi-photos/recetas/`
- [x] Backend en Node (`src/backend`) con los endpoints de `docs/api.md`, probado en local
- [ ] Copiar las fotos a `src/frontend/img/recetas/`
- [ ] Subir la página a `nomi-page-2026` con `API_URL: ""` y revisar que se vea con fotos

## Entrega final
- [ ] Publicar el backend (por ejemplo Lambda + API Gateway) y poner su URL en `config.js`
- [ ] Detección automática de ingredientes con la foto del refri (Rekognition)
- [ ] Subir la foto del refri a S3 desde la página
- [ ] Inicio de sesión real con Cognito (reemplaza `USUARIO_ID` fijo)
