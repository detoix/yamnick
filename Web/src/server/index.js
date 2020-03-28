const express = require('express');
const http = require("http");
const socketIo = require("socket.io");
var amqp = require('amqplib/callback_api');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

amqp.connect(process.env.AMQP, function(error0, connection) {
    if (error0) {
        throw error0;
    }
    
    io.on("connection", socket => {
        console.log("New client connected");
        
        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1;
            }

            channel.assertQueue('', { exclusive: true }, function(error2, q) {
                if (error2) {
                  throw error2;
                }

                socket.on("query_issued", (data) => {
                    console.log("Server received query of", data)
                    channel.sendToQueue('ClientCommands', Buffer.from(data), { replyTo: q.queue });
                });

                channel.consume(q.queue, function(msg) {
                    let message = msg.content.toString()
                    console.log("Server received response of length:", message.length);
                    socket.broadcast.emit("event", "something happend")
                    socket.emit("response_received", message)
                }, { noAck: true });
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