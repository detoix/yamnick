FROM node:8.11-alpine

RUN npm i npm@latest -g
RUN mkdir server
WORKDIR /server

COPY . .

RUN npm install
RUN npm run build

EXPOSE 8080

CMD AMQP=$AMQPURL node src/server/index.js