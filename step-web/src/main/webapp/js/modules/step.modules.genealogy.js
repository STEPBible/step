function init() {
    
    
    var w = 960,
        h = 500,
        fill = d3.scale.category10(),
        nodes = [{ name: "Abraham", generation: 1, wives : ["Sarah", "Hagar"] , sons : ["Isaac", "Esau"] } ,
                 { name: "Sarah", generation: 1, sons : [ "Isaac" ] }, 
                 { name: "Hagar", generation: 1, sons : [ "Esau" ] }, 
                 { name: "Isaac", generation: 2 } ,
                 { name: "Esau" , generation: 2 }
               ];
    
    
    
    
    var vis = d3.select("body").append("svg:svg")
        .attr("width", w)
        .attr("height", h);
    
    var force = d3.layout.force()
        .nodes(nodes)
//        .links([{ source: nodes[0], target: nodes[1]}  , { source: nodes[0], target: nodes[2]}, 
//        
//        { source: nodes[0], target: nodes[3]},
//        { source: nodes[0], target: nodes[4]},
//
//        
//        { source: nodes[1], target: nodes[3]},
//        { source: nodes[2], target: nodes[4]}
//
//        ])
        .size([w, h])
        .start();
    
    var node = vis.selectAll("circle.node")
        .data(nodes)
      .enter().append("svg:circle")
        .attr("class", "node")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", 18)
        .style("fill", function(d, i) { return fill(i & 3); })
        .style("stroke", function(d, i) { return d3.rgb(fill(i & 3)).darker(2); })
        .style("stroke-width", 1.5)
        .call(force.drag).text(function(d) {
            return d.name; 
           });
    
    vis.style("opacity", 1e-6)
      .transition()
        .duration(1000)
        .style("opacity", 1);
//    
    force.on("tick", function(e) {
    
      // Push different nodes in different directions for clustering.
      var k = 9 * e.alpha;
      nodes.forEach(function(o, i) {
          o.y += o.generation * k;
//          o.x += i & 2 ? k : -k;
      });
    
      node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    });
    
    d3.select("d3").on("click", function() {
      nodes.forEach(function(o, i) {
        o.x += (Math.random() - .5) * 40;
        o.y += (Math.random() - .5) * 40;
      });
      force.resume();
    });
}