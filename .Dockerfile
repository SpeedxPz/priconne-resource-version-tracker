FROM node:16.10-alpine3.13 as builder

# Init
RUN apk add --no-cache --virtual .gyp python3 make g++ bash
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install -g npm@latest
RUN npm install --no-cache

# Build
COPY . .
RUN npm run build

# Cleanup
RUN npm prune --production
RUN rm -rf ./false
RUN rm -rf ./node_modules/node-rdkafka/.vscode
# RUN apk del .gyp python make g++ bash

FROM node:16.10-alpine3.13

WORKDIR /usr/src/app
# RUN apk add --no-cache gcompat
COPY --from=builder /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=builder /usr/src/app/build /usr/src/app/build
# Startup
CMD [ "node", "./build/index.js" ]