// require module
const socket = require("socket.io");
const http = require("http");
const path = require("path");
const express = require("express");
const socketIO = require("socket.io");
const {Players} = require("./modules/players");
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
let players = new Players();
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
function generateMessage(message,from) {
    let now = Date.now();
    let messageData = {message,from,time: now}
    return messageData;
}

io.on("connection",(socket)=>{
    socket.on('join',(params,callback)=>{
        players.addPlayer(socket.id,params.name,params.room)
        socket.join(params.room)
        io.to(params.room).emit("join",players.getPlayersList(params.room));
    })
    socket.on("drawSendToServer",(data)=>{
        socket.broadcast.emit("draw",data)
    })
    socket.on("sendMessage",(message)=>{
        let fromPlayer = players.getPlayerById(socket.id)
        let messageData = generateMessage(message,fromPlayer.name)
        socket.to(fromPlayer.room).emit("receiveMessage",messageData);
    })
    socket.on("startGame",(from)=>{
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
    socket.on("disconnect",()=>{
        let player = players.removePlayer(socket.id);
        io.to(player.room).emit("left",players.getPlayersList(player.room));
    })
})

//handle some routes
app.get("/",(req,res)=>{
    res.sendFile("login.html",{root: __dirname})
})

app.get("/play",(req,res)=>{
    res.sendFile("index.html",{root: __dirname})
})