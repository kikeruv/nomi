FROM node:20-alpine

# Hora de México para las fechas y la semana del menú
RUN apk add --no-cache tzdata
ENV TZ=America/Mexico_City

WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["node", "main.js"]
