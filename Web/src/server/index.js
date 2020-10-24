const express = require('express');
const http = require("http");
const socketIo = require("socket.io");
const socketioJwt = require('socketio-jwt');
const amqp = require('amqplib/callback_api');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const sockets = new Set()

const openConnectionBetween = (socket, channel) => {
    console.log("New client connected as", socket.decoded_token.sub);
    sockets.add(socket)
    
    socket.on("request_issued", (data) => {
        console.log("Server forwarding request of", data)
        channel.sendToQueue('app_mailbox', Buffer.from(data), { replyTo: "web_mailbox" })
    });

    socket.on("disconnect", () => 
    {
        sockets.delete(socket)
        console.log("Client disconnected")
    });
    
    socket.emit("server_ready")
    console.log("Listening for queries...")
}

amqp.connect(process.env.AMQP, function(error0, amqpConnection) {
    if (error0) {
        throw error0;
    }

    amqpConnection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }

        channel.assertQueue("web_mailbox", { exclusive: true }, function(error2, q) {
            if (error2) {
                throw error2;
            }

            channel.consume(q.queue, function(msg) {
                let message = msg.content.toString()
                console.log("Server received response of length:", message.length);
                for (let s of sockets) {
                    s.emit("diagram_persisted", message)
                    console.log("Message emitted to client")
                }
            }, { noAck: true });

            // if (process.env.DEV) { //TODO: use when user can create account
            if (true) {
                io.on('connection', socket => {
                    socket.decoded_token = {
                        sub: "dupa1"
                    }
                    openConnectionBetween(socket, channel)
                })
            } else {
                io.on('connection', socketioJwt.authorize({
                    secret: process.env.AUTH0_CLIENT_SECRET,
                    timeout: 5000 // 5 seconds to send the authentication message
                }))
                io.on("authenticated", socket => openConnectionBetween(socket, channel))
            }
        })
    });
});

const port = process.env.PORT || 8080;
app.use(express.static('dist'));
server.listen(port, () => console.log(`Listening on port ${port}`));