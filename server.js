// require module
const socket = require("socket.io");
const http = require("http");
const path = require("path");
const express = require("express");
const socketIO = require("socket.io");
const {Rooms} = require("./modules/room.js");
const { MongoClient } = require('mongodb');
const { time } = require("console");
//-----------------------------------------------------------------------------------
const port = process.env.PORT || 3000;
//-----------------------------------------------------------------------------------
// create server và bắt đầu kết nối socket.io
const app = express();
app.set("view engine", "ejs");
const server = http.createServer(app);
const io = socketIO(server);

const uri = "mongodb+srv://kaigagi:Quan12345@cluster0.0q0cp.mongodb.net/WordPool?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
server.listen(port)

//handle các request để lấy file css và scipts
app.use(express.static('public'));
app.use(express.urlencoded({extend: true}));
//-----------------------------------------------------------------------------------
// handle socket.io connection
let rooms = new Rooms();
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

function checkHost(room) {
    let roomMembers = players.getPlayersListWithId(room)
    let host =false;
    roomMembers.forEach(player => {
        if (player.host) {
            host = true;
        }
    });
    return host;
}

io.on("connection",(socket)=>{
    socket.on('join',(params,callback)=>{
        if (!rooms.searchRoom(params.room)) {
            rooms.addRoom(params.room)
        }
        let room = rooms.searchRoom(params.room)
        let newPlayer = room.players.addPlayer(socket.id,params.name)
        if (!room.host) {
            room.host = newPlayer;
        }
        socket.join(params.room)
        io.to(params.room).emit("join",room.players.players);
    })
    socket.on("checkHost",()=>{
        let player = rooms.searchPlayerById(socket.id);
        let room = rooms.memberOfRoom(socket.id);
        if (room.host == player) {
            io.to(player.id).emit("host");
        }    
    })
    socket.on("drawSendToServer",(data)=>{
        socket.broadcast.emit("draw",data)
    })
    socket.on("sendMessage",(message)=>{
        let fromPlayer = rooms.searchPlayerById(socket.id);
        let room = rooms.memberOfRoom(socket.id);
        let messageData = generateMessage(message,fromPlayer.name)
        socket.to(room.name).emit("receiveMessage",messageData);
    })

    // socket.on("startTurn",(drawer,randomWords)=>{
    //     io.to(drawer.id).emit("startTurn",randomWords);
    // })

    socket.on("hasChoseAWord",(word)=>{
        let player = rooms.searchPlayerById(socket.id);
        let room = rooms.memberOfRoom(socket.id);
        room.onGame = true;
        room.currentWord = word;
        socket.broadcast.to(room.name).emit("hasChoseAWord",word)
        let timeLimit = 180000;
        io.to(room.name).emit("timerStart",timeLimit)
        room.startTimer(timeLimit);
        setTimeout(()=>{
            if (room.onGame) {
                io.to(room.name).emit("endTurn",room.name)
                let drawer = room.randomTurn();
                let randomWords = room.randomWord();
                io.to(drawer.id).emit("startTurn",randomWords);
            }
        },timeLimit)
    })

    socket.on("answer",(answer)=>{
        let player = rooms.searchPlayerById(socket.id);
        let room = rooms.memberOfRoom(socket.id);
        if (room.onGame==true && player != room.drawer) {
            if (answer == room.currentWord) {
                let score = room.scoreCalculate();
                player.score = Math.round(score);
                io.to(room.name).emit("youWin",room.players.players);
                room.hasNotAnswer = room.hasNotAnswer.filter((temp)=>temp!=player)
                if (room.hasNotAnswer.length==1) {
                    io.to(room.name).emit("endTurn");
                    room.hasNotAnswer = room.players.players;
                    if (room.hasNotDraw.length ==0) {
                        room.onGame = false;
                        io.to(room.name).emit("endGame",room.name);
                        return;
                    }
                    let drawer = room.randomTurn();
                    let randomWords = room.randomWord();
                    io.to(drawer.id).emit("startTurn",randomWords);
                }
            }
        }
    })

    // socket.on("answer",(answer)=>{
    //     let player = players.getPlayerById(socket.id)
    //     let host = players.getHost(player.room)
    //     io.to(host.id).emit("verifyAnswer",answer,player)
    // })

    // socket.on("updateScore",(player)=>{
    //     let score = player.score;
    //     player = players.getPlayerById(player.id)
    //     player.score = score;
    //     socket.emit("youWin",players.getScore(player.room));
    // })

    socket.on("startGame",(onGame)=>{
        let player = rooms.searchPlayerById(socket.id);
        let room = rooms.memberOfRoom(socket.id);
        if(room.wordPool.length == 0)
        {
            let randomWordPool = Math.round(Math.random()+1).toString()
            client.connect(err => {
                const collection = client.db("WordPool").collection("wordlists");
                collection.findOne({_id:randomWordPool}).then((result)=>{
                    room.wordPool = result.wordList;
                    room.hasNotAnswer = room.players.players;
                    if(room.hasNotDraw.length==0&&!room.onGame){
                        room.hasNotDraw = room.players.players;
                    }
                    room.onGame = onGame;
                    let drawer = room.randomTurn();
                    let randomWords = room.randomWord();
                    io.to(drawer.id).emit("startTurn",randomWords);
                })
            });
        }
    })
    socket.on("disconnect",()=>{
        let room = rooms.memberOfRoom(socket.id);
        setTimeout(() => {
            let player = rooms.removePlayer(socket.id);
            if (room.players.players.length == 0) {
                setTimeout(() => {
                    rooms.removeRoom(room.name)
                },600000 );
            }
            else if(room.host == player)
            {
                room.updateHost(room.players.players[0])
                io.to(room.host.id).emit("host");
            }
            io.to(room.name).emit("left",room.players.players);
        }, 5000);
    })
})

//handle some routes
app.get("/",(req,res)=>{
    res.sendFile("login.html",{root: __dirname})
})

app.get("/play",(req,res)=>{
    res.sendFile("index.html",{root: __dirname})
})

// app.use(express.urlencoded());

app.get("/rank/:room",(req,res)=>{
    // express.urlencoded()
    let roomName = req.params.room;
    let room = rooms.searchRoom(roomName);
    let Top3 = room.getTop3(room.name);
    res.render("rank",{
        rank1: Top3.players[0],
        rank2: Top3.players[1],
        rank3: Top3.players[2]
    });
})
