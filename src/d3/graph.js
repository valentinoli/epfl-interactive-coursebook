// Import d3.event as d3event to avoid conflicts with the window.event global
import { select, selectAll, mouse, event as d3event } from "d3-selection";
import {
  forceManyBody,
  forceX,
  forceY,
  forceSimulation,
  forceLink
} from "d3-force";
import { parseSvg } from "d3-interpolate/src/transform/parse";
import { zoom, zoomIdentity } from "d3-zoom";
import { transition } from "d3-transition";
import { Delaunay } from "d3-delaunay";
import { easeLinear } from "d3-ease";
import { drag } from "d3-drag";

const t = transition()
  .duration(1000)
  .ease(easeLinear);

export default class Graph {
  vue;
  svg;
  simulation;
  node;
  link;
  zoomBehavior;
  voronoi;
  voronoiCell;
  voronoiExtent;
  isDragging = false;
  nodeGroupOpacity = 0.45; // must be smaller than graphOpacity
  graphOpacity = 0.7;
  graphOpacityOffset = 0.25;
  nodeStrokeWidth = 1;
  nodeStroke = "#fff";
  linkStroke = "#999";
  arrowMarkerWidth = 10;
  arrowMarkerId = "arrowmarker";
  container;

  constructor(vue) {
    // We want access to the vue component
    this.vue = vue;
    this.container = select(".svg-container");

    // https://stackoverflow.com/questions/16178366/d3-js-set-initial-zoom-level
    this.zoomBehavior = zoom().on("zoom", this.zoomed.bind(this));

    this.svg = this.container
      .append("svg")
      .attr("class", "svg")
      .attr("cursor", "move")
      .call(this.zoomBehavior);

    this.setSVGViewBox();

    // append a <g> to apply the zoom transform globally on all elements,
    // see zoomed() function
    this.svg_g = this.svg.append("g");

    this.voronoiCell = this.svg_g.append("g").selectAll("path");

    // Arrow markers for directed edges
    const { arrowMarkerWidth: mWidth } = this;
    this.svg_g
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

    this.simulation = forceSimulation()
      .force(
        "charge",
        forceManyBody()
          .strength(-200)
          .distanceMax(1000)
      )
      .force("x", forceX().strength(0.07))
      .force("y", forceY().strength(0.07))
      .force(
        "link",
        forceLink()
          .id(node => node.id) // set node id accessor
          .distance(70) // increase default distance
      )
      .on("tick", this.ticked.bind(this));

    this.link = this.svg_g.append("g").selectAll("line");
    this.node = this.svg_g.append("g").selectAll("circle");
  }

  setSVGViewBox() {
    const { container } = this;

    const width = parseFloat(container.style("width"));

    const minHeight = 400;

    // Compute position of svg container relative to
    // the top-left corner of the document:
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
    const containerTop =
      container.node().getBoundingClientRect().top + window.scrollY;

    // Take into account legend and footer heights:
    const legendHeight = parseFloat(
      select(".legend-panel .v-expansion-panel-header").style("height")
    );
    const footerHeight = parseFloat(select(".v-footer").style("height"));

    // Fix the height of the container relative to the window's inner height
    // to make scrolling disabled unless the viewport is small
    // in which case minHeight is applied:
    const height = Math.max(
      minHeight,
      window.innerHeight - containerTop - legendHeight - footerHeight
    );
    container.style("height", `${height}px`);

    const minX = -width / 2;
    const minY = -height / 2;

    const viewBox = [minX, minY, width, height];

    // Fit SVG into the container
    this.svg.attr("viewBox", viewBox);

    if (this.voronoiExtent) {
      // Recompute the voronoi extent when the svg is resized
      // https://stackoverflow.com/questions/38224875/replacing-d3-transform-in-d3-v4#answer-42063664
      const { scaleX: k, translateX: x, translateY: y } = parseSvg(
        this.svg_g.attr("transform")
      );
      this.setVoronoiExtent({ k, x, y });
    }

    if (this.vue.nodeGroupParam) {
      // Re-render voronoi cell
      this.renderVoronoi();
    }
  }

  getSVGViewBox() {
    return this.svg
      .attr("viewBox")
      .split(",")
      .map(Number);
  }

  centerGraph(numNodes) {
    // Set initial scale depending on the number of nodes in the graph
    // + 1 to avoid division by zero in case
    // there is only one node since log(1) === 0
    const initialScale = 1 / Math.log(numNodes + 1);

    this.svg.call(
      // Set initial zoom level, calls this.zoomed()
      this.zoomBehavior.transform,
      zoomIdentity.scale(initialScale)
    );
  }

  zoomed() {
    // Apply transform on all the svg elements
    this.svg_g.attr("transform", d3event.transform);

    // Reset voronoi diagram extent
    this.setVoronoiExtent(d3event.transform);

    if (this.vue.nodeGroupParam) {
      // Re-render the voronoi cells if grouping is applied
      this.renderVoronoi();
    }
  }

  /* Node radius and fill */
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

  computeNodeFill(d) {
    const {
      nodeColorMap: map,
      nodeColorMapParam: param,
      nodeColorMapNeighborhood: mapHood
    } = this.vue;

    let hoodKey = "";
    if (d.ingoingNeighbor && d.outgoingNeighbor) {
      hoodKey = "both";
    } else if (d.ingoingNeighbor) {
      hoodKey = "ingoing";
    } else if (d.outgoingNeighbor) {
      hoodKey = "outgoing";
    }

    if (hoodKey) {
      return mapHood[hoodKey].color;
    }

    return map[d[param]].color;
  }

  /* Link coordinates */
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

  linkAngleHypotenuse(source, target) {
    /**
     * Computes hypothetical hypotenuse (line length) between
     * node centers using the Pythagorean theorem and an angle
     */
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

  /* Collision detection */
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

  /* Node and link id functions and selection helpers */
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

  selectNodeById(id) {
    return select(`#${this.nodeId(id)}`);
  }

  /* Click event for node */
  click({ id }) {
    this.vue.onNodeClick(id);
  }

  /* Mouse events for nodes */
  mouseenter(d) {
    if (!this.isDragging) {
      this.vue.showCourseTooltip(d);
      const { id, ingoing, outgoing, ingoingNeighbor, outgoingNeighbor } = d;

      const selectedNode = this.selectNodeById(id);

      // If the node is part of the subgraph, we highlight its neighborhood
      if (!ingoingNeighbor && !outgoingNeighbor) {
        const highOpacity = this.graphOpacity + this.graphOpacityOffset;
        const lowOpacity = this.graphOpacity - this.graphOpacityOffset;

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
          const neighborNodes = selectAll(neighborsNodeIds.join(", "));
          neighborNodes.attr("opacity", highOpacity);

          const neighborsLinkIds = [
            ...ingoing.map(
              ({ id }) => `#${this.linkId({ source: id, target: d.id })}`
            ),
            ...outgoing.map(
              ({ id }) => `#${this.linkId({ source: d.id, target: id })}`
            )
          ];
          const neighborLinks = selectAll(neighborsLinkIds.join(", "));
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
      const position = mouse(select("#app").node());

      // We use the window position of the mouse to determine
      // positioning of the tooltip relative to the window to avoid overflow
      const { clientX, clientY } = d3event;
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

  /* Drag events for nodes */
  dragstarted(d) {
    if (!d3event.active) {
      // I don't know what this does, I just copied it
      this.simulation.alphaTarget(0.3).restart();
    }

    const selectedNode = this.selectNodeById(d.id);
    selectedNode.attr("cursor", "grabbing");

    // Hide the info tooltip on drag
    this.vue.hideCourseTooltip();

    d.fx = d.x;
    d.fy = d.y;

    this.isDragging = true;
  }

  dragged(d) {
    d.fx = d3event.x;
    d.fy = d3event.y;
  }

  dragended(d) {
    if (!d3event.active) {
      // I don't know what this does, I just copied it
      this.simulation.alphaTarget(0);
    }
    d.fx = null;
    d.fy = null;

    const selectedNode = this.selectNodeById(d.id);
    selectedNode.attr("cursor", "grab");

    this.isDragging = false;
  }

  /* Node grouping and voronoi diagram functions */
  setVoronoiExtent(transform) {
    // Compute new voronoi extent based on the zoom transform
    // k is the scale, x and y are axes translations
    const { k, x, y } = transform;

    // Get initial extent from the <svg> viewBox attribute
    const [minX, minY, width, height] = this.getSVGViewBox();
    const maxX = minX + width;
    const maxY = minY + height;

    // Compute new extent
    const extentTransformed = [
      minX / k - x / k,
      minY / k - y / k,
      maxX / k - x / k,
      maxY / k - y / k
    ];

    this.voronoiExtent = extentTransformed;
  }

  createVoronoi() {
    return Delaunay.from(
      this.simulation.nodes(),
      d => d.x,
      d => d.y
    ).voronoi(this.voronoiExtent);
  }

  renderVoronoi() {
    const voronoi = this.createVoronoi();
    this.voronoiCell = this.voronoiCell.attr("d", (d, i) =>
      voronoi.renderCell(i)
    );
  }

  updateVoronoi(nodes, param) {
    const { nodeGroupColorMap: cmap } = this.vue;

    this.voronoiCell = this.voronoiCell
      .data(nodes, d => `cell-${param}-${d.id}`)
      .join("path")
      .attr("fill", d => cmap[d[param]].color)
      .attr("stroke", d => cmap[d[param]].color)
      .attr("opacity", this.nodeGroupOpacity)
      .attr("stroke-width", 0);
  }

  updateGroupLinkStrength(param) {
    // Customize link strengths if grouping is applied
    this.simulation
      .force("link")
      .distance(({ source, target }) => {
        if (source[param] === target[param]) {
          return 70;
        }
        return 120;
      })
      .strength(({ source, target }) => {
        if (source[param] === target[param]) {
          // stronger link for links within a group
          return 1;
        }

        // weaker links for links across groups
        return 0.1;
      });
  }

  groupNodes(param) {
    // Moves nodes closer to group on each simulation tick
    const { nodeGroupColorMapCounts: counts } = this.vue;
    const alpha = this.simulation.alpha();
    const coords = {};

    // Sort the nodes' coordinates into groups:
    this.node.each(({ x, y, [param]: p }) => {
      if (!(p in coords)) {
        coords[p] = [];
      }

      coords[p].push({ x, y });
    });

    // Compute the centroid of each group:
    const centroids = {};

    Object.entries(coords).forEach(([group, groupNodes]) => {
      const n = groupNodes.length;

      const [tx, ty] = groupNodes.reduce(
        ([accX, accY], { x, y }) => [accX + x, accY + y],
        [0, 0]
      );

      const cx = tx / n;
      const cy = ty / n;

      centroids[group] = { cx, cy };
    });

    // Don't modify points close to the group centroid:
    // Heuristic method to control group density
    const dists = Object.fromEntries(
      Object.keys(coords).map(key => {
        let dist = Math.min(10 + counts[key], 50);
        if (alpha < 0.1) {
          dist += dist * 100 * (0.1 - alpha);
        }

        return [key, dist];
      })
    );

    // adjust each point if needed towards group centroid:
    this.node.each(d => {
      const { [param]: p, x, y } = d;
      const { cx, cy } = centroids[p];
      const dx = cx - x;
      const dy = cy - y;

      // distance from centroid
      const r = Math.sqrt(dx * dx + dy * dy);

      if (r > dists[p]) {
        d.x = x * 0.9 + cx * 0.1;
        d.y = y * 0.9 + cy * 0.1;
      }
    });
  }

  resetVoronoiGrouping(param) {
    if (param) {
      this.updateGroupLinkStrength(param);
      this.updateVoronoi(this.simulation.nodes(), param);

      // Initial cell rendering, after that rendered on each simulation tick
      this.renderVoronoi();
    } else {
      // No grouping applied, skip rendering voronoi
      this.updateVoronoi([]);
    }
  }

  /* Event handler for simulation tick event */
  ticked() {
    const { nodeGroupParam } = this.vue;
    if (nodeGroupParam) {
      // Only group if grouping is applied
      this.groupNodes(nodeGroupParam);
      this.renderVoronoi();
    }

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

  /* Render */
  renderLinks(links) {
    this.link = this.link
      .data(links, d => `${d.source} -> ${d.target}`)
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
      .attr("stroke-opacity", 1)
      .attr("opacity", 1)
      .style("stroke-width", 1)
      .style("marker-end", `url(#${this.arrowMarkerId})`);
  }

  renderNodes(nodes) {
    this.node = this.node
      .data(nodes, d => d.id)
      .join(
        enter =>
          enter.append("circle").call(enter =>
            enter
              .transition(t)
              .attr("fill", this.computeNodeFill.bind(this))
              .attr("r", this.computeNodeRadius.bind(this))
          ),
        update =>
          update.call(update =>
            update
              // compute node fill and radius in case new parameter is given
              .transition(t)
              .attr("fill", this.computeNodeFill.bind(this))
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
        drag()
          .on("start", this.dragstarted.bind(this))
          .on("drag", this.dragged.bind(this))
          .on("end", this.dragended.bind(this))
      )
      .on("mouseenter", this.mouseenter.bind(this))
      .on("mousemove", this.mousemove.bind(this))
      .on("mouseleave", this.mouseleave.bind(this))
      .on("click", this.click.bind(this));
  }

  restartSimulation(nodes, links) {
    // Set simulation's nodes, associate links
    // to the link force and reset simulation
    this.simulation
      .nodes(nodes)
      .force("link")
      .links(links);

    this.simulation.alpha(1).restart();
  }

  render(n, l) {
    // Make a shallow copy to protect against mutation, while
    // recycling old nodes to preserve position and velocity.
    const old = new Map(this.node.data().map(d => [d.id, d]));
    const nodes = n.map(d => Object.assign(old.get(d.id) || {}, d));
    const links = l.map(d => Object.assign({}, d));

    this.renderLinks(links);
    this.renderNodes(nodes);

    this.restartSimulation(nodes, links);

    this.resetVoronoiGrouping(this.vue.nodeGroupParam);
  }
}
