function load_assets(assets, callback){
    let num_assets = assets.length;
    let loaded = function() {
        console.log("assets loaded");
        num_assets = num_assets -1;
        if ( num_assets === 0 ){
            callback();
        }
    };
    for (let asset of assets) {
        let element = asset.var;
        if (element instanceof HTMLImageElement ){
            console.log("img");
            element.addEventListener("load", loaded, false);
        }
        else if (element instanceof HTMLAudioElement ) {
            console.log("audio");
            element.addEventListener("canplaythrough", loaded, false);

        }
        element.src = asset.url;
    }
}

// top answer https://stackoverflow.com/questions/2998784/how-to-output-numbers-with-leading-zeros-in-javascript
function padString(num){ 
    num = num.toString();
    while (num.length < 4){
        num = "0" + num;
    }
    return num;
}

//wasent used but how i figured out promise and async

// function resolveAfter5Seconds() { //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         resolve("resolved");
//       }, 5000);
//     });
// }

///maths help https://www.youtube.com/watch?v=nu2MR1RoFsA&ab_channel=CherryHillMath
//page 3 Coordinate Rotation Formulas https://math.sci.ccny.cuny.edu/document/Rotation+of+Axes#:~:text=Coordinate%20Rotation%20Formulas&text=x%20%3D%20%CB%86xcos%20%CE%B8%20%E2%88%92%20%CB%86y%20sin%CE%B8,x%20sin%CE%B8%20%2B%20y%20cos%20%CE%B8.
function rotateAboutCentre(centre, coordinate, rotationAngle){
    let x = coordinate[0] - centre[0]; //remove diffrence so formula acts like rotation from origen
    let y = coordinate[1] - centre[1];

    let cos = Math.cos(rotationAngle);
    let sin = Math.sin(rotationAngle);

    let rotateX = (x * cos) - (y * sin); //this is slightly diffrent cause for some reason their formula was roating the axis not the coordinates?
    let rotateY = ( x * sin) + (y * cos);

    let newX = rotateX + centre[0]; //add diffrence back
    let newY = rotateY + centre[1];

    return([newX,newY])

}

export {load_assets, padString, rotateAboutCentre};