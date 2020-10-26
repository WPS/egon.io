# Build stage
FROM trion/ng-cli-karma AS builder
LABEL maintainer="nicklas@wiegandt.eu,thesasch_github@wiegandt.net"
USER 1000
WORKDIR /tmp
# copy app files
COPY . .
# install node packages
RUN npm install && \
#build package
    npm run all

FROM nginx:stable-alpine
LABEL maintainer="nicklas@wiegandt.eu,thesasch_github@wiegandt.net"
COPY --from=builder --chown=101:101 /tmp/dist /usr/share/nginx/html