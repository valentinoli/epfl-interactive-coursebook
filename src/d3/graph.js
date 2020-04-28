import * as d3 from "d3";

function drag(simulation) {
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
}

const t = d3.transition()
  .duration(1000)
  .ease(d3.easeLinear);

let simulation;
let node;
let link;

export function drawGraph(nodes, links) {
  console.log("drawing graph");

  link = link
    .data(links, d => d.id)
    .join(
      enter => enter
        .append("line")
          .call(enter => enter.transition(t)
            .attr("stroke-width", 1)
          ),
      update => update,
      exit => exit
        .call(exit => exit.transition(t)
          .attr("stroke-width", 0).remove()
        )
    );

  node = node
    .data(nodes, d => d.id)
    .join(
      enter => enter
        .append("circle")
        .attr("fill", "green")
        .call(enter => enter.transition(t)
          .attr("r", 5)
        ),
      update => update
        .call(update => update.transition(t)
          .attr("fill", "orange")
        ),
      exit => exit
        .attr("fill", "red")
        .call(exit => exit.transition(t)
          .attr("r", 0)
          .remove()
        )
    );


    node.call(drag(simulation))
    .append("title")
      .text(d => `${d.id} - ${d.name}`);

  simulation = simulation.nodes(nodes)
    .force("link", d3.forceLink(links).id(d => d.id));
}


export function startSimulation(nodes, links) {
  const svg = d3.select(".main-svg");
  const width = parseFloat(svg.style("width"));
  const height = parseFloat(svg.style("height"));

  node = svg.append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    // .selectAll(".node");
    .selectAll("circle");

  link = svg.append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    // .selectAll(".link");
    .selectAll("line");

  console.log(nodes.length, links.length);
  console.log(nodes[0], links[0])

  simulation = d3.forceSimulation(nodes)
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    });

    drawGraph(nodes, links);
}
