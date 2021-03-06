"use strict";
const div = document.getElementById("snake");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", {
    alpha: false,
});
const select = document.getElementById("mode");
const width = div.clientWidth;
const height = div.clientHeight;
canvas.width = width;
canvas.height = height;
const snakeColor = "#5591f2";
const headColor = "#0f5cd9";
const blankColor = "#181818";
const foodColor = "#4bf542";
const mediumSpeed = 80;
const rushStartSpeed = 120;
const rushStopSpeed = 50;
const rushSpeedIncrease = 1;
const crazyFoodLen = 50;
const normalFoodLen = 5;
const startLen = 5; // starting length of snake
let foodLen = normalFoodLen; // length gained by eating food
let speed = +select.value; // snake move speed in ms
let interval = setInterval(move, speed);
let rushInterval;
select.onchange = () => {
    if (select.value == "rush") {
        speed = rushStartSpeed;
        foodLen = normalFoodLen;
    }
    else if (select.value == "crazy") {
        foodLen = crazyFoodLen;
        speed = mediumSpeed;
    }
    else {
        foodLen = normalFoodLen;
        speed = +select.value;
    }
    clearInterval(interval);
    interval = setInterval(move, speed);
    setup();
    select.blur();
};
// get grid and border dimensions
let cols = 40; // temp column count
let rows = 30; // temp row count
const Xstep = width / cols;
const Ystep = height / rows;
const step = (Xstep + Ystep) / 2;
const hb = (width % step) / 2; // horizontal border width
const vb = (height % step) / 2; // vertical border width
cols = Math.floor(width / step);
rows = Math.floor(height / step);
// draw border and fill blank color
ctx.fillStyle = "red";
ctx.fillRect(0, 0, hb, height);
ctx.fillRect(width - hb, 0, hb, height);
ctx.fillRect(0, 0, width, vb);
ctx.fillRect(0, height - vb, width, vb);
ctx.fillStyle = blankColor;
ctx.fillRect(hb, vb, width - 2 * hb, height - 2 * vb);
// uncomment to draw underlying grid
// ctx.strokeStyle = "#000000";
// ctx.lineWidth = 1;
// for (let i = 0; i < rows; i++) {
//   ctx.beginPath();
//   ctx.moveTo(hb, vb + i * step);
//   ctx.lineTo(width - hb, vb + i * step);
//   ctx.stroke();
// }
// for (let i = 0; i < cols; i++) {
//   ctx.beginPath();
//   ctx.moveTo(hb + i * step, vb);
//   ctx.lineTo(hb + i * step, height - vb);
//   ctx.stroke();
// }
let dirX; // current X direction of snake
let dirY; // current Y direction of snake
let tmpX; // updated X direction after queued moves
let tmpY; // updated Y direction after queued moves
let moveQueue = []; // stores all user inputs
// stores all snake node positions, O(1) lookup
const body = Array.from(Array(cols), (_) => Array(rows).fill(false));
let head; // head node
let tail; // tail node
let state; // false = growing, true = steady
let growLen; // target length of snake
let len; // current length of snake
let foodX; // food X position
let foodY; // food Y position
function setup() {
    ctx.fillStyle = blankColor;
    ctx.fillRect(hb, vb, width - 2 * hb, height - 2 * vb);
    if (select.value == "rush")
        speed = rushStartSpeed;
    dirX = 0;
    dirY = 0;
    tmpX = 0;
    tmpY = 0;
    moveQueue = [];
    Array.from(body, (sub) => sub.fill(false));
    head = {
        x: Math.floor(cols / 2),
        y: Math.floor(rows / 2),
        next: null,
    };
    tail = head;
    body[head.x][head.y] = true;
    growLen = startLen;
    len = 1;
    drawSnake(head, headColor);
    state = false;
    foodX = 0;
    foodY = 0;
    genFood();
}
setup();
window.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "ArrowUp":
            if (tmpY != 1) {
                moveQueue.push({ x: 0, y: -1 });
                tmpX = 0;
                tmpY = -1;
            }
            break;
        case "ArrowDown":
            if (tmpY != -1) {
                moveQueue.push({ x: 0, y: 1 });
                tmpX = 0;
                tmpY = 1;
            }
            break;
        case "ArrowLeft":
            if (tmpX != 1) {
                moveQueue.push({ x: -1, y: 0 });
                tmpX = -1;
                tmpY = 0;
            }
            break;
        case "ArrowRight":
            if (tmpX != -1) {
                moveQueue.push({ x: 1, y: 0 });
                tmpX = 1;
                tmpY = 0;
            }
            break;
        default:
            break;
    }
});
// draws snake square with fill color, blank square if c == true
function drawSnake(s, fill, c = false) {
    ctx.fillStyle = !c ? fill : blankColor;
    if (c) {
        ctx.fillRect(hb + s.x * step, vb + s.y * step, step, step);
    }
    else {
        ctx.fillRect(hb + s.x * step + 1, vb + s.y * step + 1, step - 2, step - 2);
    }
}
function move() {
    if (moveQueue.length > 0) {
        let newDir = moveQueue.shift();
        while (newDir.x == dirX && newDir.y == dirY && moveQueue.length > 0) {
            newDir = moveQueue.shift();
        }
        dirX = newDir.x;
        dirY = newDir.y;
    }
    if (dirX == 0 && dirY == 0)
        return;
    const nextX = head.x + dirX;
    const nextY = head.y + dirY;
    // game over if hits walls
    if (nextX == cols || nextX == -1 || nextY == rows || nextY == -1) {
        setup();
        return;
    }
    if (state) {
        body[tail.x][tail.y] = false;
        drawSnake(tail, snakeColor, true);
        tail = tail.next;
    }
    else {
        if (len == growLen) {
            state = true;
        }
        len++;
    }
    // game over if hits snake body
    if (body[nextX][nextY]) {
        setup();
        return;
    }
    drawSnake(head, snakeColor); // move old head color to body color
    if (len == rows * cols) {
        setup();
        return;
    }
    const next = { x: nextX, y: nextY, next: null };
    head.next = next;
    head = next;
    body[head.x][head.y] = true;
    if (nextX == foodX && nextY == foodY) {
        genFood();
        state = false;
        growLen += foodLen - 1;
    }
    drawSnake(head, headColor); // draw head after tail for tail following
}
// draws new random food and clears old one
function genFood() {
    ctx.fillStyle = blankColor;
    ctx.fillRect(hb + foodX * step, vb + foodY * step, step, step);
    let nextX;
    let nextY;
    let valid = false;
    while (!valid) {
        nextX = Math.floor(Math.random() * cols);
        nextY = Math.floor(Math.random() * rows);
        valid = !body[nextX][nextY];
    }
    ctx.fillStyle = foodColor;
    ctx.beginPath();
    ctx.arc(hb + nextX * step + step / 2, vb + nextY * step + step / 2, step / 2 - 3, 0, 2 * Math.PI);
    ctx.fill();
    foodX = nextX;
    foodY = nextY;
    if (select.value == "rush") {
        speed = speed == rushStopSpeed ? speed : speed - rushSpeedIncrease;
        clearInterval(interval);
        interval = setInterval(move, speed);
    }
}
