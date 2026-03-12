# Build stage
FROM node:24-alpine AS build-stage
WORKDIR /app

COPY . .
RUN npm ci

RUN npm run build-prod


# Runtime stage
FROM nginx:1.29-alpine
COPY --from=build-stage /app/dist_build/egon /usr/share/nginx/html

EXPOSE 80
