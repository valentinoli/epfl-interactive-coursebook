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
  graphOpacity = 0.65;
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
    //  const initialScale = 0.8;

    const zoom = d3.zoom().on("zoom", this.zoomed.bind(this));

    // https://stackoverflow.com/questions/16178366/d3-js-set-initial-zoom-level
    const svg = container
      .append("svg")
      .attr("id", "graph_svg")
      .attr("cursor", "move")
      .attr("viewBox", [minX, minY, width, height])
      .call(zoom);

    this.svg = svg
      // append a <g> to apply the transform globally on all elements
      .append("g")
      .attr("id", "graph_g");
    // Set initial zoom level
    //.attr("transform", `scale(${initialScale}, ${initialScale})`);

    // Set initial zoom level, calls this.zoomed()
    //svg.call(zoom.transform, d3.zoomIdentity.scale(initialScale));

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
      .force("charge", d3.forceManyBody().strength(-200))
      .force(
        "link",
        d3
          .forceLink()
          .distance(70)
          .strength(0.5)
          .id(d => d.id)
      )
      .force("x", d3.forceX().strength(0.07))
      .force("y", d3.forceY().strength(0.07))
      .on("tick", this.ticked.bind(this));

    this.link = this.svg.append("g").selectAll("line");
    this.node = this.svg.append("g").selectAll("circle");
  }

  centerGraph(size) {
    const initialScale = 1/Math.log(size);
    const zoom = d3.zoom().on("zoom", this.zoomed.bind(this));
    d3.select("#graph_svg").call(
      zoom.transform,
      d3.zoomIdentity.scale(initialScale)
    );
  }

  zoomed() {
    this.svg.attr("transform", d3.event.transform);
  }

  computeNodeRadius({ credits, registrations, ingoing, outgoing }) {
    switch (this.vue.nodeSizeParam) {
      case "credits": {
        return Math.log(Math.pow(Number(credits), 10) + 30);
      }
      case "registrations": {
        // fallback to 0 when no data available
        let students = 0;
        if (registrations) {
          students = registrations["2019-2020"];
        }
        return Math.log(Math.pow(students, 4) + 100);
      }
      case "indegree": {
        return Math.log(Math.pow(ingoing.length + 2, 10) + 30);
      }
      case "outdegree": {
        return Math.log(Math.pow(outgoing.length + 2, 10) + 30);
      }
      default: {
        // Default size
        return 15;
      }
    }
  }

  computeNodeFill(isEntering, d) {
    const { nodeColorMap: map, nodeColorMapParam: param } = this.vue;

    if (d.ingoingNeighbor || d.outgoingNeighbor) {
      return "grey";
    }

    if (!param) {
      // Default colormap
      return map[isEntering];
    }

    return map[d[param]];
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

  nodeId(id) {
    return id.replace(/[()]/g, "_");
  }

  linkId({ source, target }) {
    if (typeof source === "object") {
      // When the link force is re-initialized after nodes or links change
      // d3 replaces the source and target string ids, with the corresponding
      // node data objects
      // See docs: https://github.com/d3/d3-force#link_links
      return `${this.nodeId(source.id)}--${this.nodeId(target.id)}`;
    }
    return `${this.nodeId(source)}--${this.nodeId(target)}`;
  }

  // Mouse events for nodes
  mouseover(d) {
    if (!this.isDragging) {
      this.vue.showCourseTooltip(d);

      const selectedId = this.nodeId(d.id);
      const selectedNode = d3.select(`#${selectedId}`);
      const {
        ingoing,
        outgoing,
        ingoingNeighbor,
        outgoingNeighbor
      } = selectedNode.datum();

      // If the node is part of the subgraph, we highlight its neighborhood
      if (!ingoingNeighbor && !outgoingNeighbor) {
        const highOpacity = this.graphOpacity + 0.25;
        const lowOpacity = this.graphOpacity - 0.25;

        // First we lower opacity of all nodes and links
        this.node.attr("opacity", lowOpacity);
        this.link
          .attr("stroke-opacity", lowOpacity)
          .attr("opacity", lowOpacity);

        // Then highlight the selected node and its neighborhood nodes and links
        selectedNode.attr("opacity", highOpacity).style("stroke", "#000");
        if (ingoing.length || outgoing.length) {
          const neighborsNodeIds = [...ingoing, ...outgoing].map(
            ({ id }) => `#${this.nodeId(id)}`
          );
          const neighborNodes = d3.selectAll(neighborsNodeIds.join(", "));
          neighborNodes.attr("opacity", highOpacity);

          const neighborsLinkIds = [
            ...ingoing.map(
              ({ id }) => `#${this.linkId({ source: id, target: d.id })}`
            ),
            ...outgoing.map(
              ({ id }) => `#${this.linkId({ source: d.id, target: id })}`
            )
          ];
          const neighborLinks = d3.selectAll(neighborsLinkIds.join(", "));
          neighborLinks
            .attr("stroke-opacity", highOpacity)
            .attr("opacity", highOpacity);
        }
      }
    }
  }

  mousemove() {
    if (!this.isDragging) {
      // The tooltip is attached to the root element #app, so
      // we need to find the position of the mouse relative to this root
      const position = d3.mouse(d3.select("#app").node());

      // We use the window position of the mouse to determine
      // positioning of the tooltip relative to the window to avoid overflow
      const { clientX, clientY } = d3.event;
      this.vue.updateCourseTooltipPosition(position, [clientX, clientY]);
    }
  }

  mouseleave() {
    if (!this.isDragging) {
      this.vue.hideCourseTooltip();

      const { nodeStroke, graphOpacity } = this;
      this.node.attr("opacity", graphOpacity).style("stroke", nodeStroke);
      this.link
        .attr("stroke-opacity", graphOpacity)
        .attr("opacity", graphOpacity);
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

    /* Links */
    this.link = this.link
      .data(newLinks, d => `${d.source} -> ${d.target}`)
      .join(
        enter => enter.append("line"),
        update => update,
        exit =>
          exit.call(exit =>
            exit
              .transition(t)
              .attr("stroke-opacity", 0)
              .attr("opacity", 0)
              .remove()
          )
      )
      .attr("class", "link")
      .attr("id", this.linkId.bind(this))
      .attr("stroke", this.linkStroke)
      .attr("stroke-opacity", this.graphOpacity)
      .attr("opacity", this.graphOpacity)
      .style("stroke-width", 1)
      .style("marker-end", `url(#${this.arrowMarkerId})`);

    /* Nodes */
    this.node = this.node
      .data(newNodes, d => d.id)
      .join(
        enter =>
          enter
            .append("circle")
            .attr("fill", this.computeNodeFill.bind(this, true))
            .attr("r", this.computeNodeRadius.bind(this)),
        update =>
          update.call(update =>
            update
              .transition(t)
              .attr("fill", this.computeNodeFill.bind(this, false))
              .attr("r", this.computeNodeRadius.bind(this))
          ),
        exit =>
          exit.attr("fill", "red").call(exit =>
            exit
              .transition(t)
              .attr("r", 0)
              .remove()
          )
      )
      .attr("class", "node")
      .attr("id", d => this.nodeId(d.id))
      .attr("cursor", "grab")
      .attr("stroke", this.nodeStroke)
      .attr("stroke-width", this.nodeStrokeWidth)
      .attr("opacity", this.graphOpacity);

    this.node
      .call(
        d3
          .drag()
          .on("start", this.dragstarted.bind(this))
          .on("drag", this.dragged.bind(this))
          .on("end", this.dragended.bind(this))
      )
      .on("mouseover", this.mouseover.bind(this))
      .on("mousemove", this.mousemove.bind(this))
      .on("mouseleave", this.mouseleave.bind(this))
      .on("click", this.click.bind(this));

    this.restartSimulation(newNodes, newLinks);
  }

  restartSimulation(nodes, links) {
    this.simulation.nodes(nodes);
    // Associate links to the link force
    this.simulation.force("link").links(links);
    this.simulation.alpha(1).restart();
  }
}
