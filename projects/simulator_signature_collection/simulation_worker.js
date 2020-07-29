function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}


function getRandomUniqueNumbers(min, max, length, exclude){
    const result = [];

    while(result.length < length){
        const number = getRandomInt( min, max );
        const isInResult = result.find( x=> x === number);
        if(isInResult === undefined && number != exclude){
            result.push( number );
        }
    }

    return result;
}


onmessage = function(e) {
    console.log('Node list is received from main script');
    const nodes =  e.data[0];
    const signatureCount =  e.data[1];
    const iterationCount = e.data[2];

    run(nodes, signatureCount, iterationCount);
}


function isAllTrue(nodes, signatureSample){

    for(const signature of signatureSample){
        if(nodes[signature] == false){
            return false;
        }
    }

    return true;
}

function isAllFalse(nodes, signatureSample){

    for(const signature of signatureSample){
        if(nodes[signature] == true){
            return false;
        }
    }

    return true;
}


function run( nodes, signatureCount, iterationCount){

    for(var i = 0; i < iterationCount; i++){

        const stats = {
            successfulCorrectNodeCount: 0,
            successfulFaultyNodeCount: 0,
        };

        nodes.forEach((node, index) => {
            
            const signatureSample = getRandomUniqueNumbers(0, nodes.length, signatureCount, index )

            if(node == true && isAllTrue(nodes,signatureSample)){
                stats.successfulCorrectNodeCount++;
            }else if(node == false && isAllFalse(nodes,signatureSample) ){
                stats.successfulFaultyNodeCount++;
            }
            
        });

        postMessage(stats);

    }

}

