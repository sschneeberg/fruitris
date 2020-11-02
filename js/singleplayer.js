//create objects and rule sets

let fruitGroup = [];
const movement = 10;
const gameOver = false;

class Fruit {
    constructor(x, y, color) {
        //all fruit have radius 23 (take up a 50x50 square with some padding) and sAngle 0, eAngle 2Pi
        this.x = x;
        this.y = y;
        this.color = color;
        this.r = 23;
        this.sAngle = 0;
        this.eAngle = 2 * Math.PI;
    }

    render() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, this.sAngle, this.eAngle);
        ctx.fill();
    }
}


function createFruitGroup(x, y, n) {
    let colors = ['red', 'green', 'blue', 'yellow']
    while (n > 0) {
        let index = Math.floor(Math.random() * colors.length);
        let color = colors[index];

        const fruit = new Fruit(x, y, color);
        fruitGroup.push(fruit);
        y = y - 50;
        n = n - 1;
    }
    return fruitGroup;
}

function drawFruitGroup() {
    //for now they'll always start in the middle above the canvas and always be groups of 3
    const startX = canvas.width / 2;
    const startY = -25;
    const n = 3;
    //make new fruit group
    fruitGroup = createFruitGroup(startX, startY, n);

    for (fruit of fruitGroup) {
        fruit.render();
    }
}

function moveFruitGroup() {
    for (fruit of fruitGroup) {
        fruit.y = fruit.y + movement;
    }

}

function rePaint() {
    if (!gameOver) {
        //clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //re render
        for (fruit of fruitGroup) {
            fruit.render();
        }
    }
}

//Set up Canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const computedStyle = getComputedStyle(canvas);
const height = computedStyle.height;
const width = computedStyle.width;
canvas.setAttribute('height', height);
canvas.setAttribute('width', width);


//React to player input
document.addEventListener('DOMContentLoaded', function() {
    //on start and when the previous fruit group hits
    drawFruitGroup();
    setInterval(moveFruitGroup, 500);
})

setInterval(rePaint, 80);