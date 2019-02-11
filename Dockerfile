FROM node:8.1.2-alpine

USER root
ENV NODE_ENV development

RUN apk add --no-cache --virtual .persistent-deps curl openssl make gcc g++ python py-pip git

RUN mkdir -p /app
RUN chown node:node /app

USER node
WORKDIR /app

COPY ./package*.json ./
RUN npm i

USER root
ENV NODE_ENV production

COPY . ./

# Required for /bin/env ts-node invocations to work
RUN ln -sf /app/node_modules/.bin/ts-node /usr/local/bin/ts-node

CMD node -r ts-node/register src/market-maker
