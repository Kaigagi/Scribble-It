class Players {
    constructor(){
        this.players = []
    }

    addPlayer(id,name,initScore){
        let player = {
            id: id,
            name: name,
            score: initScore
        }
        if (initScore == null) {
            player.score = 0;
        }
        if (this.getPlayerById(id)) {
            return this.getPlayerById(id)
        }
        this.players.push(player);
        return player;
    }

    getScore(){
        let playersScore = this.players.map((player)=>player.score);
        return playersScore;
    }

    getPlayerById(id){
        let player = this.players.filter((player)=> player.id === id)[0];
        return player
    }

    getHost(room){
        let roomMembers = this.getPlayersListWithId(room)
        let player = roomMembers.filter((player)=> player.host === true)[0];
        return player;
    }

    removePlayer(id){
        let player = this.getPlayerById(id)

        if (player) {
            this.players = this.players.filter((player)=> player.id !== id)
            return player;
        }
    }
}

module.exports = {Players};