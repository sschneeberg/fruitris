//Set up Canvases
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const computedStyle = getComputedStyle(canvas);
const height = computedStyle.height;
const width = computedStyle.width;
canvas.setAttribute('height', height);
canvas.setAttribute('width', width);

const nextUp = document.getElementById('next');
const ctxNext = nextUp.getContext('2d');
const computedStyleNext = getComputedStyle(nextUp);
const nextHeight = computedStyleNext.height;
const nextWidth = computedStyleNext.width;
nextUp.setAttribute('height', nextHeight);
nextUp.setAttribute('width', nextWidth);

const powerUpBox = document.getElementById('powerUp');
const ctxPower = powerUpBox.getContext('2d');
const computedStylePow = getComputedStyle(powerUpBox);
const powHeight = computedStylePow.height;
const powWidth = computedStylePow.width;
powerUpBox.setAttribute('height', powHeight);
powerUpBox.setAttribute('width', powWidth);


//create objects and rule sets
//canvas has 12 rows and 9 columns
let board = Array(12).fill().map(() => Array(9).fill(0));
let fruitGroup = [];
let nextFruitGroup = null;
const movement = 10;
let movementSpeed = 150;
let movementMultiplier = 1;
const gravitySpeed = 150;
let movePiece = null;
let gameOver = false;
let piecePts = 50;
let gameState = 'active';
let gameMode = 1;
const countDown = 30000;
let startTime = 0;
//instatiate images
const red = new Image();
red.src = 'imgs/red.png';
const blue = new Image();
blue.src = 'imgs/blue.png';
const yellow = new Image();
yellow.src = 'imgs/yellow.png';
const green = new Image();
green.src = 'imgs/green.png';
const imgs = [red, yellow, green, blue];
const canvasBackground = new Image();
canvasBackground.src = 'imgs/graphic-weave-large.png';
const sideBackground = new Image();
sideBackground.src = 'imgs/graphic-weave-small.png';

class Player {
    constructor(number) {
        this.number = number
        this.name = `Player ${this.number}`;
        this.score = 0;
        this.turn = false;
        this.won = false;
        this.highScore = 5000;
        this.mode = null;
        this.powerups = {
            row: { number: 0, url: 'imgs/row.png', y: 10 }, //clears a row
            column: { number: 0, url: 'imgs/column.png', y: 70 }, //clears column
            all: { number: 0, url: 'imgs/color-bomb.png', y: 135 }, //clears all of one color
        }
    }

    incScore(pts) {
        this.score = this.score + pts;
        document.getElementById('score').innerText = this.score;
        if (gameMode === 2 && this.score % 500 === 0) {
            //every 500 pts add a random powerup
            this.addPowerUp();
        }
        if (gameMode === 1 && this.score % 2000 === 0) {
            if (movementMultiplier > 0.4) {
                movementMultiplier = movementMultiplier - 0.15;
            }
        }
        this.checkScore();
    }

    checkScore() {
        if (gameMode === 2) { return; }
        if (this.highScore !== null && this.score >= this.highScore) {
            fruitGroup = [];
            gameOver = true;
            this.won = true;
        }
    }

    clrScore() {
        this.score = 0;
        document.getElementById('score').innerText = this.score;
    }

    addPowerUp() {
        let types = ['column', 'row', 'all']
        let index = Math.floor(Math.random() * 3);
        let type = types[index];
        this.powerups[type].number = this.powerups[type].number + 1;
    }

    renderPowerUps() {
        for (let type in this.powerups) {
            //draw the symbol 
            let icon = new Image();
            icon.src = this.powerups[type].url
            let x = (powerUpBox.width / 2) - 25;
            ctxPower.drawImage(icon, x, this.powerups[type].y, 60, 60);
            /* Circles for basic functionality testing
            ctxPower.fillStyle = this.powerups[type].color;
            ctxPower.beginPath();
            ctxPower.arc(powerUpBox.width / 2, this.powerups[type].startY, 23, 0, 2 * Math.PI);
            ctxPower.fill();
            */
            //add the count label
            ctxPower.fillStyle = 'lightgrey';
            ctxPower.beginPath();
            ctxPower.arc(((powerUpBox.width / 2) - 18), (this.powerups[type].y + 8), 12, 0, 2 * Math.PI);
            ctxPower.fill();
            ctxPower.fillStyle = 'black';
            ctxPower.font = "16px Arial";
            ctxPower.fillText(this.powerups[type].number, ((powerUpBox.width / 2) - 23), this.powerups[type].y + 13);
        }
    }
}

let player1 = new Player(1);
let player2 = new Player(2);

class Fruit {
    constructor(x, y, color) {
        //all fruit have radius 25 (take up a 50x50 square with some padding) and sAngle 0, eAngle 2Pi
        //all fruit start vertical in center column: j = 4
        this.x = x;
        this.y = y;
        this.color = color;
        this.r = 25;
        this.sAngle = 0;
        this.eAngle = 2 * Math.PI;
        this.orientation = 'vertical';
        //what can it fall to before stopping?
        this.baseline = canvas.height;
        this.image = '';
    }

    render() {
        //context.drawImage(img,x,y,width,height);
        this.image = imgs[this.color - 1];
        let x = this.x - this.r;
        let y = this.y - this.r;
        let dim = 50;
        ctx.drawImage(this.image, x, y, dim, dim);
        /* Circles for building functionality:
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, this.sAngle, this.eAngle);
        ctx.fill();
        */
    }

    renderNext() {
        this.image = imgs[this.color - 1];
        let dim = 50;
        let y = this.y + nextUp.height - (2 * dim / 2);
        let x = (next.width / 2) - dim / 2;
        ctxNext.drawImage(this.image, x, y, dim, dim);
        /*
        ctxNext.fillStyle = this.color;
        ctxNext.beginPath();
        ctxNext.arc((next.width / 2), (this.y + nextUp.height - this.r), this.r, this.sAngle, this.eAngle);
        ctxNext.fill(); */
    }

    //move side to side with arrow keys
    move(dX) {
        this.x = this.x + dX;
    }

    //check if hits x boundaries or another piece
    //return true if piece can move, return false if piece will go over the edge
    checkBoundaries(dX) {
        let outsideL = this.x - this.r + dX;
        let outsideR = this.x + this.r + dX;
        let newCenterX = this.x + dX;
        let i = Math.floor((this.y + this.r) / (2 * this.r));
        let j = Math.floor(newCenterX / (2 * this.r)) //adjust j
        if (outsideL < 0 || outsideR > canvas.width) {
            //currently at the edge, cannot go further
            return false;
        }
        if (i >= 0) {
            if (board[i][j] !== 0) {
                //going to hit a stored piece
                return false;
            }
        }
        return true;
    }

    //hits bottom/y limit
    checkHit() {
        let bottom = this.y + this.r + movement;
        if (bottom > this.baseline) {
            return false;
        } else {
            return true;
        }
    }


    getCell() {
        let i = Math.floor(this.y / (2 * this.r));
        let j = Math.floor(this.x / (2 * this.r));
        return [i, j]
    }
}

//create the fruit objects
function createFruitGroup(x, y, n) {
    let colors = [1, 2, 3, 4];
    while (n > 0) {
        let index = Math.floor(Math.random() * colors.length);
        let color = colors[index];
        const fruit = new Fruit(x, y, color);
        nextFruitGroup.push(fruit);
        y = y - 50;
        n = n - 1;
    }
}

//reset a new piece to fall from the top, draw on canvas
function drawFruitGroup() {
    //reset spped to normal
    clearInterval(movePiece);
    movementSpeed = 200;
    movePiece = setInterval(dropFruitGroup, (movementSpeed * movementMultiplier));
    //for now always start in the middle above the canvas and 
    //always be groups of 3
    const startX = canvas.width / 2;
    const startY = -25;
    const n = 3;
    //make new fruit group
    if (nextFruitGroup === null) {
        //first turn, make a next fruit group to start
        nextFruitGroup = [];
        createFruitGroup(startX, startY, n);
    }
    //set the current fruit group to the next one
    fruitGroup = [];
    fruitGroup = nextFruitGroup;
    nextFruitGroup = [];
    //get a new next one
    createFruitGroup(startX, startY, n);
    for (let fruit of fruitGroup) {
        fruit.render();
    }
    for (let fruit of nextFruitGroup) {
        fruit.renderNext()
    }
}

//move piece down on time interval until hits fall limit
function dropFruitGroup() {
    fruitFall();
    //if everything can move
    if (checkBottom()) {
        //drop pieces
        for (let fruit of fruitGroup) {
            fruit.y = fruit.y + movement;
        }
    } else {
        //add to board and create a new peice
        addFruitGroup();
    }

}

//check if we hit the fall limit
function checkBottom() {
    for (let fruit of fruitGroup) {
        getBaseline(fruit);
        if (!fruit.checkHit()) {
            return false;
        }
    }
    return true;
}

//find the fall limit: 
//farthest a fruit can fall in its column before hits the bottom or the top fruit of the stack
function getBaseline(fruit) {
    let j = Math.floor(fruit.x / (2 * fruit.r));
    let count = 0;
    if (j >= 0 && j < board[0].length) {
        for (i = (board.length - 1); i > 0; i--) {
            if (board[i][j] === 0) {
                //if nothing is found
                break;
                //this is the top of the stack
            } else {
                //raise baseline by one circle/one row
                count = count + 1;
            }
        }
        fruit.baseline = canvas.height - (count * (2 * fruit.r));
    }
}

//add pieces to the board once they hit the bottom or the top layer of fruit
function addFruitGroup() {
    for (let fruit of fruitGroup) {
        //store color in board at correct location
        let [i, j] = fruit.getCell();
        //fruit.y = fruit.baseline;
        if (i >= 0 && j >= 0) {
            board[i][j] = fruit;
        }
    }
    checkClear();
    //checkEndCondition();
    //keep adding if single player, else check if turns need to change first
    if (gameMode === 1) {
        drawFruitGroup();
    } else if (gameMode === 2) {
        checkChangeTurns();
    }
}

function checkChangeTurns() {
    //change turns if in two player mode and interval has passed
    if (Date.now() - startTime >= countDown) {
        clearInterval(movePiece);
        fruitGroup = [];
        player1.turn = !player1.turn;
        player2.turn = !player2.turn;
        if (player1.turn) {
            document.getElementById('turnChanger').style.opacity = 1;
            setTimeout(function() {
                document.getElementById('turnDisp').innerText = `${player1.name}'s Turn`;
                document.getElementById('countDown').innerText = '3';
            }, 900)
            setTimeout(function() {
                document.getElementById('countDown').innerText = '2';
            }, 2000);
            setTimeout(function() {
                document.getElementById('countDown').innerText = '1';
                document.getElementById('turnChanger').style.opacity = 0;
            }, 3000);
            setTimeout(function() {
                document.getElementById('player').innerText = player1.name;
                document.getElementById('score').innerText = player1.score;
                document.getElementById('turnDisp').innerText = '';
                document.getElementById('countDown').innerText = '';
                player1.renderPowerUps();
                startTime = Date.now();
                drawFruitGroup();
            }, 4000);
        } else if (player2.turn) {
            document.getElementById('turnChanger').style.opacity = 1;
            setTimeout(function() {
                document.getElementById('turnDisp').innerText = `${player2.name}'s Turn`;
                document.getElementById('countDown').innerText = '3';
            }, 900)
            setTimeout(function() {
                document.getElementById('countDown').innerText = '2';
            }, 2000);
            setTimeout(function() {
                document.getElementById('countDown').innerText = '1';
                document.getElementById('turnChanger').style.opacity = 0;
            }, 3000);
            setTimeout(function() {
                document.getElementById('player').innerText = player2.name;
                document.getElementById('score').innerText = player2.score;
                document.getElementById('turnDisp').innerText = '';
                document.getElementById('countDown').innerText = '';
                player2.renderPowerUps();
                startTime = Date.now();
                drawFruitGroup();
            }, 4000);
        }
    } else { //if it's not time to switch, just keep drawing
        drawFruitGroup();
    }
}

//institute gravity: if the spot is empty, drop the fruit
function fruitFall() {
    //count = 0;
    for (i = 1; i < board.length; i++) {
        for (j = 0; j < board[0].length; j++) {
            //if there is a fruit above, but the current spot is empty
            if (board[i][j] === 0 && board[i - 1][j] !== 0) {
                //count = count + 1;
                //move the fruit to the current row and update is position
                board[i][j] = board[i - 1][j];
                board[i][j].y = board[i][j].y + (2 * board[i][j].r);
                board[i - 1][j] = 0;
                if (i === board.length - 1 || board[i + 1][j] !== 0) {
                    //do not match mid fall
                    checkHorizMatch(i, j, board[i][j]);
                    checkVertMatch(i, j, board[i][j]);
                }
            } //otherwise do nothing, the fruit stays put
        }
    }
}

//check if you have three in a row and remove them 
function checkClear() {
    let count = 0;
    for (let fruit of fruitGroup) {
        let [i, j] = fruit.getCell();
        if (i >= 0 && j >= 0) {
            if (board[i][j] !== 0) {
                //if this fruit hasn't already been removed by checking a previous fruit then check if it created matches
                //this means horizontal and vertical combos will not clear both
                let horiz = checkHorizMatch(i, j, fruit);
                let vert = checkVertMatch(i, j, fruit);
                if (horiz || vert) { count = count + 1; }
            }
        }
    }
    if (count === 0) { checkEndCondition(); }
}

//check for horizontal matches from current fruit
function checkHorizMatch(i, j, fruit) {
    let matchedFruit = [
        [i, j]
    ];
    //check for matches moving left from current fruit
    for (n = j - 1; n > -1; n--) {
        if (board[i][n] !== 0 && board[i][n].color === fruit.color) {
            matchedFruit.push([i, n]);
        } else {
            //if the next one to the left doesn't match stop checking
            break;
        }
    }
    //check for matches moving right from current fruit
    for (n = j + 1; n < board[i].length; n++) {
        if (board[i][n] !== 0 && board[i][n].color === fruit.color) {
            matchedFruit.push([i, n]);
        } else {
            //if the next one to the right doesn't match stop checking
            break;
        }
    }
    //matches must be at least 3
    if (matchedFruit.length >= 3) {
        //if enough, clear fruit and return true
        for (let coord of matchedFruit) {
            let x = coord[0];
            let y = coord[1];
            board[x][y] = 0;
            if (player1.turn === true) {
                player1.incScore(piecePts);
            } else if (gameMode === 2 && player2.turn === true) {
                player2.incScore(piecePts);
            }
        }
        return true;
    } else { //other wise don't 
        return false;
    }
}

//check for vertical matches from current fruit
function checkVertMatch(i, j, fruit) {
    let matchedFruit = [
        [i, j]
    ];
    //check for matches moving up from current fruit
    for (n = i - 1; n > -1; n--) {
        if (board[n][j] !== 0 && board[n][j].color === fruit.color) {
            matchedFruit.push([n, j]);
        } else {
            //if the next one up doesn't match stop 
            break;
        }
    }
    //check for matches moving down from current fruit
    for (n = i + 1; n < board.length; n++) {
        if (board[n][j] !== 0 && board[n][j].color === fruit.color) {
            matchedFruit.push([n, j]);
        } else {
            //if the next one down doesn't match stop checking
            break;
        }
    }
    //matches must be at least 3
    if (matchedFruit.length >= 3) {
        //if enough matches, clear surrounding fruit and return true
        for (let coord of matchedFruit) {
            let x = coord[0];
            let y = coord[1];
            board[x][y] = 0;
            if (player1.turn === true) {
                player1.incScore(piecePts);
            } else if (gameMode === 2 && player2.turn === true) {
                player2.incScore(piecePts);
            }
        }
        return true;
    } else {
        return false;
    }
}

//move group of three side to side, runs on user key press
function moveFruitGroup(dX) {
    if (fruitGroup[0].checkBoundaries(dX) && fruitGroup[2].checkBoundaries(dX)) {
        for (let fruit of fruitGroup) {
            fruit.move(dX);
        }
    }
}

//rotate group of three fruit CW or CCW, runs on user key press
function rotateFruitGroup(direction) {
    //get center piece coordinates
    let [x1, y1] = [fruitGroup[0].x, fruitGroup[0].y]
    let [x2, y2] = [fruitGroup[1].x, fruitGroup[1].y];
    let [x3, y3] = [fruitGroup[2].x, fruitGroup[2].y];
    //only need to check one to know entire group, only need to reset this one
    let orientation = fruitGroup[1].orientation;
    //take down to base transformations
    x1 = x1 - x2;
    y1 = y1 - y2;
    x3 = x3 - x2;
    y3 = y3 - y2;
    //make transformations
    if (direction === 'CW' && orientation === 'vertical') {
        //CW from vertical to horizontal: x = -y, y = x
        [x1, y1] = [-y1, x1];
        [x3, y3] = [-y3, x3];
    } else if (direction === 'CCW' && orientation === 'horizontal') {
        //CCW from horizontal to vertical: y = -x, x = y
        [x1, y1] = [y1, -x1];
        [x3, y3] = [y3, -x3];
    } else {
        //all other transformtions: x = y, y = x
        [x1, y1] = [y1, x1];
        [x3, y3] = [y3, x3];
    }
    //reset to full value
    let [x1new, y1new] = [x1 + x2, y1 + y2];
    let [x3new, y3new] = [x3 + x2, y3 + y2];
    if (checkRot(x1new, y1new, x3new, y3new, fruitGroup[0].r)) {
        //set values
        [fruitGroup[0].x, fruitGroup[0].y] = [x1new, y1new];
        [fruitGroup[2].x, fruitGroup[2].y] = [x3new, y3new];
        //change orientation to current
        if (orientation === 'vertical') {
            fruitGroup[1].orientation = 'horizontal';
        } else {
            fruitGroup[1].orientation = 'vertical';
        }
    }
}

//make sure we can't rotate piece off the board
function checkRot(x1, y1, x3, y3, r) {
    let j1 = Math.floor(x1 / (2 * r));
    let j3 = Math.floor(x3 / (2 * r));
    let i1b = Math.floor((y1 + r) / (2 * r));
    let i3b = Math.floor((y3 + r) / (2 * r));
    //return true if piece can rotate, return false otherwise
    if (y1 + r > canvas.height || y3 + r > canvas.height) {
        //beyond bottom can't rotate here
        return false;
    } else if (x1 - r < 0 || x1 + r > canvas.width) {
        //fruitGroup[0] off the edge
        return false;
    } else if (x3 - r < 0 || x3 + r > canvas.width) {
        //fruitGroup[2] off the edge
        return false;
    } else if ((((i1b) >= 0 && (j1) >= 0) && ((i3b) >= 0 && (j3) >= 0)) && (board[i1b][j1] !== 0 || board[i3b][j3] !== 0)) {
        //if it's on the board: is it going to hit another fruit? if yes return false: cannot move
        return false;
    } else {
        return true;
    }
}

function checkEndCondition() {
    for (j = 0; j < board[0].length; j++) {
        if ((board[0][j]) !== 0 && board[0][j].y < 50) {
            gameOver = true;
            fruitGroup = [];
            clearInterval(movePiece);
            if (gameMode === 2) {
                if (player1.turn) {
                    player2.won = true;
                } else if (player2.turn) {
                    player1.won = true;
                }
            }
        }
    }
}

function clearCol() {
    let j = Math.floor(Math.random() * board[0].length);
    for (i = 0; i < board.length; i++) {
        board[i][j] = 0;
    }
}

function clearRow() {
    //clear rows only in the bottom half of board to ensure maximum helpfulness
    let rows = [7, 8, 9, 10, 11];
    let i = Math.floor(Math.random() * rows.length);
    let row = rows[i];
    for (j = 0; j < board[0].length; j++) {
        board[row][j] = 0;
    }
    checkClear();
}

function clearColor() {
    let colors = [1, 2, 3, 4];
    let index = Math.floor(Math.random() * colors.length);
    let color = colors[index];
    for (i = 0; i < board.length; i++) {
        for (j = 0; j < board[0].length; j++) {
            if (board[i][j].color === color) {
                board[i][j] = 0;
            }
        }
    }
    checkClear();
}

function pauseGame(e) {
    if (gameState === 'active') {
        e.target.innerText = 'RESUME';
        gameState = 'paused';
        clearInterval(movePiece);
    } else if (gameState === 'paused') {
        e.target.innerText = 'PAUSE';
        gameState = 'active';
        movementSpeed = 200;
        movePiece = setInterval(dropFruitGroup, (movementSpeed * movementMultiplier));
    }
}

function resetGame(e) {
    if (e.target.id == 'restart') {
        document.getElementById('endScreen').classList.toggle('hide');
        document.getElementById('difficulties').classList.toggle('hide');
        board = Array(12).fill().map(() => Array(9).fill(0));
        player1.clrScore();
        player2.clrScore();
        if (gameMode === 1) {
            if (player1.mode === 'easy') {
                player1.highScore = 5000;
            } else if (player1.mode === 'medium') {
                player1.highScore = 10000;
            } else if (player1.mode === 'hard') {
                player1.highScore = 15000;
            }
        }
        startGame();
    } else if (gameMode === 1) {
        if (gameState === 'paused') {
            document.getElementById('pause').innerText = 'PAUSE';
            gameState = 'active';
            movementSpeed = 200;
            movePiece = setInterval(dropFruitGroup, (movementSpeed * movementMultiplier));
        }
        board = Array(12).fill().map(() => Array(9).fill(0));
        player1.clrScore();
        drawFruitGroup();
    }
}

function toggleButtons() {
    if (gameMode === 1) {
        document.getElementById('reset').classList.toggle('hide');
        document.getElementById('pause').classList.toggle('hide');
    } else if (gameMode === 2) {
        document.getElementById('powerUp').classList.toggle('hide');
    }
    document.getElementById('menu').classList.toggle('hide');
    document.getElementById('info').classList.toggle('hide');
    //toggle next up screen too
    document.getElementById('next').classList.toggle('hide');
    document.getElementById('next-up').classList.toggle('hide');
}

function startGame() {
    toggleButtons();
    gameOver = false;
    gameState = 'active';
    player1.name = document.getElementById('player1').value;
    player1.name = player1.name.toUpperCase();
    player1.turn = true;
    if (gameMode === 2) { //turn off p2 menu items, turn on p2 game items
        player2.name = document.getElementById('player2').value;
        player2.name = player2.name.toUpperCase();
        document.querySelectorAll('.p2').forEach(function(e) {
            e.classList.toggle('hide');
        })
        player1.renderPowerUps();
    }
    if (gameMode === 1) { //turn off p1 menu items, turn on p1 game items
        document.getElementById('difficulties').classList.toggle('hide');

        document.getElementById('turnChanger').style.opacity = 1;
        setTimeout(function() {
            document.getElementById('turnDisp').innerText = `SCORE TO BEAT: ${player1.highScore} PTS`;
        }, 1000)
        setTimeout(function() {
            document.getElementById('turnChanger').style.opacity = 0;
        }, 3000);
        setTimeout(function() {
            document.getElementById('turnDisp').innerText = '';
        }, 4000);

        document.getElementById('score').innerText = player1.score;
    } else {
        document.getElementById('score').innerText = player1.score;
    }
    //show player into, start game
    document.querySelector('.player-info').classList.toggle('hide');
    document.getElementById('player').innerText = player1.name;
    startTime = Date.now();
    drawFruitGroup();
    //gravity = setInterval(fruitFall, gravitySpeed);
}

//reset to start screen
function mainMenu(e) {
    //turn things off
    if (e.target.id === 'rechoose') {
        document.getElementById('endScreen').classList.toggle('hide');
        document.querySelector('.player-info').classList.toggle('hide');
    } else {
        toggleButtons();
    }
    //turn things on
    board = Array(12).fill().map(() => Array(9).fill(0));
    player1.clrScore();
    player2.clrScore();
    document.getElementById('turnDisp').innerText = '';
    document.getElementById('startScreen').classList.toggle('hide');
    document.querySelector('.player-info').classList.toggle('hide');
    gameOver = true;
    gameState = 'deactive';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(canvasBackground, 0, 0);
    clearInterval(movePiece);

}

//gameloop function
function rePaint() {
    if (!gameOver) { //clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctxNext.clearRect(0, 0, nextUp.width, nextUp.height);
        ctx.drawImage(canvasBackground, 0, 0);
        ctxNext.drawImage(sideBackground, 0, 0);
        if (gameMode === 2) {
            ctxPower.clearRect(0, 0, powerUpBox.width, powerUpBox.height);
            ctxPower.drawImage(sideBackground, 0, 0);
            if (player1.turn) {
                player1.renderPowerUps();
            } else if (player2.turn) {
                player2.renderPowerUps();
            }
        }
        //re render
        for (let fruit of fruitGroup) {
            fruit.render();
        }
        if (nextFruitGroup !== null) {
            for (let fruit of nextFruitGroup) {
                fruit.renderNext();
            }
        }
        for (i = 0; i < board.length; i++) {
            for (j = 0; j < board[i].length; j++) {
                if (board[i][j] !== 0) {
                    board[i][j].render();
                }
            }
        }
    } else if (gameOver && gameState === 'active') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctxNext.clearRect(0, 0, nextUp.width, nextUp.height);
        ctx.drawImage(canvasBackground, 0, 0);
        //display end screen
        //clear intervals
        gameState = 'deactive';
        if (player1.won) {
            if (gameMode === 1) {
                document.getElementById('winner').innerText = `WINNER: ${player1.score} PTS`;
                document.getElementById('continue').classList.toggle('hide');
            } else {
                document.getElementById('winner').innerText = `${player1.name} WINS: ${player1.score} PTS`;
            }
        } else if (player2.won) {
            document.getElementById('winner').innerText = `${player2.name} WINS: ${player2.score} PTS`;
        } else {
            document.getElementById('winner').innerText = `YOU LOST: ${player1.score} PTS`;
        }
        document.getElementById('endScreen').classList.toggle('hide');
        document.querySelector('.player-info').classList.toggle('hide');
        toggleButtons();
    }
}

//React to player input
document.addEventListener('DOMContentLoaded', function() {
    setInterval(rePaint, 80);
    document.querySelectorAll('.modeBtn').forEach(function(e) {
            e.addEventListener('click', function(e) {
                document.getElementById('playScreen').classList.toggle('hide');
                document.getElementById('startScreen').classList.toggle('hide');
                if (e.target.id === 'double') {
                    //show second player input
                    document.querySelectorAll('.p2').forEach(function(e) {
                            e.classList.toggle('hide');
                        })
                        //set game mode
                    gameMode = 2;
                }
                if (e.target.id === 'single') {
                    document.getElementById('difficulties').classList.toggle('hide');
                    gameMode = 1;
                }
            })
        })
        //buttons
    document.getElementById('start').addEventListener('click', function() {
        document.getElementById('playScreen').classList.toggle('hide');
        startGame();
    })
    document.querySelectorAll('.difficultyBtn').forEach(function(e) {
        e.addEventListener('click', function(e) {
            if (e.target.id === 'easy') {
                e.target.classList.add('selected');
                document.getElementById('medium').classList.remove('selected');
                document.getElementById('hard').classList.remove('selected');
                player1.highScore = 5000;
                player1.mode = 'easy'
            } else if (e.target.id === 'medium') {
                e.target.classList.add('selected');
                document.getElementById('easy').classList.remove('selected');
                document.getElementById('hard').classList.remove('selected');
                player1.highScore = 10000;
                player1.mode = 'medium'
            } else if (e.target.id === 'hard') {
                e.target.classList.add('selected');
                document.getElementById('medium').classList.remove('selected');
                document.getElementById('easy').classList.remove('selected');
                player1.highScore = 15000;
                player1.mode = 'hard';
            }
        });
    });
    //in game
    document.getElementById('pause').addEventListener('click', pauseGame);
    document.getElementById('menu').addEventListener('click', mainMenu);
    document.getElementById('reset').addEventListener('click', resetGame);
    //ingame instructions per my mother's request
    document.getElementById('info').addEventListener('click', function() {
        gameState = 'paused';
        clearInterval(movePiece);
        document.getElementById('helpScreen').classList.toggle('hide');
        document.getElementById('instructions').innerHTML = instructions;
        document.getElementById('return').addEventListener('click', function() {
            if (gameState === 'paused') {
                document.getElementById('startScreen').classList.toggle('hide');
                gameState = 'active';
                movementSpeed = 200;
                movePiece = setInterval(dropFruitGroup, (movementSpeed * movementMultiplier));
            }
        })
    });
    //at end of game
    document.getElementById('restart').addEventListener('click', resetGame);
    document.getElementById('rechoose').addEventListener('click', mainMenu);
    document.getElementById('continue').addEventListener('click', function() {
        document.getElementById('endScreen').classList.toggle('hide');
        document.getElementById('continue').classList.toggle('hide');
        document.querySelector('.player-info').classList.toggle('hide');
        toggleButtons();
        gameState = 'active';
        gameOver = false;
        player1.won = false;
        player1.highScore = null;
        drawFruitGroup();
    })

    //move pieces
    document.addEventListener('keydown', function(e) {
        if (gameState === 'paused') { return; }
        if ((e.key === 'ArrowLeft' && player1.turn) || (e.key === 'a' && player2.turn)) {
            //left
            let dX = -50;
            moveFruitGroup(dX);
        } else if ((e.key === 'ArrowRight' && player1.turn) || (e.key === 'd' && player2.turn)) {
            //right
            let dX = 50;
            moveFruitGroup(dX);
        } else if (e.key === 'Shift' && gameState !== 'paused') {
            //speed up on press NOT HOLD
            //Reset when new piece is drawn
            clearInterval(movePiece);
            movePiece = setInterval(dropFruitGroup, 80);
        } else if ((e.key === 'ArrowDown' && player1.turn) || (e.key === 's' && player2.turn)) {
            //CW
            let rot = 'CW';
            rotateFruitGroup(rot);
        } else if ((e.key === 'ArrowUp' && player1.turn) || (e.key === 'w' && player2.turn)) {
            //CCW
            let rot = 'CCW';
            rotateFruitGroup(rot);
        }
        //check player's turn and if they have powerups before activating
        //will only have powerups in 2 player mode, so these should not go off in single player
        if (e.key === '1') {
            //1 is for row
            if (player1.turn && player1.powerups.row.number > 0) {
                player1.powerups.row.number -= 1;
                clearRow();
            } else if (player2.turn && player2.powerups.row.number > 0) {
                player2.powerups.row.number -= 1;
                clearRow();
            }
        } else if (e.key === '2') {
            //2 is for column
            if (player1.turn && player1.powerups.column.number > 0) {
                player1.powerups.column.number -= 1;
                clearCol();
            } else if (player2.turn && player2.powerups.column.number > 0) {
                player2.powerups.column.number -= 1;
                clearCol();
            }
        } else if (e.key === '3') {
            //3 is for color
            if (player1.turn && player1.powerups.all.number > 0) {
                player1.powerups.all.number -= 1;
                clearColor();
            } else if (player2.turn && player2.powerups.all.number > 0) {
                player2.powerups.all.number -= 1;
                clearColor();
            }
        }
    })
})