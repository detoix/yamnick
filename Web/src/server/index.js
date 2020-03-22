const express = require('express');
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", socket => {
    console.log("New client connected");

    socket.on("query", (data)=>{
        console.log("Server received query of", data)
        //Here we broadcast it out to all other sockets EXCLUDING the socket which sent us the data
        socket.emit("response", {num: data});
    });

    //A special namespace "disconnect" for when a client disconnects
    socket.on("disconnect", () => console.log("Client disconnected"));
});

const port = process.env.PORT || 8080;
app.use(express.static('dist'));
server.listen(port, () => console.log(`Listening on port ${port}`));