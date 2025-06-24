let canvas;
let context;
import { load_assets } from "./utils.js";

let fpsInterval = 1000/30;
let now;
let then = Date.now();

let request_id;

let counter = 0; //used for debugging and animation counting

let player = {
    x : 100,
    y: 150,
    xSize : 20,
    ySize : 50,
    xChange : 10, //left right move
    yChange : 10,  //up down move
    rotationAngle : 0,  //where your pointed
    rotationSpeed : 0,
    image : new Image()
}
//asset declaration
let flame1 = new Image();
let flame2 = new Image();

let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;
let antiClockwise = false;
let clockwise = false;

let ySpeed = 0;
let xSpeed = 0;
let xAcceleration = 0;
let yAcceleration = 0.80; 
document.addEventListener("DOMContentLoaded", init, false);

function init(){
    canvas = document.querySelector("canvas");
    context = canvas.getContext("2d");
    window.addEventListener("keydown", activate, false);
    window.addEventListener("keyup", deactivate, false);
    
    load_assets([
        {"var": player.image, "url" : "static/assets/spaceshipbody.png"},
        {"var" : flame1, "url" : "static/assets/spaceshipflames1.png" },
        {"var": flame2, "url" : "static/assets/spaceshipflames2.png" }
    ], draw);
    
}

function draw(){
    request_id = window.requestAnimationFrame(draw);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (counter == 5){ //debugger
        console.log(player.rotationAngle);
        counter = -5;
    }
    counter += 1;

    //rotation drawing
    context.save()
    context.translate(player.x + player.xSize / 2, player.y + player.ySize / 2); //move center of rotate
    context.rotate(player.rotationAngle);
    context.drawImage(player.image, -player.xSize / 2, -player.ySize / 2, player.xSize, player.ySize); //draw img from centre
    if (moveUp){
        if (counter > 0){
            context.drawImage(flame1, -player.xSize / 2, player.ySize / 2, player.xSize, 10);
        }
        else{
            context.drawImage(flame2, -player.xSize / 2, player.ySize / 2, player.xSize, 10);
        }
            
    }
    context.restore();

    //wall collision
    if (player.y + player.ySize > canvas.height) {
        player.y = canvas.height - player.ySize; //prevents going out of bounds(player size makes it less visible when outta bounds)
        ySpeed =  (ySpeed * -1);
    }
    else if (player.y <= 0 ){
        player.y = player.xSize;
        ySpeed =   (ySpeed * -1);
    }
    else if (player.x + player.xSize >= canvas.width){
        player.x = canvas.width - player.xSize;
        xSpeed =  (xSpeed * -1);
    }
    else if (player.x <= 0){
        player.x = player.xSize;
        xSpeed =  (xSpeed * -1);
    }

    //continuous movement
    player.y = player.y + ySpeed ;
    player.x = player.x + xSpeed;
    player.rotationAngle = player.rotationAngle + player.rotationSpeed

    //player movement
    if (moveUp){
        ySpeed = ySpeed + 0.1 * (Math.sin(player.rotationAngle - 1.5708) ); // 1.57 is 90 degrees in radian
        xSpeed = xSpeed + 0.1 * (Math.cos(player.rotationAngle - 1.5708)); //calculations helped by top answer https://math.stackexchange.com/questions/2390443/extracting-x-and-y-values-from-radians
    }
    if (clockwise){
        player.rotationSpeed += 0.15 * Math.PI / 180; //rotaion in radians
    }
    if (antiClockwise){
        player.rotationSpeed -= 0.15 * Math.PI / 180; //rotaion in radians
    }

}
function activate(event) {
    let key = event.key;
    if (event.key === "ArrowLeft" ||
        event.key === "ArrowRight" ||
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "d" ||
        event.key === "a" ||
        event.preventDefault() 
    )
    if (key === "a" ){
        antiClockwise = true;
    }
    if (key === "d" ){
        clockwise = true;
    }
    if (key === "w"){ 
        moveUp = true;
    }
    // if (key === "s" ){
    //     moveDown = true;
    // }
    // if (key === "ArrowLeft"){
    //     antiClockwise = true;
    // }
    // if (key === "ArrowRight"){
    //     clockwise = true;
    // }
}
function deactivate(event) {
    let key = event.key;
    if (key === "a"){
        antiClockwise = false;
    }
    if (key === "d" ){
        clockwise = false;
    }
    if (key === "w"){
        moveUp = false;
    }
    // if (key === "s"  ){
    //     moveDown = false;
    // }
    // if (key === "ArrowLeft"){
    //     antiClockwise = false;
    // }
    // if (key === "ArrowRight"){
    //     clockwise = false;
    // }
}
function stop() {
    window.removeEventListener("keydown", activate);
    window.removeEventListener("keyup", deactivate)
    window.cancelAnimationFrame(request_id)
}
