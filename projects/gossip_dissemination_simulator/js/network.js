/*
var nodes = [].concat(
  d3.range(1).map(function() { return {type: "c"}; }),
  d3.range(4).map(function() { return {type: "a"}; }),
  d3.range(16).map(function() { return {type: "b"}; }),
  d3.range(64).map(function() { return {type: "d"}; }),
  d3.range(256).map(function() { return {type: "e"}; })
);*/


var node;
var simulation;


function drawNetwork(nodes){

    const numberOfNodes = nodes.length;


    var zoom = d3.zoom()
        .scaleExtent([-10, 10])
        .on("zoom", zoomed);


    function zoomed() {
        const currentTransform = d3.event.transform;
        svg.attr("transform", currentTransform);
    }


    var svg = d3.select("svg")
        .append("g")
        .call(zoom);



    node =  svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
        .attr("class", "node")
        .attr("r", function(d) { return d.sizeFactor * 5; })
        .attr("fill", function(d) { return d.getColor(); })

    simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceCollide().radius(5))
        .force("r", d3.forceRadial(function(d) {
            return d.range * numberOfNodes * 0.04;
        }))
        .on("tick", ticked);

    function ticked() {
      node
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    }

}


function updateNetwork(nodes){
  node = node.data(nodes);
  node.exit().remove();
  node.attr("fill", function(d) { return d.getColor(); })
      .attr("r", function(d) { return d.sizeFactor * 5; });

  simulation.nodes(nodes);
  simulation.alpha(1).restart();
}
