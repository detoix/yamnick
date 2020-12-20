FROM node:13-alpine

RUN npm i npm@latest -g
RUN mkdir server
WORKDIR /server

COPY . .

RUN npm install
RUN npm run build

EXPOSE 8080

CMD AUTH0_CLIENT_SECRET=$AUTH0_CLIENT_SECRET node src/server/index.js