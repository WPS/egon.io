# Build stage
FROM node:24-alpine AS build-stage
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build-prod


# Runtime stage
FROM cgr.dev/chainguard/nginx:latest
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /app/dist_build/egon /usr/share/nginx/html

EXPOSE 8080
