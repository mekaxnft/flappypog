//--Initial----------------------------------------------------------------------------------------------------------------------------------------//
window.oncontextmenu = (e)=>{e.preventDefault()}
window.onresize = resize;
window.onload = initLoad;

let client = io();
const MIN_DISTANCE = isMobile() ? 250 : 400;
let highscores, browser, ios, android, alertTimeout;

const isIPad = /(iPad)/.test(navigator.userAgent);
const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(navigator.userAgent);

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
function initLoad(){
    let prefix = (Array.prototype.slice
    .call(window.getComputedStyle(document.documentElement, ""))
    .join("") .match(/-(moz|webkit|ms)-/))[1];
            
    let userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if(/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) ios = true;
    if(/android/i.test(userAgent)) android = true;
    if(prefix === "webkit") browser = 0;
    else browser = 1;

    resize();
    loadImages();
    loadMenuEvents();
    startBackgroundLoop();
    document.querySelector(".loadingScreen").style.display = "none";
    document.querySelector("#mainMenu").style.display = "block";
    game.started = false;
    game.over = false;
    if(android || ios) {document.querySelector("#gameInfo").innerHTML = "Tap on screen to Jump";
    document.querySelector("#pauseButton").addEventListener("touchstart", togglePause);
    }

}
function resize(){
    let backgroundCanvas = document.querySelector("#backgroundCanvas");
    backgroundCanvas.height = window.innerHeight;
    backgroundCanvas.width = window.innerWidth;
    // if(ios || android){
    //     backgroundCanvas.height = screen.height;
    //     backgroundCanvas.width = screen.width;
    // }
    	
    let gameCanvas = document.querySelector("#gameCanvas");
    gameCanvas.height = window.innerHeight;
    gameCanvas.width = window.innerWidth;
    // if(ios || android){
    //     gameCanvas.height = screen.height;
    //     gameCanvas.width = screen.width;
    // }

    if(game.started){
        if(gameLoopRunning){
            pausedText.style.display = "block";
            backgroundLoopRunning = false;
            gameLoopRunning = false;
        }
        let ctx = gameCanvas.getContext("2d");

        drawGame(ctx);
        drawClouds();
    }
}
function random(min,max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function loadImages(){
    let pipeHead = new Image(); pipeHead.src = "images/pipe-head.png";
    let pipeBody = new Image(); pipeBody.src = "images/pipe-body.png";
    let pog = new Image(); pog.src = "images/pog.png";
    game.images = [pipeBody,pipeHead];
    player.image = pog;
}
function openAlert(text){
    clearTimeout(alertTimeout);
    let alert = document.querySelector(".alert");
    alert.innerHTML = text;
    if(alert.style.display != "block"){
        alert.style.animation = "fadeIn ease-in-out 0.2s";
        alert.style.display = "block";
        alert.onanimationend = ()=>{
            alert.style.animation = "none";
            alert.onanimationend = null;
        }
    }
    alertTimeout = setTimeout(()=>{
        alert.style.animation = "fadeOut ease-in-out 0.2s";
        alert.onanimationend = ()=>{
            alert.style.animation = "none";
            alert.style.display = "none";
            alert.onanimationend = null;
        }
    },2000);
}

//--Background-------------------------------------------------------------------------------------------------------------------------------------//
let backgroundLoopRunning = false, clouds = [];
function startBackgroundLoop(){
    backgroundLoopRunning = true;
    let currBackTime, prevBackTime;
    window.requestAnimationFrame((currTime)=>{
        currBackTime = currTime;
        prevBackTime = currTime;
        backgroundLoop(currBackTime,prevBackTime);
    });
}

function isTooCloseToOtherClouds(newCloud, minDistance) {
    for (let i = 0; i < clouds.length; i++) {
      let existingCloud = clouds[i];
      let distance = Math.sqrt((existingCloud.x - newCloud.x) ** 2 + (existingCloud.y - newCloud.y) ** 2);
      if (distance < minDistance) {
        return true;
      }
    }
    return false;
}

function backgroundLoop(currTime,prevTime){
    if(backgroundLoopRunning){
        let elapsedTime = currTime - prevTime;
        if(elapsedTime > 16){
            prevTime = currTime;
            if(clouds.length === 0){
                for (let i = 0; i < 4; i++) {
                    let newCloudIndex = random(1, 4);
                    let cloudImage = new Image();
                    cloudImage.src = "images/cloud" + newCloudIndex + ".png";
                  
                    let newCloud = {};
                  
                    // Generate random position for the new cloud
                    do {
                      newCloud.y = random(window.innerHeight - window.innerHeight*0.9, window.innerHeight);
                      newCloud.x = random(0, window.innerWidth);
                    } while (isTooCloseToOtherClouds(newCloud, MIN_DISTANCE));
                  
                    newCloud.s = random(1, 5);
                    newCloud.i = cloudImage;
                    newCloud.angle =  random(0,360);
                    clouds.push(newCloud);
                }
            }
            else{
                for(let i = 0; i < clouds.length; i++){
                    clouds[i].x -= window.innerWidth*0.001*(100+clouds[i].s)/50;
                    if(clouds[i].x < -window.innerWidth*0.3) clouds.splice(i,1);
                }
                if(clouds.length < 4){
                    let newCloudIndex = random(1,4);
                    let cloudImage = new Image();
                    cloudImage.src = "images/cloud"+newCloudIndex+".png";

                    
                    let newCloud = {};
                    newCloud.y = random(window.innerHeight - window.innerHeight*0.9,window.innerHeight);
                    newCloud.x = window.innerWidth;
                    newCloud.s = random(1,5);
                    newCloud.i = cloudImage;
                    newCloud.angle =  random(0,360);
                    clouds.push(newCloud);
                }
            }
            drawClouds();
        }
        window.requestAnimationFrame((currTime)=>{backgroundLoop(currTime,prevTime)});
    }
}


function drawClouds() {
    let backgroundCanvas = document.querySelector("#backgroundCanvas");
    let ctx = backgroundCanvas.getContext("2d");
    ctx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
    
    let cloudWidth = window.innerHeight * 0.15;
    let cloudHeight = cloudWidth;
    
    let tempCanvas = document.createElement("canvas");
    let tempCtx = tempCanvas.getContext("2d");
    tempCanvas.width = cloudWidth * window.devicePixelRatio;
    tempCanvas.height = cloudHeight * window.devicePixelRatio;
    
    for (let i = 0; i < clouds.length; i++) {
      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
  
      ctx.save();
  
      ctx.translate(clouds[i].x + cloudWidth / 2, clouds[i].y + cloudHeight / 2);
      ctx.rotate((clouds[i].angle * Math.PI) / 180);
    //   ctx.rotate(Math.PI / random(1,4));
  
      tempCtx.drawImage(clouds[i].i, 0, 0, tempCanvas.width, tempCanvas.height);
  
      ctx.drawImage(tempCanvas, -cloudWidth / 2, -cloudHeight / 2, cloudWidth, cloudHeight);
  
      ctx.restore();
  
  
      if (clouds[i].x < -cloudWidth) {
        clouds.splice(i, 1);
        i--; // Decrement i to correctly loop through the updated clouds array
      }
    }
  }
  

//--Menu-------------------------------------------------------------------------------------------------------------------------------------------//
function loadMenuEvents(){
    let name = document.querySelector("#name");
    let backN = document.querySelector("#backN");
    let scores = document.querySelector("#scores");
    let confirm = document.querySelector("#confirm");
    let mainMenu = document.querySelector("#mainMenu");
    let nameField = document.querySelector("#nameField");
    let gameWindow = document.querySelector(".gameWindow");
    let gameOverWindow = document.querySelector("#gameOverWindow");

    client.on("highscores-update",(data)=>{highscores = data});
    document.querySelector("#scoreboard").onclick = ()=>{
        client.emit("open-scores-request");
    }
    client.on("open-scores",(highscores)=>{
        mainMenu.style.display = "none";
        scores.style.display = "block";
        displayHighscores(highscores);
    });
    document.querySelector("#backS").onclick = ()=>{
        mainMenu.style.display = "block";
        scores.style.display = "none";
    }

    document.querySelector("#login").onclick = ()=>{
        mainMenu.style.display = "none";
        name.style.display = "block";
    }
    confirm.onclick = ()=>{
        if(!nameField.value) {

        }
        else {
            const isNumber = Number.isInteger(parseFloat(nameField.value));
                player.name = nameField.value;
                gameWindow.style.display = "block";
                mainMenu.style.display = "none";
                name.style.display = "none";
                nameField.value = "";
                // openAlert("Logged in as "+player.name);
                initGame();
           
        }
    }
    backN.onclick = ()=>{
        mainMenu.style.display = "block";
        name.style.display = "none";
    }
    document.querySelector("#gameR").onclick = ()=>{
        gameOverWindow.style.display = "none";
        game.over = false;
        initGame();
    }
    document.querySelector("#gameM").onclick = ()=>{
        gameOverWindow.style.display = "none";
        gameWindow.style.display = "none";
        mainMenu.style.display = "block";
        game.over = false;
        startBackgroundLoop();
        window.ontouchstart = null;
    }

    client.on("log-in-fail",(mssg)=>{openAlert(mssg)});
    client.on("log-in-success",(newname,newnum,reg,tries)=>{
      
    });
    
}
function displayHighscores(highscores){
    let gridContainer = document.querySelector(".grid-container");
    while(gridContainer.children.length > 0) gridContainer.removeChild(gridContainer.lastChild);
    gridContainer.innerHTML +=
            `<div class="grid-item"> <b> # </b> </div>
            <div class="grid-item"><b>Discord ID</b></div>
            <div class="grid-item"><b>Score</b></div>
            <div class="item1"><hr class="rounded"></div>`;

    for(let i = 0; i < highscores.length; i++){
        gridContainer.innerHTML +=
        `<div class="grid-item"> <b> #${i + 1}</b> </div>
        <div class="grid-item"><b>${highscores[i].name}</b></div>
        <div class="grid-item centeralign"><b>${highscores[i].score}</b></div>
        <div class="item1"><hr class="rounded"></div>`;
    }
    if(highscores.length === 0){
         while(gridContainer.children.length > 0) gridContainer.removeChild(gridContainer.lastChild);
        let scoreNotify = document.createElement("div");
        gridContainer.innerHTML +=`<h3 class ="centeralign"> No Highest Score  </h3>`
       
    }
   
}

//--Game-------------------------------------------------------------------------------------------------------------------------------------------//
let gameLoopRunning = false, game = {}, player = {}, bubbles = [];
function initGame(){
        bubbles = [];
        game.adjustLeft = 0;
        game.obstacles = [];
        game.tick = 0;
    
        backgroundLoopRunning = false;
        player.y = window.innerHeight*0.4;
        player.oldScore = 0;
        player.score = 0;
        player.angle = 0;
        player.tick = 1;
        player.dir = 1;
        player.x = 50;
        player.f = 0;
    
        client.emit("update-tries",player.name,player.tries);
        document.querySelector(".gameScore").innerText = player.score;
        document.querySelector("#gameInfo").style.display = "block";
        let gameCanvas = document.querySelector("#gameCanvas");
        let ctx = gameCanvas.getContext("2d");
        drawGame(ctx);
        
        window.ontouchstart = (e)=>{
            if(!game.started && !backgroundLoopRunning && !game.over) startGameLoop();
            else if(game.started) jump();
        }
    }

function togglePause() {
    let pauseButton = document.querySelector("#pauseButton");
    let pausedText = document.querySelector("#pausedText");
    pause()
}
      

function startGameLoop(){
    document.querySelector("#gameInfo").style.display = "none";
    let gameCanvas = document.querySelector("#gameCanvas");
    let ctx = gameCanvas.getContext("2d");
    if(android || ios) {
        let pauseBtn = document.querySelector(".pause-button");
        pauseBtn.style.display = "block"
    }
    game.started = true;
    startBackgroundLoop();
    gameLoopRunning = true;
    let currGameTime, prevGameTime;
    window.requestAnimationFrame((currTime)=>{
        currGameTime = currTime;
        prevGameTime = currTime;
        gameLoop(currGameTime,prevGameTime,ctx);
    });
}
function gameLoop(currTime,prevTime,ctx){
    if(gameLoopRunning){
        let elapsedTime = currTime - prevTime;
        if(elapsedTime > 16){
            prevTime = currTime;
            updateGame(elapsedTime);
            drawGame(ctx);
            collision();
        }
        window.requestAnimationFrame((currTime)=>{gameLoop(currTime,prevTime,ctx)});
    }
}
function updateGame(elapsedTime){
    game.tick++;
    if(game.tick >= 100) game.tick = 0;
    if(game.tick % 10 === 0){
        player.tick += player.dir;
        if(player.tick > 2) player.dir = -1;
        else if(player.tick < 2) player.dir = 1;
    }
    if(game.tick % 50 === 0){
        let pipeSet = random(2,6);
        let pipeTop = random(1,9-pipeSet);
        game.obstacles.push({
            x:screen.width*1.1+game.adjustLeft*1.5,
            pipeSet:pipeSet,
            pipeTop:pipeTop
        });
        for(let i = 0; i < random(2,4); i++){
            let currX = random(0,100);
            bubbles.push({
                x:currX + random(-3,3),
                y:random(110+i*5,130+i*5),
                size:random(10,20),
                speed:random(10,20)
            });
        }
    }
    if(game.obstacles.length > 0){
        let behindPlayer =  game.adjustLeft-window.innerHeight*0.1*0.95+100;
        if(game.obstacles[0].x < behindPlayer){
            if(player.score === player.oldScore){
                player.score++;
                document.querySelector(".gameScore").innerText = player.score;
            }
            if(game.obstacles[0].x < behindPlayer-100){
                game.obstacles.splice(0,1);
                player.oldScore++;
            }
        }
    }
    let distX = elapsedTime/2;
    if(isIPad || isTablet){
        distX = elapsedTime
    }
    if(ios || android) distX *= 0.4;
    game.adjustLeft += distX;
    player.x += distX;

    let gravity = window.innerHeight*0.0005;
    player.y += gravity+player.f;
    player.f += gravity;

    if(player.angle < Math.PI/2) player.angle += Math.PI/72;
    if(player.angle > Math.PI/2) player.angle = Math.PI/2;
    for(let i = bubbles.length-1; i >= 0; i--){
        bubbles[i].y -= bubbles[i].speed/10;
        if(bubbles[i].y < -10) bubbles.splice(i,1)
    }
}
function drawGame(ctx){
    let height = window.innerHeight;
    if(ios) height *= 1.1;
    ctx.clearRect(0,0,window.innerWidth,height);
    let playerHeight = window.innerHeight*0.1;
    let playerWidth = playerHeight*0.95;
    let playerImg = player.image;
    if(android || ios){
        playerHeight *= 0.75;
        playerWidth *= 0.75;
    }

    for (let i = 0; i < game.obstacles.length; i++) {
        let obs = game.obstacles[i];
        let gap = (window.innerHeight * obs.pipeSet) / 10;
        let height1 = (window.innerHeight * obs.pipeTop) / 10;
        let height2 = window.innerHeight - height1 - gap; // Adjusted calculation for height2
      
        let headWidth = playerWidth * 1.1;
        let headHeight = headWidth / 2.715;
      
        ctx.beginPath();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(game.images[0], obs.x - game.adjustLeft, 0, playerWidth, height1);
        ctx.closePath();
      
        ctx.beginPath();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          game.images[1],
          obs.x - game.adjustLeft - playerWidth * 0.05,
          height1 - headHeight,
          headWidth,
          headHeight
        );
        ctx.closePath();
      
        ctx.beginPath();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          game.images[0],
          obs.x - game.adjustLeft,
          height1 + gap,
          playerWidth,
          height2
        );
        ctx.closePath();
      
        ctx.beginPath();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          game.images[1],
          obs.x - game.adjustLeft - playerWidth * 0.05,
          height1 + gap,
          headWidth,
          headHeight
        );
        ctx.closePath();
    }
      
    ctx.beginPath();
    ctx.save();
    ctx.translate(player.x-game.adjustLeft+playerWidth/2,player.y+playerHeight/2);
    ctx.rotate(player.angle);
    ctx.imageSmoothingEnabled = false;
    
    let tempCanvas = document.createElement("canvas");
    let tempCtx = tempCanvas.getContext("2d");
    tempCanvas.width = (playerWidth*1.3) * window.devicePixelRatio;
    tempCanvas.height = (playerHeight*1.3) * window.devicePixelRatio;
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(playerImg, 0, 0, tempCanvas.width, tempCanvas.height);


    ctx.drawImage(tempCanvas,-playerWidth/2,-playerHeight/2,playerWidth*1.3+1,playerHeight*1.3+1);
    ctx.restore();
    ctx.closePath();

    for(let i = 0; i < bubbles.length; i++){
        ctx.beginPath();
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.strokeStyle = "rgb(255,255,255)";
        ctx.arc(
            bubbles[i].x/100*window.innerWidth,
            bubbles[i].y/100*window.innerHeight,
            bubbles[i].size/2000*window.innerWidth,
            0,2*Math.PI
        );
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.arc(
            bubbles[i].x/100*window.innerWidth-bubbles[i].size/2000*window.innerWidth/2,
            bubbles[i].y/100*window.innerHeight-bubbles[i].size/2000*window.innerWidth/2,
            bubbles[i].size/2000*window.innerWidth/5,
            0,2*Math.PI
        );
        ctx.fill();
        ctx.closePath();
    }
}

function collision(){
    if(player.y > window.innerHeight) gameOver();
    if(player.y < -window.innerHeight*0.05) player.y = -window.innerHeight*0.05;
    if(game.obstacles.length > 0){
        let obs = game.obstacles[0];
        let gap = window.innerHeight*obs.pipeSet/10;
        let height1 = window.innerHeight*obs.pipeTop/10;
        let height2 = window.innerHeight-height1-gap;
        let playerHeight = window.innerHeight*0.1;
        let playerWidth = playerHeight*0.95;
        if(android || ios){
            playerHeight *= 0.75;
            playerWidth *= 0.75;
        }

        let playerCircle = {x:player.x-game.adjustLeft+playerWidth/2,y:player.y+playerHeight*0.55,r:playerWidth*0.32};
        let obsRect1 = {x:obs.x-game.adjustLeft,y:0,w:playerWidth,h:height1};
        let obsRect2 = {x:obs.x-game.adjustLeft,y:height1+gap,w:playerWidth,h:height2};
        if(rectCircleCollision(playerCircle,obsRect1) || rectCircleCollision(playerCircle,obsRect2)) gameOver();
    }
}
function rectCircleCollision(circle,rect){
    let distX = Math.abs(circle.x - rect.x-rect.w/2);
    let distY = Math.abs(circle.y - rect.y-rect.h/2);

    if(distX > (rect.w/2 + circle.r)) return false;
    if(distY > (rect.h/2 + circle.r)) return false;
    if(distX <= (rect.w/2)) return true;
    if(distY <= (rect.h/2)) return true;

    let dx = distX - rect.w/2;
    let dy = distY - rect.h/2;
    return (dx * dx + dy * dy <= (circle.r * circle.r));
}
function jump(){
    if(gameLoopRunning){
        let gravity = window.innerHeight*0.0005;
        player.f = -20*gravity;
        player.angle = -Math.PI*0.4;
    }
}
function pause(){
    let pausedText = document.querySelector("#pausedText");
    if(gameLoopRunning){
        pausedText.style.display = "block";
        backgroundLoopRunning = false;
        gameLoopRunning = false;
    }
    else{
        pausedText.style.display = "none";
        startBackgroundLoop();
        startGameLoop();
    }
}
function gameOver(){
    game.over = true;
    game.started = false;
    gameLoopRunning = false;
    backgroundLoopRunning = false;
    let pauseBtn = document.querySelector(".pause-button");
    pauseBtn.style.display = "none"
    document.querySelector("#gameOverWindow").style.display = "block";
    if(player.name != undefined) {
        client.emit("new-score",{name:player.name,score:player.score});
    }    

}

//--Keyboard---------------------------------------------------------------------------------------------------------------------------------------//
window.onkeydown = (e)=>{
    if(!game.started && !backgroundLoopRunning && !game.over && e.key === " ") startGameLoop();
    else if(game.started){
        switch(e.key){
            default:break;
            case " ":jump();break;
            case "Escape":pause();break;
            case "Escape":pause();break;
        }
    }
}