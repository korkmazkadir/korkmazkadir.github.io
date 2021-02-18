var c = document.getElementById("my-canvas");
var ctx = c.getContext("2d");

function drawCircleWithPoints(pointCount, centerX, centerY, radius){

    // gap in radians
    gap = (360 / pointCount) *  (Math.PI/180);
    for(var i=0;i < pointCount;i++){

        xCordinate = centerX + (Math.cos((gap * i) - Math.PI) * radius);
        yCordinate = centerY + (Math.sin((gap * i) - Math.PI) * radius);

        ctx.fillRect( xCordinate, yCordinate, 2, 2 );
    }    

}

function getPointPosition(pointCount, pointIndex, centerX, centerY, radius){
    gap = (360 / pointCount) *  (Math.PI/180);
    xCordinate = centerX + (Math.cos((gap * pointIndex) - Math.PI) * radius);
    yCordinate = centerY + (Math.sin((gap * pointIndex) - Math.PI) * radius);
    return [xCordinate, yCordinate]
}

drawCircleWithPoints(200, 400, 400, 380)


function drawTimesTable(coefficient,pointCount, centerX, centerY, radius){

    for(var i=0;i < pointCount;i++){
        toPointIndex =  (i * coefficient) % pointCount;
        var [fromXPos, fromYPos] = getPointPosition(pointCount, i, centerX, centerY, radius);
        var [toXpos, toYPos] = getPointPosition(pointCount, toPointIndex, centerX, centerY, radius);

        if (i != toPointIndex){
            ctx.moveTo(fromXPos, fromYPos);
            ctx.lineTo(toXpos, toYPos);
            ctx.stroke();
        }

    }
}


drawTimesTable(1.1, 200, 400, 400, 380)

function animate(delayBetweenFrames){

    //Classic :)
    step = 0.05
    
    //golden ratio
    //step = 0.61803398875;

    //PI
    //step=0.14159265359;

    currentCoefficient = 0.0;
    setInterval(function (){
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.beginPath();
        setFillColor(currentCoefficient);
        drawCircleWithPoints(200, 400, 400, 380)
        drawTimesTable(currentCoefficient, 200, 400, 400, 380);
        currentCoefficient += step;
    }, delayBetweenFrames);

}

const maxColorCode = 16777215;
function setFillColor(number){
    const colorNumber = (( Math.round( number * 10 ) ) + 311) % maxColorCode;
    const colorCode = "#" + colorNumber.toString(16);
    ctx.strokeStyle = colorCode;
}


animate(100);
