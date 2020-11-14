const express = require('express');
const http = require("http");
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 8080;
app.use(express.static('dist'));
server.listen(port, () => console.log(`Listening on port ${port}`)); 