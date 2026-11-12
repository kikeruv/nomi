# Despliegue en el Learner Lab

Región: `us-east-1`. En el Learner Lab no se pueden crear roles: donde pida un rol se usa **`LabRole`**.

## 0. Credenciales (solo para tu compu)
1. **Start Lab** y espera el círculo verde.
2. **AWS Details → AWS CLI → Show** y copia el bloque a `C:\Users\<tu-usuario>\.aws\credentials`.
3. Cada sesión nueva del lab cambia las credenciales.

## 1. DynamoDB
```
cd src/scripts
python crear_tablas.py
python cargar_datos.py
```
Crea `usuarios`, `escaneos`, `menus` y `recetario` (con el índice `CategoriaIndex`) y carga las 9 recetas.

## 2. Fotos de recetas (`nomi-photos`, privado)
Sube las fotos como `recetas/r1.jpg … recetas/r9.jpg`.

## 3. Backend en ECS
### Subir la imagen a ECR (desde CloudShell)
1. **ECR → Create repository** → privado → `nomi-api`.
2. Abre **CloudShell** (`>_`), sube un `.zip` de `src/backend` (**Actions → Upload file**) y corre:
   ```bash
   unzip backend.zip && cd backend
   docker build --build-arg APP_VERSION=1.0 --build-arg ALUMNO=Enrique -t nomi-api .
   CUENTA=$(aws sts get-caller-identity --query Account --output text)
   REPO=$CUENTA.dkr.ecr.us-east-1.amazonaws.com/nomi-api
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $CUENTA.dkr.ecr.us-east-1.amazonaws.com
   docker tag nomi-api:latest $REPO:1.0
   docker push $REPO:1.0
   ```

### Crear el servicio (ECS Express)
| Campo | Valor |
|---|---|
| Image URI | `nomi-api:1.0` (Browse ECR images) |
| Task execution role / Infrastructure role / Task role | `LabRole` |
| Name | `nomi-api` |
| Container port | `3001` |
| Health check path | `/` |
| Environment variables | `PORT=3001`, `AWS_REGION=us-east-1`, `TZ=America/Mexico_City`, `BUCKET_IMAGENES=nomi-photos` |

ECS crea el cluster, el balanceador y una URL HTTPS fija (`https://...ecs.us-east-1.on.aws`).

### Actualizar el backend
Sube la imagen con otro tag (`1.1`, `1.2`…) y en ECS: **Update service** → la imagen nueva. ECS no la toma solo.

## 4. Cognito
1. **Create user pool** → tipo **Single-page application (SPA)** (sin secreto), inicio de sesión con **Email**, registro abierto.
2. **App clients → `nomi-web` → Edit**:
   - Authentication flows: **ALLOW_USER_PASSWORD_AUTH**
   - ID token: 60 min · Refresh token: 5 días
3. Copia el **Client ID** a `src/frontend/js/config.js`.

## 5. API Gateway `nomi`
1. **Create API → REST API** → `nomi` → Regional.
2. **Create resource** → Proxy resource `{proxy+}`.
3. **ANY** → integración **HTTP proxy** → `https://<url-de-ecs>/{proxy}`.
4. **Authorizers → Create** → tipo Cognito, tu User Pool, token source `Authorization`.
5. **ANY → Method request → Authorization:** el authorizer.
6. **Create method OPTIONS** en `/{proxy+}`: HTTP proxy a la misma URL, **sin** authorizer (preflight de CORS).
7. **Gateway responses → Default 4XX:** headers `Access-Control-Allow-Origin` y `Access-Control-Allow-Headers` con valor `'*'`.
8. **Deploy API** → stage `dev`. Copia el Invoke URL a `config.js` (`API_URL`).

Cada cambio en API Gateway necesita otro **Deploy API**.

## 6. Página (`nomi-page-2026`)
1. **Permissions:** *Block public access* apagado y bucket policy con `s3:GetObject` público.
2. **Static website hosting:** índice `index.html`, error `error.html`.
3. Desde la carpeta `nomi`:
   ```
   aws s3 sync src/frontend s3://nomi-page-2026 --delete
   ```
4. Abrir `https://nomi-page-2026.s3.us-east-1.amazonaws.com/index.html` (el endpoint de sitio web solo da HTTP; CloudFront no está disponible en el lab).

## 7. Fotos del refri (Lambdas en Python)
Código en `src/lambdas/`. Las 3 con runtime **Python 3.12** y rol **`LabRole`**.

| Lambda | Variables | Timeout | Se activa con |
|---|---|---|---|
| `subir_foto` | `BUCKET=nomi-photos` | 10 s | `POST /photos` |
| `ver_fotos` | `BUCKET=nomi-photos` | 10 s | `GET /photos` |
| `procesar_foto` | — | 30 s | Trigger de S3 |

1. **Create function** para cada una, pega su `lambda_function.py` y **Deploy**.
2. **`procesar_foto` → Add trigger → S3:** bucket `nomi-photos`, evento *All object create events*, prefijo `escaneos/`, sufijo `.jpg`.
3. **API Gateway `nomi` → Create resource** `/photos`:
   - `POST` → Lambda proxy → `subir_foto`, Authorization: el authorizer de Cognito.
   - `GET` → Lambda proxy → `ver_fotos`, Authorization: el authorizer de Cognito.
   - **Enable CORS** en `/photos` (crea el `OPTIONS`).
   - **Deploy API** → `dev`.
4. **CORS del bucket `nomi-photos`** (Permissions → CORS), para que la página pueda hacer el `PUT`:
   ```json
   [{ "AllowedOrigins": ["*"], "AllowedMethods": ["PUT", "GET"], "AllowedHeaders": ["*"] }]
   ```
