class Room{
    constructor(roomName,members){
        this.name = roomName;
    }

    addPlayer(player){
        this.members.push(player)
    }

    createHost(player){
        if (this.members.length==0) {
            this.host = player
        }
        return player;
    }

    randomTurn(){
        let turn = Math.random()*(this.members.length-1);
        this.turn = this.members[turn];
        return this.members[turn];
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
        this.rooms.forEach(room => {
            if (room.name == roomName) {
                return room;
            }
            return false;
        });
    }

    addPlayer(player,roomName){
        let room = this.searchRoom(roomName)
        if (room) {
            room.addPlayer(player);
        }
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