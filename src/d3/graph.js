import * as d3 from "d3";

const t = d3
  .transition()
  .duration(1000)
  .ease(d3.easeLinear);

export default class Graph {
  vue;
  svg;
  simulation;
  node;
  link;
  isDragging = false;

  constructor(vue) {
    // We want access to the vue component
    this.vue = vue;

    const container = d3.select("#viz-svg");
    const width = parseFloat(container.style("width"));
    const height = parseFloat(container.style("height"));

    const minX = -width / 2;
    const minY = -height / 2;

    const zoom = d3.zoom().on("zoom", this.zoomed.bind(this));

    const initialScale = 0.15;

    // https://stackoverflow.com/questions/16178366/d3-js-set-initial-zoom-level
    const svg = container
      .append("svg")
      .attr("cursor", "move")
      .attr("viewBox", [minX, minY, width, height])
      .call(zoom);

    this.svg = svg
      // append a <g> to apply the transform globally on all elements
      .append("g")
      // Set initial zoom level
      .attr("transform", `scale(${initialScale}, ${initialScale})`);

    svg
      // Set initial zoom level, calls this.zoomed()
      .call(zoom.transform, d3.zoomIdentity.scale(initialScale));

    // Arrowhead
    this.svg
      .append("defs")
      .append("svg:marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 23)
      .attr("refY", 0)
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .attr("orient", "auto")
      .attr("xoverflow", "visible")
      .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#999")
      .style("stroke", "none");

    this.simulation = d3
      .forceSimulation()
      .force("charge", d3.forceManyBody().strength(-120))
      .force(
        "link",
        d3
          .forceLink()
          .distance(50)
          .strength(0.5)
          .id(d => d.id)
      )
      .force("x", d3.forceX().strength(0.05))
      .force("y", d3.forceY().strength(0.05))
      .on("tick", this.ticked.bind(this));

    this.link = this.svg.append("g").selectAll("line");

    this.node = this.svg
      .append("g")
      .attr("cursor", "grab")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle");
  }

  zoomed() {
    this.svg.attr("transform", d3.event.transform);
  }

  ticked() {
    this.link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    this.node.attr("cx", d => d.x).attr("cy", d => d.y);
  }

  // Click event for node
  click({ id }) {
    this.vue.onNodeClick(id);
  }

  // Mouse events for node tooltip
  mouseover(node, d) {
    if (!this.isDragging) {
      this.vue.showCourseTooltip(d);
      d3.select(node).style("stroke", "black");
    }
  }

  mousemove() {
    if (!this.isDragging) {
      const position = d3.mouse(d3.select("#app").node());
      this.vue.updateCourseTooltipPosition(position);
    }
  }

  mouseleave(node) {
    if (!this.isDragging) {
      this.vue.hideCourseTooltip();
      d3.select(node).style("stroke", "none");
    }
  }

  // Drag events for nodes
  dragstarted(d) {
    if (!d3.event.active) {
      // I don't know what this does, I just copied it
      this.simulation.alphaTarget(0.3).restart();
    }

    // Hide the info tooltip on drag
    this.vue.hideCourseTooltip();

    d.fx = d.x;
    d.fy = d.y;

    this.isDragging = true;
  }

  dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  dragended(d) {
    if (!d3.event.active) {
      // I don't know what this does, I just copied it
      this.simulation.alphaTarget(0);
    }
    d.fx = null;
    d.fy = null;

    this.isDragging = false;
  }

  render(nodes, links) {
    // Make a shallow copy to protect against mutation, while
    // recycling old nodes to preserve position and velocity.
    const old = new Map(this.node.data().map(d => [d.id, d]));
    const newNodes = nodes.map(d => Object.assign(old.get(d.id) || {}, d));
    const newLinks = links.map(d => Object.assign({}, d));

    const nominal_stroke = 1.5;

    /* Links */
    this.link = this.link
      .data(newLinks, d => `${d.source} -> ${d.target}`)
      .join(
        enter =>
          enter
            .append("line")
            .attr("class", "link")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.8)
            .style("stroke-width", nominal_stroke)
            .style("marker-end", "url(#arrowhead)"),

        update => update,
        exit =>
          exit.call(exit =>
            exit
              .transition(t)
              .attr("stroke-opacity", 0)
              .style("marker-end", "none")
              .remove()
          )
      );

    /* Nodes */
    this.node = this.node
      .data(newNodes, d => d.id)
      .join(
        enter =>
          enter
            .append("circle")
            .attr("fill", getNodeColor)
            .call(enter =>
              enter
                .transition(t)
                .attr("r", d => Math.log(Math.pow(Number(d.credits), 7) + 15))
            ),
        update =>
          update.call(update => update.transition(t).attr("fill", "orange")),
        exit =>
          exit.attr("fill", "red").call(exit =>
            exit
              .transition(t)
              .attr("r", 0)
              .remove()
          )
      )
      .attr("class", "node");

    this.node
      .call(
        d3
          .drag()
          .on("start", this.dragstarted.bind(this))
          .on("drag", this.dragged.bind(this))
          .on("end", this.dragended.bind(this))
      )
      .on(
        "mouseover",
        (graph => {
          return function(d) {
            // "this" refers to the node being moused over
            return graph.mouseover.bind(graph, this)(d);
          };
        })(this)
      )
      .on(
        "mousemove",
        (graph => {
          return function(d) {
            return graph.mousemove.bind(graph, this)(d);
          };
        })(this)
      )
      .on(
        "mouseleave",
        (graph => {
          return function(d) {
            return graph.mouseleave.bind(graph, this)(d);
          };
        })(this)
      )
      .on("click", this.click.bind(this));

    this.restartSimulation(newNodes, newLinks);
  }

  restartSimulation(nodes, links) {
    this.simulation.nodes(nodes);
    this.simulation.force("link").links(links);
    this.simulation.alpha(1).restart();
  }
}

function getNodeColor(node) {
  return node.level === 1 ? "red" : "green";
}
