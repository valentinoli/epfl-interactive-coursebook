// import * as d3 from "d3";
import { select } from "d3-selection";
import { transition } from "d3-transition";
import { easeLinear } from "d3-ease";

export default function drawDemoViz(courses) {
  const svg = select(".main-svg");
  const width = parseFloat(svg.style("width"));
  const height = parseFloat(svg.style("height"));

  const data = courses.map(([key, val]) => ({
    key,
    cx: Math.random() * width,
    cy: Math.random() * height,
    ...val
  }));

  const radiusExpansion = 1.5;

  function onMouseOver({ key }) {
    const el = select(this);
    // el.transition(t)
    el.attr("r", el.attr("r") * radiusExpansion);
    const radius = parseFloat(el.attr("r"));

    // Specify where to put label of text
    svg
    .append("text")
    .text(key)
    .attr("x", parseFloat(el.attr("cx")) + radius)
    .attr("y", parseFloat(el.attr("cy")) + radius)
    .attr("id", `t${key.replace(/[-()]/g, "")}`);
  }

  function onMouseOut({ key }) {
    const el = select(this);
    el.attr("r", el.attr("r") / radiusExpansion);
    svg.select(`#t${key.replace(/[-()]/g, "")}`).remove(); // Remove text location
  }

  const t = transition()
  .duration(1000)
  .ease(easeLinear);

  const circle = svg.selectAll("circle").data(data, d => d.key);

  circle.transition(t).style("fill", "orange");

  circle
  .enter()
  .append("circle")
  .attr("cx", d => d.cx)
  .attr("cy", d => d.cy)
  .style("fill", "green")
  .on("mouseover", onMouseOver)
  .on("mouseout", onMouseOut)
  .transition(t)
  .attr("r", d => Number(d.credits));

  circle
  .exit()
  .style("fill", "red")
  .transition(t)
  .attr("r", 0)
  .remove();
}
