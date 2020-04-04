const express = require('express');
const http = require("http");
const socketIo = require("socket.io");
const socketioJwt   = require('socketio-jwt');
const amqp = require('amqplib/callback_api');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

amqp.connect(process.env.AMQP, function(error0, connection) {
    if (error0) {
        throw error0;
    }

    io.on('connection', socketioJwt.authorize({
        secret: process.env.AUTH0_CLIENT_SECRET,
        timeout: 5000 // 5 seconds to send the authentication message
    }))
    .on("authenticated", socket => {
        console.log("New client connected as", socket.decoded_token.sub);
        
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
                    socket.emit("response_received", message)
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
                console.log("Client disconnected")
            });
        });
    });
});

const port = process.env.PORT || 8080;
app.use(express.static('dist'));
server.listen(port, () => console.log(`Listening on port ${port}`));