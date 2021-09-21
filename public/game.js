let socket = io();

function renderPlayer(playersList){
    let playerBoard = document.getElementById("playerBoard");
    playerBoard.innerHTML = " ";
    playersList.forEach(player => {
        let playerTag = document.createElement('div');
        playerTag.innerHTML= '<span>'+player+'</span>';
        playerTag.classList.add("playerTag")
        playerBoard.append(playerTag)
    });
}

function generateMessage(message,from) {
    let now = Date.now();
    let messageData = {message,from,time: now}
    return messageData;
}

function addMessage(message,self) {
    let chatBox = document.getElementById("chatBox");
    let chat = document.createElement("div")
    if (self) {
        chat.innerHTML= '<span>'+'Me: '+message.message+'</span>';
    }else{
        chat.innerHTML= '<span>'+message.from+': '+message.message+'</span>';
    }
    chatBox.append(chat);
}

function sendMessage() {
    let input = document.getElementById("chat");
    addMessage(generateMessage(input.value,"me"),true);
    socket.emit("sendMessage",input.value);
    input.value = " ";
}

function Enter(event) {
    if (event.key == "Enter") {
        sendMessage();
    }
}

socket.on("connect",()=>{
    let params = new URLSearchParams(document.location.search.substring(1));
    let name = params.get("name");
    let room = params.get("room");
    socket.emit("join",{name,room},(err)=>{
        alert(err)
    })
})

socket.on("join",(playersList)=>{
    renderPlayer(playersList);
})

socket.on("left",(playersList)=>{
    renderPlayer(playersList);
})

socket.on("receiveMessage",(messageData)=>{
    addMessage(messageData);
})