# Build stage
FROM node:16-alpine AS build-stage
WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm ci

COPY . .

RUN npm run bundle


# Runtime stage
FROM nginx:1.22-alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
