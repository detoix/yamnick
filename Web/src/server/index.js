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

    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }

        io.on("connection", socket => {
            console.log("New client connected");
        
            socket.on("query", (data)=>{
                console.log("Server received query of", data)
                channel.sendToQueue('ClientCommands', Buffer.from(data));
            });

            channel.consume('ResponsesToClient', function(msg) {
                let message = msg.content.toString()
                console.log("Server received response of", message);
                socket.emit("response", message);
            }, { noAck: true });
        
            //A special namespace "disconnect" for when a client disconnects
            socket.on("disconnect", () => console.log("Client disconnected"));
        });
    });
});

const port = process.env.PORT || 8080;
app.use(express.static('dist'));
server.listen(port, () => console.log(`Listening on port ${port}`));