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
app.use(express.urlencoded({extend: true}));
//-----------------------------------------------------------------------------------
// handle socket.io connection
let players = [];
let host ;
function checkValidName(nickname) {
    for (let index = 0; index < players.length; index++) {
        if (nickname == players[index]) {
            return false
        }
        else
        {
            return true
        }
    }
}

io.on("connection",(socket)=>{
    console.log("a player joined")
    io.on("joinRoom",(nickname)=>{
        let nickname = req.body.nickname;
        if (checkValidName(nickname)) {
            players.push(nickname);
        }
        host = players[0];
        socket.broadcast.emit("newPlayer",nickname)
    })
    io.on("startGame",(from)=>{
        if (from != players[0]) {
            return;
        }
        let timeStart = Date.now();
        while (true) {
            let now = Date.now();
            if ((now - timeStart)>180000) {
                break;
            }
        }
    })
})

//handle some routes
app.get("/",(req,res)=>{
    res.sendFile("index.html",{root: __dirname})
})

// app.get("/join-game",(req,res)=>{

//     res.sendFile("gameRoom.html",{root: __dirname})
// })