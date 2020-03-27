FROM node:latest AS dependencyBuild
WORKDIR /app
COPY package.json /app
COPY package-lock.json /app
RUN npm install
COPY . /app
RUN npm run bundle

FROM httpd:2.4
COPY --from=dependencyBuild /app/dist /usr/local/apache2/htdocs/
