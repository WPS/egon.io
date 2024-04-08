# Build stage
FROM node:18-alpine AS build-stage
WORKDIR /app

COPY . .
RUN npm ci

RUN npm run bundle


# Runtime stage
FROM nginx:1.22-alpine
COPY --from=build-stage /app/dist_build/egon /usr/share/nginx/html

EXPOSE 80
