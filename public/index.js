"use strict";
const div = document.getElementById("snake");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const width = div.clientWidth;
const height = div.clientHeight;
canvas.width = width;
canvas.height = height;
const snakeColor = "#1874E9";
const blankColor = "#181818";
const foodColor = "#4bf542";
const speed = 100; // ms delay between each snake movement
// get grid and border dimensions
let cols = 50; // temp column count
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
// draw grid
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
let dirX = 0; // 1 = right, -1 = left, 0 = rest
let dirY = 0; // -1 = up, 1 = down, 0 = rest
window.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "ArrowUp":
            if (dirY != 1) {
                dirX = 0;
                dirY = -1;
            }
            break;
        case "ArrowDown":
            if (dirY != -1) {
                dirX = 0;
                dirY = 1;
            }
            break;
        case "ArrowLeft":
            if (dirX != 1) {
                dirX = -1;
                dirY = 0;
            }
            break;
        case "ArrowRight":
            if (dirX != -1) {
                dirX = 1;
                dirY = 0;
            }
            break;
        default:
            break;
    }
});
function drawSnake(s, c = false) {
    ctx.fillStyle = !c ? snakeColor : blankColor;
    if (c) {
        ctx.fillRect(hb + s.x * step, vb + s.y * step, step, step);
    }
    else {
        ctx.fillRect(hb + s.x * step + 1, vb + s.y * step + 1, step - 2, step - 2);
    }
}
let head = {
    x: Math.floor(cols / 2),
    y: Math.floor(rows / 2),
    next: null,
};
let tail = head;
let growLen = 5;
let len = 1;
drawSnake(head);
let state = false; // false = growing, true = steady
let foodX = 0;
let foodY = 0;
genFood();
const interval = setInterval(() => {
    if (dirX == 0 && dirY == 0)
        return;
    const nextX = head.x + dirX;
    const nextY = head.y + dirY;
    // game over if hits walls
    if (nextX == cols || nextX == -1 || nextY == rows || nextY == -1) {
        gameOver();
        return;
    }
    // game over if hits snake body
    let tmp = state ? tail.next : tail;
    while (tmp != null) {
        if (tmp.x == nextX && tmp.y == nextY) {
            gameOver();
            return;
        }
        tmp = tmp.next;
    }
    if (nextX == foodX && nextY == foodY) {
        genFood();
        state = false;
        growLen += 5;
    }
    const next = { x: nextX, y: nextY, next: null };
    head.next = next;
    head = next;
    if (state) {
        drawSnake(tail, true);
        tail = tail.next;
    }
    else {
        if (len == growLen) {
            state = true;
        }
        else {
            len++;
        }
    }
    drawSnake(head); // draw head after tail for tail following
}, speed);
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
        let tmp = state ? tail.next : tail;
        valid = true;
        while (tmp != null) {
            if (tmp.x == nextX && tmp.y == nextY) {
                valid = false;
                break;
            }
            tmp = tmp.next;
        }
    }
    // why isn't there a fillCircle function?
    ctx.fillStyle = foodColor;
    ctx.beginPath();
    ctx.arc(nextX * step + (3 / 4) * step, // don't ask
    nextY * step + (7 / 8) * step, // don't ask
    step / 2 - 3, 0, 2 * Math.PI);
    ctx.fill();
    foodX = nextX;
    foodY = nextY;
}
function gameOver() {
    ctx.fillStyle = blankColor;
    ctx.fillRect(hb, vb, width - 2 * hb, height - 2 * vb);
    dirX = 0;
    dirY = 0;
    head = {
        x: Math.floor(cols / 2),
        y: Math.floor(rows / 2),
        next: null,
    };
    tail = head;
    growLen = 5;
    len = 1;
    drawSnake(head);
    state = false;
    genFood();
}