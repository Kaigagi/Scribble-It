// require module
const socket = require("socket.io");
const http = require("http");
const path = require("path");
const express = require("express");
const socketIO = require("socket.io");
//-----------------------------------------------------------------------------------
const port = process.env.port || 3000;
//-----------------------------------------------------------------------------------
// create server và bắt đầu kết nối socket.io
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
server.listen(port);
//handle các request để lấy file css và scipts
app.use(express.static('public'));
//-----------------------------------------------------------------------------------
// handle socket.io connection
let players = [];
io.on("connection",(socket)=>{
    
})

//handle some routes
app.get("/",(req,res)=>{
    res.sendFile("index.html",{root: __dirname})
})