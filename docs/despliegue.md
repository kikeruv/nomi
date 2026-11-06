# Despliegue en el Learner Lab

Orden recomendado. Región: `us-east-1`.

## 0. Credenciales (solo para tu compu)
1. **Start Lab** y espera el círculo verde.
2. **AWS Details → AWS CLI → Show** y copia el bloque completo (con `aws_session_token`) a `C:\Users\<tu-usuario>\.aws\credentials`.
3. Cada sesión nueva del lab cambia las credenciales: hay que volver a copiarlas.

Los visitantes de la página no necesitan credenciales: la EC2 usa `LabInstanceProfile`.

## 1. DynamoDB
```
cd src/scripts
python crear_tablas.py
python cargar_datos.py
```
- Crea `usuarios`, `escaneos`, `menus` y `recetario` (con el GSI `CategoriaIndex`). Se salta las que ya existen.
- Carga 2 usuarios, un escaneo por usuario, 9 recetas y el menú de la semana `2026-W45`.

## 2. S3 de imágenes (`nomi-photos`, privado)
Sube las fotos de las recetas con el nombre exacto de su id:
```
recetas/r1.jpg … recetas/r9.jpg
```
Si las fotos son `.webp`, revisa que no queden como `r1.jpg.webp` (activa en Windows **Ver → Extensiones de nombre de archivo**).

## 3. EC2 con el backend
### Crear la instancia
| Campo | Valor |
|---|---|
| Name | `nomi-api` |
| AMI | Amazon Linux 2023 |
| Tipo | `t3.micro` |
| Key pair | `vockey` |
| Auto-assign public IP | Enable |
| Security group `nomi-api-sg` | SSH 22 y Custom TCP **3001** desde `0.0.0.0/0` |
| IAM instance profile | `LabInstanceProfile` |

### Elastic IP
**EC2 → Elastic IPs → Allocate → Associate** con `nomi-api`. IP actual: `32.198.178.239`. Así la IP no cambia al reiniciar el lab.

### Instalar Docker
En **Connect → EC2 Instance Connect**:
```
sudo dnf install -y docker
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
exit
```
Volver a conectarse.

### Copiar el backend
Opción usada: pegar en la terminal los comandos `cat > archivo <<'FIN' … FIN` que crean cada archivo en `~/backend`. También se puede con `git clone` (pide un token de GitHub) o pasando la carpeta por S3:
```
# en tu compu
aws s3 cp src/backend s3://nomi-photos/backend/ --recursive --exclude "node_modules/*"
# en la EC2
aws s3 cp s3://nomi-photos/backend/ ~/backend --recursive
```

`~/backend/.env` en la EC2:
```
PORT=3001
AWS_REGION=us-east-1
TZ=America/Mexico_City
BUCKET_IMAGENES=nomi-photos
```

### Correr el contenedor
```
cd ~/backend
docker build -t nomi-api .
docker run -d --name nomi-api --restart always -p 3001:3001 --env-file .env nomi-api
docker logs nomi-api        # debe decir "API corriendo en http://localhost:3001"
```
Probar en el navegador: `http://32.198.178.239:3001/recetas`.

### Actualizar el backend
```
docker rm -f nomi-api
docker build -t nomi-api .
docker run -d --name nomi-api --restart always -p 3001:3001 --env-file .env nomi-api
```

## 4. API de fotos (Alan)
Ya existe: `https://lnkiuphyxj.execute-api.us-east-1.amazonaws.com/dev/photos`. Para que la página la pueda usar desde S3:
- Su API Gateway con CORS (`*`, `GET, POST, OPTIONS`).
- Su bucket de fotos con CORS:
  ```json
  [ { "AllowedOrigins": ["*"], "AllowedMethods": ["PUT", "GET"], "AllowedHeaders": ["*"] } ]
  ```

## 5. Página en S3 (`nomi-page-2026`)
1. Revisa `src/frontend/js/config.js` (`API_URL` y `API_REFRI_URL`).
2. Desde la carpeta `nomi`:
   ```
   aws s3 rm s3://nomi-page-2026 --recursive
   aws s3 cp src/frontend s3://nomi-page-2026 --recursive
   ```
3. **Properties → Static website hosting**: índice `index.html`, error `error.html`.
4. **Permissions**: *Block public access* apagado y bucket policy con `s3:GetObject` público.
5. Abrir el *Bucket website endpoint* y recargar con **Ctrl + Shift + R**.