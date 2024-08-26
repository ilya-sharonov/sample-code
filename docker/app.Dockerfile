FROM node:20.10.0-alpine3.18 AS dependencies

WORKDIR /app
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
RUN npm install

FROM node:20.10.0-alpine3.18 as build

WORKDIR /app
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
COPY tsconfig-prod.json ./tsconfig-prod.json
COPY --from=dependencies app/node_modules ./node_modules
COPY src ./src
RUN npm run build:prod

FROM node:20.10.0-alpine3.18

# WORKDIR /app
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
COPY --from=build app/build ./
COPY --from=dependencies app/node_modules ./node_modules
CMD ["node", "index.js"]