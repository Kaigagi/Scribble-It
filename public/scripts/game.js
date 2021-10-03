let socket = io();
let host = false;
let onGame = false;
let startButton = document.getElementById("start");
let modal = document.getElementById("myModal")
let wordPoolHost;
let roomMembersHost;
let chosenWord;
let startTime;
let timeLimit;

function renderPlayer(playersList){
    let playerBoard = document.getElementById("playerBoard");
    playerBoard.innerHTML = " ";
    let count = 0;
    playersList.forEach(player => {
        let playerTag = document.createElement('div');
        let score = document.createElement("span")
        playerTag.innerHTML= '<span>'+player+'</span>';
        playerTag.classList.add("playerTag")
        score.id = count++;
        playerTag.append(score);
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
        chat.innerHTML= '<span style="float: right">'+'Me: '+message.message+'</span>';
    }else{
        chat.innerHTML= '<span>'+message.from+': '+message.message+'</span>';
    }
    chatBox.append(chat);
}

function sendMessage() {
    let input = document.getElementById("chat");
    addMessage(generateMessage(input.value,"me"),true);
    socket.emit("sendMessage",input.value);
    if (onGame&&!turn) {
        socket.emit("answer",input.value)
    }
    input.value = "";
}

function Enter(event) {
    if (event.key == "Enter") {
        sendMessage();
    }
}

function StartGame() {
    socket.emit("startGame");
    startButton.disabled = true;
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

socket.on("host",()=>{
    host = true;
    startButton.disabled = false;
})

function closeModal(params) {
    modal.style.display = "none";
}

function convertToAnonymous(word) {
    let afterConvert = word.replace(/\s/g,'  ')
    afterConvert = afterConvert.replace(/[a-z]/g, "_ ");
    afterConvert = afterConvert.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "_ ");
    afterConvert = afterConvert.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "_ ");
    afterConvert = afterConvert.replace(/ì|í|ị|ỉ|ĩ/g, "_ ");
    afterConvert = afterConvert.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "_ ");
    afterConvert = afterConvert.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "_ ");
    afterConvert = afterConvert.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "_ ");
    afterConvert = afterConvert.replace(/đ/g, "_ ");
    return afterConvert;
}

function chooseWord(event) {
    closeModal()
    let word = event.target.innerHTML;
    socket.emit('hasChoseAWord',word)
    let wordDisplay = document.getElementById("wordDisplay")
    let pre = document.createElement("pre")
    pre.innerHTML = word
    wordDisplay.classList.add("wordDisplay");
    wordDisplay.append(pre);
}

socket.on("startTurn",(randomWords)=>{
    let modalContent = document.getElementById("modal-content");
    modal.style.display = "block";
    turn = true;
    for (let index = 0; index < randomWords.length; index++) {
        const word = randomWords[index];
        let wordChoice = document.createElement("span")
        wordChoice.innerHTML = word;
        wordChoice.onclick = chooseWord;
        wordChoice.classList.add('chooseWord');
        modalContent.append (wordChoice);
    }
})

socket.on("hasChoseAWord",(word)=>{
    if (host) {
        chosenWord = word;
    }
    word = convertToAnonymous(word);
    let wordDisplay = document.getElementById("wordDisplay")
    let pre = document.createElement("pre")
    pre.innerHTML = word
    wordDisplay.classList.add("wordDisplay");
    wordDisplay.append(pre);
})

socket.on("timerStart",(time)=>{
    onGame = true;
    startTime = Date.now();
    timeLimit = time;
    let timer = document.getElementById("time")
    timer.classList.add("startTimer");
})

socket.on("youWin",(playersScore)=>{
    let count = 0;
    console.log(1)
    playersScore.forEach(playerScore => {
        let score = document.getElementById(count++);
        score.innerHTML = playerScore;
    });
})

function getRandomWords(wordPool) {
    let random = Math.round(Math.random()*(wordPool.length-1))
    return wordPool[random];
}

socket.on("startALoop",(wordPool,roomMembers)=>{
    wordPoolHost = wordPool;
    roomMembersHost = roomMembers;
    let turn = Math.round(Math.random()*(roomMembers.length-1));
    let drawer = roomMembersHost[turn];
    roomMembersHost.filter((member)=> member===turn);
    let randomWords = [];
    while (randomWords.length<3) {
        let randomWord = getRandomWords(wordPool);
        randomWords.push(randomWord);
        wordPool.filter((word)=> word!== randomWord);
    }
    socket.emit("startTurn",drawer,randomWords)
})

socket.on("verifyAnswer",(answer,player)=>{
    console.log(chosenWord);
    console.log(answer)
    if (answer == chosenWord) {
        console.log(player);
        let now = Date.now();
        let time = now - startTime;
        let score = (timeLimit/time)*20;
        player.score += score;
        socket.emit("updateScore",player);
    }
})



