<template>
  <v-row class="network">
    <v-col>
      <svg class="main-svg" width="100%" height="100%">

      </svg>
    </v-col>
  </v-row>
</template>

<script>
// import CourseDetail from "@/components/CourseDetail";
// import * as d3 from "d3";
import { select } from "d3-selection";

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
  mounted () {
    const svg = select(".main-svg");
    const width = parseFloat(svg.style("width"));
    const height = parseFloat(svg.style("height"));

    const crs = Object.values(Object.fromEntries(this.courses));

    const circles = svg.selectAll("circle")
      .data(crs)
      .enter()
        .append("circle")
        .attr("cx", d => width/10 * Math.random() * Number(d.credits))
        .attr("cy", d => height/10 * Math.random() * Number(d.credits))
        .attr("r", d => Number(d.credits))
        .style("fill", "red");

    console.log(circles)
  }
};
</script>

<style scoped>
.network {
  height: calc(100% - 50px);
}
</style>
