// require module
const socket = require("socket.io");
const http = require("http");
const path = require("path");
const express = require("express");
const socketIO = require("socket.io");
const {Players} = require("./modules/players");
const { MongoClient } = require('mongodb');
const { time } = require("console");
//-----------------------------------------------------------------------------------
const port = process.env.port || 3000;
//-----------------------------------------------------------------------------------
// create server và bắt đầu kết nối socket.io
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const uri = "mongodb+srv://kaigagi:Quan12345@cluster0.0q0cp.mongodb.net/WordPool?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
server.listen(port)

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
        let newPlayer = players.addPlayer(socket.id,params.name,params.room)
        if (!checkHost(newPlayer.room)) {
            newPlayer.host = true;
            socket.emit("host");
        }
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

    function getRandomWords(wordPool) {
        let random = Math.round(Math.random()*(wordPool.length-1))
        return wordPool[random];
    }

    function startATurn(roomMenbers,wordPool) {
        let turn = Math.round(Math.random()*(roomMenbers.length-1));
        let drawer = roomMenbers[turn];
        let randomWords = [];
        while (randomWords.length<3) {
            let randomWord = getRandomWords(wordPool);
            randomWords.push(randomWord);
            wordPool.filter((word)=> word!== randomWord);
        }
        io.to(drawer.id).emit("startTurn",randomWords)
    }

    socket.on("hasChoseAWord",(word)=>{
        let room = players.getPlayerById(socket.id).room
        socket.broadcast.to(room).emit("hasChoseAWord",word)
        let timeLimit = 180000
        let startTime = Date.now();
        io.to(room).emit("timerStart",timeLimit)
        socket.on("answer",(answer)=>{
            console.log(2)
            if (answer == word) {
                console.log(1);
                let player = players.getPlayerById(socket.id)
                let now = Date.now();
                let time = now - startTime;
                let score = (timeLimit/time)*20;
                player.score += score;
                socket.emit("youWin",players.getScore(player.room));
            }
        })
        setTimeout(()=>{
            io.to(room).emit("endTurn")
        },timeLimit)
    })

    socket.on("startGame",()=>{
        let randomWordPool = Math.round(Math.random()+1).toString()
        let host = players.getPlayerById(socket.id)
        let roomMembers = players.getPlayersListWithId(host.room);
        let wordPool;
        client.connect(err => {
            const collection = client.db("WordPool").collection("wordlists");
            collection.findOne({_id:randomWordPool}).then((result)=>{
                wordPool = result.wordList;
                startATurn(roomMembers,wordPool);
            })
        });
    })
    socket.on("disconnect",()=>{
        let player = players.removePlayer(socket.id);
        if(player.host == true)
        {
            if (checkHost(player.room)) {
                return;
            }
            let roomMembers = players.getPlayersListWithId(player.room)
            if (roomMembers.length!=0) {
                roomMembers[0].host = true;
                io.to(roomMembers[0].id).emit("host");
            } 
        }
        io.to(player.room).emit("left",players.getPlayersList(player.room));
    })
})

//handle some routes
app.get("/",(req,res)=>{
    res.sendFile("test.html",{root: __dirname})
})

app.get("/play",(req,res)=>{
    res.sendFile("index.html",{root: __dirname})
})