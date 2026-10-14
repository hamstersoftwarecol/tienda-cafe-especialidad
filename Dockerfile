# Dockerfile optimizado para producción con SQLite
FROM node:24-alpine AS base

# Dependencias para compilar better-sqlite3 si es necesario
RUN apk add --no-cache python3 make g++ sqlite

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Crear volumen persistente para la base de datos SQLite
VOLUME ["/app/data"]
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
