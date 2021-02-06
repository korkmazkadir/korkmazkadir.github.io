
const nodeCount = 70;
const unitCost = 1.6;
const fanOut = 6;
const enableFanouts = false;

//alert("Press right-arrow key to increment the round!"); 

var nodes = [];
var root = null;


function countValues(nodes){
    var counts = {};

    for(var i = 0; i < nodes.length; i++){
        const value = nodes[i].getValue();
        
        //if (value == 0){
        //    continue;
        //}

        if (counts[value] == undefined ){
            counts[value] = 0;
        }
        counts[value]++;
    }

    return counts;
}

console.log("The number of nodes is " + nodes.length);
console.log("The unit cost is " + unitCost);
console.log("Fan-out is " + fanOut);
console.log("The number of rounds is " + round);

console.log("Counts are " + JSON.stringify(countValues(nodes), null, 2) )

console.log("The average cost is " + calculateCost(countValues(nodes), unitCost))

function calculateCost( counts, unitCost ){
    
    var sum = 0;
    for (const [key, value] of Object.entries(counts)) {
        console.log(key + " x " + value + " x 1.6 = " +  key * value * unitCost);
        sum +=  unitCost * key * value; 
    }

    console.log("sum is " + sum)
    console.log("node count is " + nodeCount)

    return (sum / nodes.length );
}





var round = 0;
function disseminate(){
    while (nodes.length < nodeCount){
        round++;
    
        var newNodes = [];
        for(var i = 0; i < nodes.length; i++){
            node = nodes[i];
    
            const lastChildValue = node.getLastChildValue();
            const n = new TreeNode(lastChildValue  + 1);
            node.addChild(n);
    
            newNodes.push(n);
    
            if ( (newNodes.length + nodes.length) == nodeCount ){
                break;
            }
    
        }
    
        nodes = nodes.concat(newNodes);
        return;
    }
}


function goNextRound(){
    if (nodes.length == nodeCount){
        reset();
        showInfo();
        return;
    }

    disseminate();
    drawTree();
    showInfo();
}


document.onkeydown = function() {
    switch (window.event.keyCode) {
        case 37:
            console.log("Left key pressed");
         break;
        case 39:
            goNextRound();
         break;
    }
};


document.getElementById("btnNextRound").onclick = function () {
    goNextRound();
};


function drawTree(){
    treeData = [ JSON.parse(JSON.stringify(root)) ];
    update(treeData[0]);
}

function reset(){
    round = 0;
    nodes = []
    root = new TreeNode(0)
    nodes.push(root)
    drawTree()
}

reset();


const numberOfNodesElement = document.getElementById("numberOfNodes");
const unitCostElement = document.getElementById("unitCost");
const roundElement = document.getElementById("round");
const numberOfBlockDeliveryElement = document.getElementById("numberOfBlockDelivery");
const avgPropagationDelayElement = document.getElementById("avgPropagationDelay");

function showInfo(){
    numberOfNodesElement.textContent = nodeCount;
    unitCostElement.textContent = unitCost + " (for 4MB Blocks)";
    roundElement.textContent = round;
    numberOfBlockDeliveryElement.textContent = nodes.length;
    const cost = calculateCost(countValues(nodes), unitCost)
    avgPropagationDelayElement.textContent = Number(cost.toFixed(2)) ;
}


showInfo();