//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34; 
let birdHeight = 24;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImg;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 62; 
let pipeHeight = 500;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

let velocityX = -2; 
let velocityY = 0; 
let gravity = 0.4;

let gameStarted = false; // NEW: Tracks if the current round has actually begun
let gameOver = false;
let score = 0;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); 

    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./tpipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./b.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); //every 1.5 seconds
    
    // Desktop keyboard controls
    document.addEventListener("keydown", moveBird);
    
    // Mobile touch controls
    document.addEventListener("touchstart", moveBird, { passive: false });
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // bird physics (Only apply if the game has started)
    if (gameStarted) {
        velocityY += gravity;
        bird.y = Math.max(bird.y + velocityY, 0); 
    }
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // FIX: Game over happens as soon as the bird touches the ground, not after it falls through
    if (bird.y + bird.height >= board.height) {
        bird.y = board.height - bird.height; // Snap to ground
        gameOver = true;
    }

    // pipes (Only move pipes if the game has started)
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        if (gameStarted) {
            pipe.x += velocityX;
        }
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; 
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); 
    }

    // score
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    // Help text for the player
    if (!gameStarted && !gameOver) {
        context.font = "20px sans-serif";
        context.fillText("PRESS KEY TO START", boardWidth / 4, boardHeight / 2 + 50);
    }

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
        context.font = "20px sans-serif";
        context.fillText("PRESS KEY TO RESTART", 5, 130);
    }
}

function placePipes() {
    // Don't spawn pipes if the game is over OR hasn't started yet
    if (gameOver || !gameStarted) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.type === "touchstart" || e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX") {
        
        if (e.type === "touchstart") {
            e.preventDefault();
        }

        if (gameOver) {
            
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            velocityY = 0; 
            gameOver = false;
            gameStarted = false; 
        } else {
           
            gameStarted = true;
            velocityY = -6;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;    
}
