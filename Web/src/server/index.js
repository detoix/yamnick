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

            socket.on("query", (data)=>{
                console.log("Server received query of", data)
                channel.sendToQueue('ClientCommands', Buffer.from(data));
            });

            channel.consume('ResponsesToClient', function(msg) {
                let message = msg.content.toString()
                console.log("Server received response of length:", message.length);
                socket.emit("response", "Received response of length: " + message.length)
            }, { noAck: true });
            
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