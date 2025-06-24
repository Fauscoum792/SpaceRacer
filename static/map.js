//first big ol rant, I spent 4 days fucking with async and promises and cocurenncy bullshit not loading correctly before figuring out the 
// problem was that I was checking for black and white when I should have been checking for opacacity (i think the async did help but idk if it was needed (kill me))

import { load_assets, padString } from "./utils.js";
function map(mapPNG){
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
    return new Promise((resolveCollisionMap) => { //doing promise cause js is running before collisionMap is complete
            let canvas;
            let context;
            let collisionMap;
            let mapData;
            let borderCounter = 0;
            
            let map1 = new Image();
            
            
            function init(){
                canvas = document.querySelector("canvas");
                context = canvas.getContext("2d");
            
                load_assets([
                    {"var": map1, "url" : ("static/assets/" + mapPNG)},
                ], draw);
            
            }
            
            function draw(){ //draw map to create collison map
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(map1, 50, 25, canvas.width - 100, canvas.height - 50)
                
                // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData
                let map = context.getImageData(0, 0, canvas.width, canvas.height);

                mapData = map.data;

                //creating a dictionary of rbga values
                collisionMap = new Map(); //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
                let  a, index, xKey, yKey, borderindex, opacity;
            
                for (let yCoordinates = 0; yCoordinates < canvas.height; yCoordinates++ ){
                    for (let xCoordinates = 0; xCoordinates < canvas.width; xCoordinates++ ){
            
                        index = (((yCoordinates * canvas.width) + xCoordinates) * 4) //xy on 2d array
                        a = mapData[index + 3];

                        let xyTuple = [xCoordinates, yCoordinates]
                        
                        xKey = padString(xCoordinates);
                        yKey = padString(yCoordinates);


                        //logic behind this is checking if to check the sourondings of each clear pixel to find border
                        if (a == 0){ //if wall
                            collisionMap.set(xKey + yKey, {
                                wallType : null
                            })
                            
                            //above
                            borderindex = (( ((yCoordinates + 10 ) * canvas.width) + (xCoordinates)) * 4)
                            opacity = mapData[borderindex + 3];
                            if (opacity == 255){ 
                                collisionMap.set(xKey + yKey, {
                                    wallType : "horizontal"
                                })
                            }
                            //below
                            borderindex = (( ((yCoordinates - 10 ) * canvas.width) + (xCoordinates)) * 4)
                            opacity = mapData[borderindex + 3];
                            if (opacity == 255){ 
                                collisionMap.set(xKey + yKey, {
                                    wallType : "horizontal"
                                })
                            }
                            //right 
                            borderindex = (( ((yCoordinates ) * canvas.width) + (xCoordinates + 10 )) * 4)
                            opacity = mapData[borderindex + 3];
                            if(opacity == 255){ 
                                collisionMap.set(xKey + yKey, {
                                    wallType : "vertical"
                                })
                            }
                            //left 
                            borderindex = (( ((yCoordinates ) * canvas.width) + (xCoordinates - 10)) * 4)
                            opacity = mapData[borderindex + 3];
                            if(opacity == 255){ 
                                collisionMap.set(xKey + yKey, {
                                    wallType : "vertical"
                                })
                            }

                        }
                    }
                }
                console.log("collision Map created")
                console.log(borderCounter + " border pixels in image")
                resolveCollisionMap(collisionMap); //wait until collisionMap done till return
            }
            
            if (document.readyState === "loading") { //This line of code I dint write , I got a friend to help because i dont understand DomContent
                document.addEventListener("DOMContentLoaded", init, false);
            } else {
                init(); // Run immediately if DOM already loaded
            }
            //till here
        }
    );
}
export {map};

