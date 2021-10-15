const {Players} = require("./players");
class Room{
    constructor(roomName){
        this.name = roomName;
        this.players = new Players();
        this.host = false;
        this.onGame = false;
        this.drawer;
        this.currentWord;
        this.wordPool = [];
        this.hasNotAnswer = [];
        this.hasNotDraw = [];
        this.time;
    }

    updateHost(player){
        if (player) {
            this.host = player;
            return player;
        }else{
            return false;
        }
    }

    searchPlayerById(id){
        let player = this.players.getPlayerById(id);
        if (player==null) {
            return false;
        }else{
            return player;
        }
    }

    removePlayer(id){
        let player = this.players.removePlayer(id);
        return player;
    }

    randomTurn(){
        let turn = Math.round(Math.random()*(this.hasNotDraw.length-1));
        this.drawer = this.hasNotDraw[turn];
        this.hasNotDraw = this.hasNotDraw.filter((player)=> player != this.drawer);
        return this.drawer;
    }

    randomWord(){
        let randomWords = [];
        for (let i = 0; i < 3; i++) {
            let random = Math.round(Math.random()*(this.wordPool.length-1));
            random = this.wordPool[random];
            // console.log(random);
            // console.log(this.wordPool)
            this.wordPool = this.wordPool.filter((word)=>word!=random)
            randomWords.push(random);
        }
        return randomWords;
    }

    startTimer(time) {
        this.time = time;
        setInterval(()=>{
            this.time -= 1000;
            if (time<=0) {
                clearInterval();
                this.time = 0;
            }
        },1000)
    }

    scoreCalculate(){
        let score;
        score = this.time/1000;
        return score;
    }

    getTop3(){
        let Top3 = new Players();
        let rank = new Players();
        rank.players = this.players.players;
        // console.log(rank)
        let count = 0
        for (let i = 0; i < 3; i++) {
            let max = 0;
            let idTopPlayer;
            let topPlayer;
            rank.players.forEach((player)=>{
                if (player.score>max) {
                    max = player.score;
                    idTopPlayer = player.id
                }
            }) 
            topPlayer = this.searchPlayerById(idTopPlayer);
            if (topPlayer) {
                Top3.addPlayer(topPlayer.id,topPlayer.name,topPlayer.score);
            }
            rank.players = rank.players.filter((player)=>player.id!==topPlayer.id);
        }
        if (Top3.players.length <3) {
            for (let i = 0; i < 3; i++) {
                if (Top3.players[i]==null) {
                    Top3.addPlayer(count++,"None")
                }
            }
        }
        return Top3;
    }
}

class Rooms{
    constructor() {
        this.rooms = []
    }

    addRoom(roomName){
        let newRoom = new Room(roomName)
        this.rooms.push(newRoom);
    }

    searchRoom(roomName){
        let searchingRoom = false;
        this.rooms.forEach(room => {
            if (room.name == roomName) {
                searchingRoom = room;
            }
        });
        return searchingRoom;
    }

    searchPlayerById(id){
        let searchingPlayer; 
        this.rooms.forEach((room)=>{
            let player = room.searchPlayerById(id)
            if (player) {
                searchingPlayer = player;
            }
        })
        if (searchingPlayer==null) {
            return false;
        }
        else{
            return searchingPlayer;
        }
    }

    removePlayer(id){
        let removedPlayer; 
        this.rooms.forEach((room)=>{
            let player = room.removePlayer(id)
            if (player) {
                removedPlayer = player;
            }
        })
        return removedPlayer;
    }

    memberOfRoom(id){
        let searchingRoom;
        let room = this.rooms.forEach((room)=>{
            let player = room.searchPlayerById(id)
            if (player) {
                searchingRoom = room;
            }
        })
        if (searchingRoom==null) {
            return false;
        }
        else{
            return searchingRoom;
        }
    }

    removeRoom(roomName){
        let room = this.searchRoom(roomName);
        this.rooms = this.rooms.filter((room)=>room.name!=roomName)
        return room;
    }
    
    checkEmptyRoom(){
        for (let i = 0; i < this.rooms.length; i++) {
            const room = array[i];
            if (room.members.length==0) {
                for (let j = i; j < this.rooms.length-1; j++) {
                    this.rooms[j] = this.rooms[j+1]
                }
            }
        }
    }
}

module.exports = {Rooms}



