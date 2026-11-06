# Pendientes

## Entrega intermedia
- [x] Diseño nuevo de la página (foto del refri → menú semanal con calorías)
- [x] HTML, CSS y JS de todas las páginas, sin datos fijos
- [x] Modelo de datos y diagrama en Lucidchart
- [x] Tablas en DynamoDB (`crear_tablas.py`) y datos de prueba (`cargar_datos.py`)
- [x] Fotos de recetas en `nomi-photos/recetas/`
- [x] Backend en Node (`src/backend`) con los endpoints de `docs/api.md`
- [x] EC2 `nomi-api` con Docker y Elastic IP corriendo el backend
- [x] Página en el bucket `nomi-page-2026` conectada al backend
- [x] Subida de la foto del refri con la API de Alan (API Gateway + Lambda) e historial con ingredientes de Rekognition


## Entrega final
- [ ] API Gateway enfrente de la EC2 (https) y su URL en `config.js`
- [ ] CORS en la API y el bucket de fotos de Alan para el origen de la página
- [ ] Probar el caso de uso completo desde la página en S3
- [ ] Llenar la lista de ingredientes con lo que detecta Rekognition
- [ ] Inicio de sesión real con Cognito (reemplaza `USUARIO_ID` fijo)
- [ ] Juntar las ramas `enrique` y `alan`
