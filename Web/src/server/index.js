const express = require('express');
const http = require("http");
const socketIo = require("socket.io");
const socketioJwt   = require('socketio-jwt');
const amqp = require('amqplib/callback_api');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const sockets = {}

amqp.connect(process.env.AMQP, function(error0, connection) {
    if (error0) {
        throw error0;
    }

    io.on('connection', socketioJwt.authorize({
        secret: process.env.AUTH0_CLIENT_SECRET,
        timeout: 5000 // 5 seconds to send the authentication message
    }))
    .on('connection', () => console.log('New connection approaches...'))
    .on("authenticated", socket => {
        console.log("New client connected as", socket.decoded_token.sub);
        
        if (socket.decoded_token.sub in sockets) {
            sockets[socket.decoded_token.sub].add(socket)
        } else {
            var set = new Set();
            set.add(socket)
            sockets[socket.decoded_token.sub] = set
        }
        
        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1;
            }

            channel.assertQueue(socket.decoded_token.sub, { exclusive: true }, function(error2, q) {
                if (error2) {
                  throw error2;
                }

                channel.consume(q.queue, function(msg) {
                    let message = msg.content.toString()
                    console.log("Server received response of length:", message.length);
                    for (let s of sockets[socket.decoded_token.sub]) {
                        s.emit("response_received", message)
                        console.log("Message emitted to client")
                    }
                }, { noAck: true });

                socket.on("query_issued", (data) => {
                    console.log("Server received query of", data)
                    channel.sendToQueue('ClientCommands', Buffer.from(data), { replyTo: socket.decoded_token.sub });
                });

                socket.emit("server_ready")
                console.log("Listening for queries...")
            });
            
            socket.on("disconnect", () => 
            {
                channel.close()
                sockets[socket.decoded_token.sub].delete(socket)
                console.log("Client disconnected")
            });
        });
    });
});

const port = process.env.PORT || 8080;
app.use(express.static('dist'));
server.listen(port, () => console.log(`Listening on port ${port}`));