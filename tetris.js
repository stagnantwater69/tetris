const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");
const scoreElement = document.getElementById("score");

const ROW = 20;
const COL = COLUMN = 10;
const SQ = squareSize = 20;
const VACANT = "BLACK"; 

const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;

const PIECES = [
    [Z, "red"],
    [S, "green"],
    [T, "yellow"],
    [O, "blue"],
    [L, "purple"],
    [I, "cyan"],
    [J, "orange"]
];

const DROP_INTERVAL = 1000; 

let board = Array.from({ length: ROW }, () => Array(COL).fill(VACANT));
let piece = randomPiece();
let score = 0;
let isGameOverFlag = false;
let dropStartTime = Date.now();
let dropIntervalId;

document.addEventListener("keydown", CONTROL);

function CONTROL(event) {
    if (event.keyCode === KEY_LEFT) {
        piece.moveLeft();
        dropStartTime = Date.now();
    } else if (event.keyCode === KEY_UP) {
        piece.rotate();
        dropStartTime = Date.now();
    } else if (event.keyCode === KEY_RIGHT) {
        piece.moveRight();
        dropStartTime = Date.now();
    } else if (event.keyCode === KEY_DOWN) {
        piece.moveDown();
    }
    
}

function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * SQ, y * SQ, SQ, SQ);

    ctx.strokeStyle = "WHITE";
    ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

function drawBoard() {
    for (let r = 0; r < ROW; r++) {
        for (let c = 0; c < COL; c++) {
            drawSquare(c, r, board[r][c]);
        }
    }
}

function randomPiece() {
    const r = Math.floor(Math.random() * PIECES.length);
    return new Piece(PIECES[r][0], PIECES[r][1]);
}

function Piece(tetromino, color) {
    this.tetromino = tetromino;
    this.color = color;
    this.tetrominoN = 0;
    this.activeTetromino = this.tetromino[this.tetrominoN];
    this.x = 3;
    this.y = -2;
}

Piece.prototype.fill = function (color) {
    for (let r = 0; r < this.activeTetromino.length; r++){
        for (let c = 0; c < this.activeTetromino.length; c++){
            if (this.activeTetromino[r][c]){
                drawSquare(this.x + c, this.y + r, color);
            }
        }
    }
};

Piece.prototype.draw = function () {
    this.fill(this.color);
};

Piece.prototype.unDraw = function () {
    this.fill(VACANT);
};

Piece.prototype.moveDown = function () {
    if (!this.collision(0, 1, this.activeTetromino)){
        this.unDraw();
        this.y++;
        this.draw();
    } else {
        this.lock();
        piece = randomPiece();
    }
};

Piece.prototype.moveRight = function () {
    if (!this.collision(1, 0, this.activeTetromino)){
        this.unDraw();
        this.x++;
        this.draw();
    }
};

Piece.prototype.moveLeft = function () {
    if (!this.collision(-1, 0, this.activeTetromino)){
        this.unDraw();
        this.x--;
        this.draw();
    }
};

Piece.prototype.rotate = function () {
    let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
    let kick = 0;
    
    if (this.collision(0, 0, nextPattern)){
        if (this.x > COL/2){
            kick = -1;
        } else {
            kick = 1;
        }
    }
    
    if (!this.collision(kick, 0, nextPattern)){
        this.unDraw();
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length;
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
    }
};

Piece.prototype.lock = function () {
    for (let r = 0; r < this.activeTetromino.length; r++){
        for (let c = 0; c < this.activeTetromino.length; c++){
            if (!this.activeTetromino[r][c]){
                continue;
            }
            if (this.y + r < 0){
                alert("Game Over");
                isGameOverFlag = true;
                break;
            }
            board[this.y + r][this.x + c] = this.color;
        }
    }
    for (let r = 0; r < ROW; r++){
        let isRowFull = true;
        for (let c = 0; c < COL; c++){
            isRowFull = isRowFull && (board[r][c] !== VACANT);
        }
        if (isRowFull){
            for (let y = r; y > 1; y--){
                for (let c = 0; c < COL; c++){
                    board[y][c] = board[y-1][c];
                }
            }
            for (let c = 0; c < COL; c++){
                board[0][c] = VACANT;
            }
            score += 10;
        }
    }
};

Piece.prototype.collision = function (x, y, piece) {
    for (let r = 0; r < piece.length; r++){
        for (let c = 0; c < piece.length; c++){
            if (!piece[r][c]){
                continue;
            }
            let newX = this.x + c + x;
            let newY = this.y + r + y;
            if (newX < 0 || newX >= COL || newY >= ROW){
                return true;
            }
            if (newY < 0){
                continue;
            }
            if (board[newY][newX] !== VACANT){
                return true;
            }
        }
    }
    return false;
};

function autoDrop() {
    let now = Date.now();
    let delta = now - dropStartTime;
    
    if (delta > DROP_INTERVAL){
        piece.moveDown();
        dropStartTime = Date.now();
    }

    if (!isGameOverFlag){
        requestAnimationFrame(autoDrop);
    }
}

function startGame() {
    drawBoard();
    dropIntervalId = setInterval(autoDrop, DROP_INTERVAL);
}

function gameOver() {
    isGameOverFlag = true;
    clearInterval(dropIntervalId);
    alert("Game Over");
}

function restartGame() {
    board = Array.from({ length: ROW }, () => Array(COL).fill(VACANT));
    piece = randomPiece();
    score = 0;
    isGameOverFlag = false;
    startGame();
}

startGame();
