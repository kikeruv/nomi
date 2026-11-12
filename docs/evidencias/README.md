# Evidencias

**Página:** https://nomi-page-2026.s3.us-east-1.amazonaws.com/index.html
**API de Nomi (API Gateway):** https://zj991lzgv6.execute-api.us-east-1.amazonaws.com/dev
**API de fotos:** https://zj991lzgv6.execute-api.us-east-1.amazonaws.com/dev/photos (mismo API Gateway)

### Entrega intermedia: recurso `/photos` en la cuenta de Alan (ahora está en el API Gateway `nomi`)
![01_api_gateway_photos.png](01_api_gateway_photos.png)

### Entrega intermedia: Lambda `get_photo` (ahora `ver_fotos`)
![02_lambda_get_photo.png](02_lambda_get_photo.png)

### Entrega intermedia: Lambda `photo_upload_url` (ahora `subir_foto`)
![03_lambda_photo_upload_url.png](03_lambda_photo_upload_url.png)

### Buckets `nomi-page-2026` (página) y `nomi-photos` (imágenes)
![04_s3_buckets.png](04_s3_buckets.png)

### Tablas `usuarios`, `escaneos`, `menus` y `recetario` activas, con sus llaves y el GSI de `recetario`
![05_dynamodb_tablas.png](05_dynamodb_tablas.png)

### EC2 `nomi-api` (entrega intermedia; ahora el backend corre en ECS)
![06_ec2_instancia.png](06_ec2_instancia.png)

### `docker ps` con el contenedor `nomi-api` en el puerto 3001 y `version.json` (versión 1.0, alumno, fecha)
![07_docker_ps_version.png](07_docker_ps_version.png)

### `docker build` con `--build-arg` y `docker run --restart always --env-file .env`
![08_docker_build_run.png](08_docker_build_run.png)

### Página funcionando desde el sitio estático de S3
![09_pagina_s3.png](09_pagina_s3.png)

### Diagrama entidad-relación de las 4 tablas
![10_modelo_er.png](10_modelo_er.png)

## Faltan
- ECS: servicio `nomi-api` corriendo y la imagen en ECR.
- Cognito: User Pool y app client `nomi-web`.
- API Gateway `nomi`: `/{proxy+}` y `/photos` con el authorizer.
- Lambdas `subir_foto`, `ver_fotos` y `procesar_foto` (con su trigger de S3).
- Carpeta `escaneos/` en `nomi-photos` con una foto y su `.json`.
- Tabla con datos (**Explore items**).
