FROM node:8.11-alpine

RUN mkdir server
WORKDIR /server

COPY package.json .

RUN npm install

EXPOSE 8080

# Bundle app source
COPY . .

CMD npm run build && AMQP=$AMQPURL node src/server/index.js