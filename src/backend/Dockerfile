# Node 20 (imagen ligera)
FROM public.ecr.aws/docker/library/node:20-alpine

# Se pasan con --build-arg
ARG APP_VERSION=1.0
ARG ALUMNO=EARM

# Hora de México
RUN apk add --no-cache tzdata
ENV TZ=America/Mexico_City
ENV PORT=3001

WORKDIR /app

# Primero las dependencias para que Docker las guarde en caché
COPY --chown=node:node package.json ./
RUN npm install --omit=dev

# El código
COPY --chown=node:node . .

# Versión, alumno y fecha de la imagen
RUN echo "{\"version\":\"${APP_VERSION}\",\"alumno\":\"${ALUMNO}\",\"fecha\":\"$(date -u +%Y-%m-%dT%H:%MZ)\"}" \
      > /app/version.json \
 && chown node:node /app/version.json

# Sin root
USER node

EXPOSE 3001

# Revisa cada 30 s que la API responda
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:${PORT}/ || exit 1

CMD ["node", "main.js"]
