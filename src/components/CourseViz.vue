<template>
  <v-row class="network">
    <v-col>
      <svg class="main-svg" width="100%" height="100%"></svg>
    </v-col>
  </v-row>
</template>

<script>
// import CourseDetail from "@/components/CourseDetail";
// import * as d3 from "d3";
import { select } from "d3-selection";
import { transition } from "d3-transition";
import { easeLinear } from "d3-ease";

export default {
  name: "CourseViz",
  components: {
    // CourseDetail
  },
  props: {
    courses: {
      type: Array,
      default: () => []
    }
  },
  // data() {
  //   return {
  //     selectedCourse: null
  //   };
  // },
  // computed: {
  // selectedCourseUrl () {
  //   const { selectedCourse } = this;
  //   if (selectedCourse) {
  //     return `https://edu.epfl.ch${selectedCourse.path}`;
  //   }
  //   return "";
  // },
  // },
  // method: {
  // onCourseClicked(code, courseInfo) {
  //   this.selectedCourse = { ...{ code }, ...courseInfo };
  // }
  // },
  mounted() {
    this.draw();
    console.log("viz component mounted");
  },
  watch: {
    courses() {
      console.log("filter applied");
      this.draw();
    }
  },
  methods: {
    draw() {
      const svg = select(".main-svg");
      const width = parseFloat(svg.style("width"));
      const height = parseFloat(svg.style("height"));

      const courses = this.courses.map(([key, val]) => ({
        key,
        cx: Math.random() * width,
        cy: Math.random() * height,
        ...val
      }));

      // We're passing in a function in d3.max to tell it what we're maxing (x value)
      // const xScale = d3.scaleLinear()
      //   // .domain([0, d3.max(courses, d => d.cx)])
      //   .range([0, width]);
      //
      // // We're passing in a function in d3.max to tell it what we're maxing (y value)
      // const yScale = d3.scaleLinear()
      //   // .domain([0, d3.max(courses, d => d.cy)])
      //   .range([0, height]);
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

        console.log(key);
      }

      function onMouseOut({ key }) {
        const el = select(this);
        el.attr("r", el.attr("r") / radiusExpansion);
        console.log(key);
        svg.select(`#t${key.replace(/[-()]/g, "")}`).remove(); // Remove text location
      }

      const t = transition()
        .duration(1000)
        .ease(easeLinear);

      const circle = svg.selectAll("circle").data(courses, d => d.key);

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
  }
};
</script>

<style scoped>
.network {
  height: calc(100% - 50px);
}
</style>
