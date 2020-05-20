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
  nodeOpacity = 0.5;
  nodeStrokeWidth = 1;
  nodeStroke = "#fff";
  linkStroke = "#999";
  arrowMarkerWidth = 10;
  arrowMarkerId = "arrowmarker";

  constructor(vue) {
    // We want access to the vue component
    this.vue = vue;

    const container = d3.select("#viz-svg");
    const width = parseFloat(container.style("width"));
    const height = parseFloat(container.style("height"));

    const minX = -width / 2;
    const minY = -height / 2;

    const zoom = d3.zoom().on("zoom", this.zoomed.bind(this));

    const initialScale = 0.175;

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

    // Arrow markers for directed edges
    const { arrowMarkerWidth: mWidth } = this;
    this.svg
      .append("defs")
      .append("marker")
      .attr("id", this.arrowMarkerId)
      .attr("viewBox", [0, -mWidth / 2, mWidth, mWidth])
      .attr("refX", 0)
      .attr("refY", 0)
      .attr("markerWidth", mWidth)
      .attr("markerHeight", mWidth)
      .attr("orient", "auto")
      .attr("xoverflow", "visible")
      .append("path")
      .attr("d", `M 0,${-mWidth / 2} L ${mWidth},0 L 0,${mWidth / 2}`)
      .attr("fill", this.linkStroke)
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
      .force("x", d3.forceX().strength(0.2))
      .force("y", d3.forceY().strength(0.2))
      .on("tick", this.ticked.bind(this));

    this.link = this.svg.append("g").selectAll("line");
    this.node = this.svg.append("g").selectAll("circle");
  }

  zoomed() {
    this.svg.attr("transform", d3.event.transform);
  }

  computeNodeRadius({ credits }) {
    return Math.log(Math.pow(Number(credits), 7) + 30);
  }

  linkClipHypotenuseFromSource(source, hypotenuse) {
    const nodeRadius = this.computeNodeRadius(source);
    const offset = nodeRadius + this.nodeStrokeWidth / 2;
    return hypotenuse - offset;
  }

  linkClipHypotenuseFromTarget(target, hypotenuse) {
    const nodeRadius = this.computeNodeRadius(target);
    const offset =
      nodeRadius + this.arrowMarkerWidth + this.nodeStrokeWidth / 2;
    return hypotenuse - offset;
  }

  /**
   * Computes hypothetical hypotenuse (line length) between
   * node centers using the Pythagorean theorem and an angle
   */
  linkAngleHypotenuse(source, target) {
    const xDiff = Math.abs(source.x - target.x);
    const yDiff = Math.abs(source.y - target.y);

    const hypotenuse = Math.sqrt(xDiff ** 2 + yDiff ** 2);

    const angle = Math.asin(yDiff / hypotenuse);

    return { angle, hypotenuse };
  }

  linkX2({ source, target }) {
    if (source.x === target.x) {
      return source.x;
    }

    const { angle, hypotenuse } = this.linkAngleHypotenuse(source, target);
    const clippedHypotenuse = this.linkClipHypotenuseFromTarget(
      target,
      hypotenuse
    );

    // Compute transformed x-coordinate
    const newXDiff = Math.cos(angle) * clippedHypotenuse;
    if (target.x > source.x) {
      return source.x + newXDiff;
    } else {
      return source.x - newXDiff;
    }
  }

  linkY2({ source, target }) {
    if (source.y === target.y) {
      return source.y;
    }

    const { angle, hypotenuse } = this.linkAngleHypotenuse(source, target);
    const clippedHypotenuse = this.linkClipHypotenuseFromTarget(
      target,
      hypotenuse
    );

    // Compute transformed y-coordinate
    const newYDiff = Math.sin(angle) * clippedHypotenuse;
    if (target.y > source.y) {
      return source.y + newYDiff;
    } else {
      return source.y - newYDiff;
    }
  }

  linkX1({ source, target }) {
    if (source.x === target.x) {
      return source.x;
    }

    const { angle, hypotenuse } = this.linkAngleHypotenuse(source, target);
    const clippedHypotenuse = this.linkClipHypotenuseFromSource(
      source,
      hypotenuse
    );

    // Compute transformed x-coordinate
    const newXDiff = Math.cos(angle) * clippedHypotenuse;
    if (source.x > target.x) {
      return target.x + newXDiff;
    } else {
      return target.x - newXDiff;
    }
  }

  linkY1({ source, target }) {
    if (source.y === target.y) {
      return source.y;
    }

    const { angle, hypotenuse } = this.linkAngleHypotenuse(source, target);
    const clippedHypotenuse = this.linkClipHypotenuseFromSource(
      source,
      hypotenuse
    );

    // Compute transformed y-coordinate
    const newYDiff = Math.sin(angle) * clippedHypotenuse;
    if (source.y > target.y) {
      return target.y + newYDiff;
    } else {
      return target.y - newYDiff;
    }
  }

  nodeCollision({ source, target }) {
    // Checks the closeness of source and target, and returns a boolean
    // indicating whether the link should be visible
    const sourceRadius = this.computeNodeRadius(source);
    const targetRadius = this.computeNodeRadius(target);
    const { hypotenuse } = this.linkAngleHypotenuse(source, target);
    const limit =
      sourceRadius +
      targetRadius +
      this.arrowMarkerWidth +
      this.nodeStrokeWidth;
    return hypotenuse < limit;
  }

  ticked() {
    this.link
      .attr("x1", this.linkX1.bind(this))
      .attr("y1", this.linkY1.bind(this))
      .attr("x2", this.linkX2.bind(this))
      .attr("y2", this.linkY2.bind(this))
      .attr("stroke", d => {
        const collision = this.nodeCollision.bind(this)(d);
        if (collision) {
          return null;
        }

        return this.linkStroke;
      })
      .style("marker-end", d => {
        const collision = this.nodeCollision.bind(this)(d);
        if (collision) {
          return null;
        }

        return `url(#${this.arrowMarkerId})`;
      });

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
      d3.select(node)
        .attr("opacity", 0.75)
        .style("stroke", "#000");
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
      d3.select(node)
        .attr("opacity", this.nodeOpacity)
        .style("stroke", this.nodeStroke);
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

  render({
    subgraphNodes,
    ingoingNodes,
    outgoingNodes,
    subgraphLinks,
    ingoingLinks,
    outgoingLinks
  }) {
    const allNodes = [...subgraphNodes, ...ingoingNodes, ...outgoingNodes];
    const allLinks = [...subgraphLinks, ...ingoingLinks, ...outgoingLinks];

    // Make a shallow copy to protect against mutation, while
    // recycling old nodes to preserve position and velocity.
    const old = new Map(this.node.data().map(d => [d.id, d]));
    const newNodes = allNodes.map(d => Object.assign(old.get(d.id) || {}, d));
    const newLinks = allLinks.map(d => Object.assign({}, d));

    /* Links */
    this.link = this.link
      .data(newLinks, d => `${d.source} -> ${d.target}`)
      .join(
        enter =>
          enter
            .append("line")
            .attr("class", "link")
            .attr("stroke", this.linkStroke)
            .style("stroke-width", 1)
            .style("marker-end", `url(#${this.arrowMarkerId})`),

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
            .attr("fill", d => (d.ingoing || d.outgoing ? "grey" : "green"))
            .call(enter =>
              enter.transition(t).attr("r", this.computeNodeRadius)
            ),
        update =>
          update.call(update =>
            update
              .transition(t)
              .attr("fill", d => (d.ingoing || d.outgoing ? "grey" : "orange"))
          ),
        exit =>
          exit.attr("fill", "red").call(exit =>
            exit
              .transition(t)
              .attr("r", 0)
              .remove()
          )
      )
      .attr("cursor", "grab")
      .attr("stroke", this.nodeStroke)
      .attr("stroke-width", this.nodeStrokeWidth)
      .attr("opacity", this.nodeOpacity)
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
