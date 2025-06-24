import { load_assets, padString, rotateAboutCentre } from "./utils.js";
import { map } from "./map.js";
function racer(raceTrackMap, initialX, initialY){
    let canvas;
    let context;

    let fpsInterval = 1000/30;
    let now;
    let then = Date.now();

    let request_id;

    let keysPressed = [];

    let counter = 0; //used for debugging and animation counting

    let player = {
        x : initialX,
        y: initialY,
        xSize : 20,
        ySize : 50,
        rotationAngle : 0,  //where your pointed
        rotationSpeed : 0,
        image : new Image(),
    }

    let playerCorners = [[0,0],[0,0],[0,0],[0,0],[0,0]]; //xy coordinates of centretopLeft, topRight, bottomLeft , bottomRight

    let twoFrameAgo ;
    let oneFrameAgo ;
    let thisFrameAgo;

    //asset declaration
    let flame1 = new Image();
    let flame2 = new Image();
    let map1 = new Image();

    let moveUp = false;
    let antiClockwise = false;
    let clockwise = false;
    let fastMoveUp = false;
    let isShift = false;

    let xyKey;

    let ySpeed = 0;
    let xSpeed = 0;

    //timer Decleration
    let startTime = null;
    let startEndLine = {
        tlCorner : [initialX - 30,initialY - 20],
        trCorner : [initialX + 50,initialY - 30],
        blCorner : [initialX - 30,initialY + 70],
        brCorner : [initialX + 50,initialY + 70]
    };
    let inStartLine = false;
    let leftStartLine = false;
    let flag = false
    let lapTimeText = null;

    document.addEventListener("DOMContentLoaded", init, false);

    let collisionMap;
    let mapPNG = raceTrackMap

        function init(){
            canvas = document.querySelector("canvas");
            context = canvas.getContext("2d");
            window.addEventListener("keydown", activate, false);
            window.addEventListener("keyup", deactivate, false);

            console.log("init loaded");

            //this bastard took ages all cause collison map wasnt loading in time
            //me 1 week later , not sure if even needed
            //https://developer.mozilla.org/en-US/docs/Glossary/IIFE
            //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
            (async () => {
                console.log("collision Map loading ")
                collisionMap = await map(raceTrackMap);  //THIS is where map IS CHOSEN!!
                console.log("collision Map loading" , collisionMap);
                load_assets([
                    {"var": player.image, "url" : "static/assets/spaceshipbody.png"},
                    {"var" : flame1, "url" : "static/assets/spaceshipflames1.png" },
                    {"var": flame2, "url" : "static/assets/spaceshipflames2.png" },
                    {"var": map1, "url" : ("static/assets/" + mapPNG)}
                ],draw);
            })();
        }

    function draw(){
        request_id = window.requestAnimationFrame(draw);

        if (counter == 30){ //debugger
            // console.log(player.rotationAngle);
            counter = -10;
            console.log("x:" + xyKey.substr(0,4) + " y:" + xyKey.substr(4,8))
            console.log(keysPressed)
        }
        counter += 1;

        let now = Date.now();
        let elapsed = now - then;
        if (elapsed <= fpsInterval) {
            return;
        }
        then = now - (elapsed % fpsInterval);

        inStartLine = (
            player.x >= startEndLine.tlCorner[0] &&
            player.x <= startEndLine.trCorner[0] &&
            player.y >= startEndLine.tlCorner[1] &&
            player.y <= startEndLine.blCorner[1]
        )

        if ((! startTime) && (! inStartLine)){
            startTime = Date.now();
            console.log("Timer started");
            leftStartLine = true;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);

        //rotation drawing
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(map1, 50, 25, canvas.width - 100, canvas.height - 50)
        context.save()
        context.translate(player.x + player.xSize / 2, player.y + player.ySize / 2); //move center of rotate
        context.rotate(player.rotationAngle);
        context.drawImage(player.image, -player.xSize / 2, -player.ySize / 2, player.xSize, player.ySize); //draw img from centre
        if (moveUp && !isShift){
            if (counter > 0){
                context.drawImage(flame1, -player.xSize / 2, player.ySize / 2, player.xSize, 10);
            }
            else{
                context.drawImage(flame2, -player.xSize / 2, player.ySize / 2, player.xSize, 10);
            }
                
        }
        else if(moveUp && isShift){
            if (counter > 0){
                context.drawImage(flame1, -player.xSize / 2, player.ySize / 2, player.xSize, 30);
            }
            else{
                context.drawImage(flame2, -player.xSize / 2, player.ySize / 2, player.xSize, 30);
            }
        }
        context.restore();  
        //startLine
        context.fillStyle = "rgba(205, 27, 27, .5)";
        context.fillRect(
            startEndLine.tlCorner[0],
            startEndLine.tlCorner[1],
            startEndLine.trCorner[0] - startEndLine.tlCorner[0],
            startEndLine.blCorner[1] - startEndLine.tlCorner[1]
        );

        //timer
        //this timer code was done by an Ai as I spent so long on the map collison I forgot i needed to make it a game
        //from here
        context.font = "28px monospace";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = "black";

        let displayText;
        if (leftStartLine && inStartLine) {
            if (!flag) {
                lapTimeText = "Lap Time: " + ((Date.now() - startTime) / 1000).toFixed(2) + "s";
                flag = true;
                        //till here + the else statment displayText
        
                // Send lap time to backend
                // https://flask.palletsprojects.com/en/stable/patterns/javascript/ making fetch request
                 //https://www.freecodecamp.org/news/javascript-fetch-api-for-beginners/#heading-how-to-send-a-post-request-using-the-fetch-api post section
                fetch("/uploadLap", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        lap_time: lapTimeText,
                        map : raceTrackMap
                    })
                })
                .then(response => response.json()) //wait for server
                .then(data => {
                    if (data.success) {
                        console.log("Lap time uploaded:", data.lap_time);
                    } else {
                        console.error("Failed to upload lap time:", data);
                    }
                })
                .catch(error => console.error("Error:", error));
            }
        
            xSpeed = 0;
            ySpeed = 0;
            displayText = lapTimeText;
        } else {
            displayText = "Time: " + ((Date.now() - startTime) / 1000).toFixed(2) + "s";
        }


        if (leftStartLine){
            context.fillText(displayText, (canvas.width / 2), (canvas.height / 2));
        }

        //initialise corners before calling rotate about center/ or it stacks each frame (could be added to rotate about centre in future)
        playerCorners[0] = [//centre
            player.x + (player.xSize / 2), player.y + (player.ySize / 2)];
        playerCorners[1] =[//tl
            player.x, player.y
        ];
        playerCorners[2] =[//tr
            player.x + player.xSize, player.y
        ];
        playerCorners[3] =[//bl
            player.x, player.y + player.ySize
        ];
        playerCorners[4] =[//br
            player.x + player.xSize, player.y + player.ySize
        ];
        //set player corners for collison
        //honestly realy quite proud of my function, programming is way more fun whenits just maths, resources I used are in utils.js rotateAboutCentre
        playerCorners[0] = [
            player.x + (player.xSize / 2), 
            player.y + (player.ySize / 2) ] //centre
        playerCorners[1] = rotateAboutCentre(playerCorners[0], playerCorners[1], player.rotationAngle); //top left
        playerCorners[2] = rotateAboutCentre(playerCorners[0], playerCorners[2], player.rotationAngle);//top right 
        playerCorners[3] = rotateAboutCentre(playerCorners[0], playerCorners[3], player.rotationAngle); //bottom left
        playerCorners[4] =  rotateAboutCentre(playerCorners[0], playerCorners[4], player.rotationAngle);//bottom right



        // context.fillStyle = "purple"; //collsion debugger
        // for (let i = 0; i <= 4; i++){
        //     context.fillRect(playerCorners[i][0], playerCorners[i][1],10,10)
        // }


        //store position 2 frames ago so not stuck in wall when I lower speed, kinda janky fix over summer
        twoFrameAgo = oneFrameAgo;
        oneFrameAgo = thisFrameAgo;
        thisFrameAgo = [player.x, player.y];

        //cornercollison 
        for (let i = 1; i <= 4; i++){
            xyKey = padString(Math.round(playerCorners[i][0])) + padString(Math.round(playerCorners[i][1]))
            let collision = collisionMap.get(xyKey)
            if (collision){
                startTime -= 5000; // Add 5 sec 

                player.rotationSpeed = (-1 * player.rotationSpeed)

                player.x = twoFrameAgo[0];
                player.y = twoFrameAgo[1];
                if (collision.wallType  === "horizontal" ){
                    ySpeed = 0.75 * (ySpeed * -1);
                }
                else if (collision.wallType  === "vertical" ){
                    xSpeed = 0.75 * (xSpeed * -1); 
                }
                else {
                    xSpeed =0.75 * (xSpeed * -1);
                    ySpeed = 0.75 * (ySpeed * -1);
                }
                console.log("collide",xyKey, collision.wallType, "corner", i );
                break;
            }
        }

        //use this for fast
        //https://medium.com/@dovern42/handling-multiple-key-presses-at-once-in-vanilla-javascript-for-game-controllers-6dcacae931b7

        //continuous movement
        player.y = player.y + ySpeed;
        player.x = player.x + xSpeed;
        player.rotationAngle = player.rotationAngle + player.rotationSpeed
        //player movement

        if (moveUp){
            ySpeed = ySpeed + 0.05 * (Math.sin(player.rotationAngle - 1.5708) ); // 1.57 is 90 degrees in radian
            xSpeed = xSpeed + 0.05 * (Math.cos(player.rotationAngle - 1.5708)); //calculations helped by top answer https://math.stackexchange.com/questions/2390443/extracting-x-and-y-values-from-radians
        
            if (isShift){
                ySpeed = ySpeed + 0.15 * (Math.sin(player.rotationAngle - 1.5708) ); 
                xSpeed = xSpeed + 0.15 * (Math.cos(player.rotationAngle - 1.5708)); 
                
            }
        }

        if (clockwise){
            player.rotationSpeed += 0.15 * Math.PI / 180; //rotaion in radians
        }
        if (antiClockwise){
            player.rotationSpeed -= 0.15 * Math.PI / 180; //rotaion in radians
        }

    }

    // document.addEventListener('keydown', (event) => {
    //     console.log(`Key pressed: ${event.key}`);
    // });

    function activate(event) {
        let key = event.key;
        if (event.key === "w" ||
            event.key === "d" ||
            event.key === "a" ||
            event.key === "Shift" ||
            event.preventDefault() 
        )

        if(key === "Shift" ){
            isShift = true;
            if (keysPressed.includes("shift") == false){
                keysPressed.push("shift");
            }  
        }
        if (key === "a" ){
            antiClockwise = true;   
            if (keysPressed.includes("antiClockwise") == false){
                keysPressed.push("antiClockwise");
            }         
        }
        if (key === "d" ){
            clockwise = true;
            if (keysPressed.includes("clockwise") == false){
                keysPressed.push("clockwise");
            }
        }
        if (key === "w"){ 
            moveUp = true;
            if (keysPressed.includes("moveUp") == false){
                keysPressed.push("moveUp");
            }
            
        }
        if (key === "A" ){
            antiClockwise = true;

            if (keysPressed.includes("antiClockwise") == false){
                keysPressed.push("antiClockwise");
            }       
        }
        if (key === "D" ){
            clockwise = true;

            if (keysPressed.includes("clockwise") == false){
                keysPressed.push("clockwise");
            }
        }
        if (key === "W"){ 
            moveUp = true;
            if (keysPressed.includes("moveUp") == false){
                keysPressed.push("moveUp");
            }

        }
  
    }
    function deactivate(event) {
        let key = event.key;

        if (event.key === "Shift") {
            isShift = false;

            keysPressed.splice(keysPressed.indexOf("shift"), 1);
        }
        if (key === "a"){
            antiClockwise = false;

            keysPressed.splice(keysPressed.indexOf("antiClockwise"), 1);
        }
        if (key === "d" ){
            clockwise = false;

            keysPressed.splice(keysPressed.indexOf("antiClockwise"), 1);
        }
        if (key === "w"){
            moveUp = false;
            keysPressed.splice(keysPressed.indexOf("moveUp"), 1);
        }
        if (key === "A" ){
            antiClockwise = false;

            keysPressed.splice(keysPressed.indexOf("antiClockwise"), 1);
        }
        if (key === "D" ){
            clockwise = false;

            keysPressed.splice(keysPressed.indexOf("antiClockwise"), 1);
        }
        if (key === "W"){ 
            moveUp = false;
            keysPressed.splice(keysPressed.indexOf("moveUp"), 1);
        }
        
    }
}
export{racer}
