# Imagen base: Node 20 en Alpine (desde la galería pública de ECR)
FROM public.ecr.aws/docker/library/node:20-alpine

# Datos que se pasan al construir: docker build --build-arg APP_VERSION=1.0 ...
ARG APP_VERSION=1.0
ARG ALUMNO=sin-nombre

# Hora de México para las fechas y la semana del menú
RUN apk add --no-cache tzdata
ENV TZ=America/Mexico_City
ENV PORT=3001

WORKDIR /app

# Primero las dependencias (Docker las reutiliza si solo cambia el código)
COPY --chown=node:node package.json ./
RUN npm install --omit=dev

# Todo el código del backend: main.js, routes, controllers, data y utils
COPY --chown=node:node . .

# Archivo con la versión, generado durante la construcción
RUN echo "{\"version\":\"${APP_VERSION}\",\"alumno\":\"${ALUMNO}\",\"fecha\":\"$(date -u +%Y-%m-%dT%H:%MZ)\"}" \
      > /app/version.json \
 && chown node:node /app/version.json

# Corre sin privilegios de root (el usuario node ya viene en la imagen)
USER node

EXPOSE 3001

# Docker revisa cada 30 s que la API responda (GET / regresa { ok: true })
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:${PORT}/ || exit 1

CMD ["node", "main.js"]
