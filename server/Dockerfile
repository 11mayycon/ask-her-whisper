# Estágio de build
FROM node:18-alpine AS build
WORKDIR /app

# Instalar dependências de build para sqlite3
RUN apk add --no-cache python3 make g++

# Copiar package files
COPY package*.json ./
RUN npm install

# Copiar código fonte
COPY . .

# Compilar TypeScript
RUN npm run build

# Estágio de produção
FROM node:18-alpine
WORKDIR /app

# Instalar dependências de runtime para sqlite3
RUN apk add --no-cache python3 make g++

# Copiar apenas o necessário
COPY package*.json ./
RUN npm install --only=production

COPY --from=build /app/dist ./dist
COPY .env .env

# Criar diretório para o banco de dados SQLite
RUN mkdir -p /app/data

EXPOSE 3001

CMD ["npm", "start"]
