# Evidencias

**Página:** http://nomi-page-2026.s3-website-us-east-1.amazonaws.com
**API de Nomi (EC2):** http://32.198.178.239:3001
**API de fotos (API Gateway, stage `dev`):** https://lnkiuphyxj.execute-api.us-east-1.amazonaws.com/dev/photos

### API Gateway `nomi`: recurso `/photos` con `GET`, `POST` y `OPTIONS`, integración Lambda proxy
![01_api_gateway_photos.png](01_api_gateway_photos.png)

### Lambda `get_photo` con su trigger de API Gateway (`GET /photos`)
![02_lambda_get_photo.png](02_lambda_get_photo.png)

### Lambda `photo_upload_url` con su trigger de API Gateway (`POST /photos`)
![03_lambda_photo_upload_url.png](03_lambda_photo_upload_url.png)

### Buckets `nomi-page-2026` (página) y `nomi-photos` (imágenes)
![04_s3_buckets.png](04_s3_buckets.png)

### Tablas `usuarios`, `escaneos`, `menus` y `recetario` activas, con sus llaves y el GSI de `recetario`
![05_dynamodb_tablas.png](05_dynamodb_tablas.png)

### EC2 `nomi-api` (t3.micro) corriendo con 3/3 checks
![06_ec2_instancia.png](06_ec2_instancia.png)

### `docker ps` con el contenedor `nomi-api` en el puerto 3001 y `version.json` (versión 1.0, alumno, fecha)
![07_docker_ps_version.png](07_docker_ps_version.png)

### `docker build` con `--build-arg` y `docker run --restart always --env-file .env`
![08_docker_build_run.png](08_docker_build_run.png)

### Página funcionando desde el sitio estático de S3
![09_pagina_s3.png](09_pagina_s3.png)

### Diagrama entidad-relación de las 4 tablas
![10_modelo_er.png](10_modelo_er.png)

