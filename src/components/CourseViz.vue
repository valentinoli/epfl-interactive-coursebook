<template>
  <div>
    <div>Insert viz here</div>
    <!-- <svg class="mysvg" width="500" height="500"><circle cx="250" cy="250" r="25" fill="red"></circle></svg> -->
    <v-btn @click="startViz">Start Viz</v-btn>
    <div class="svg-container"></div>
  </div>
</template>

<script>
// import CourseDetail from "@/components/CourseDetail";
import * as d3 from "d3";

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
  data() {
    return {
      selectedCourse: null
    };
  },
  computed: {
    // selectedCourseUrl () {
    //   const { selectedCourse } = this;
    //   if (selectedCourse) {
    //     return `https://edu.epfl.ch${selectedCourse.path}`;
    //   }
    //   return "";
    // },
  },
  methods: {
    // onCourseClicked(code, courseInfo) {
    //   this.selectedCourse = { ...{ code }, ...courseInfo };
    // }
    startViz() {
      d3.select(".svg-container")
        .append("svg")
        .attr("width", "400")
        .attr("height", "400")
        .selectAll("circle")
        .data(Object.values(Object.fromEntries(this.courses)))
        .enter()
        .append("circle")
        .attr("cx", d => Math.random() * 50 * d.credits)
        .attr("cy", d => Math.random() * 100 * d.credits)
        .attr("r", d => Math.random() * d.credits)
        .style("fill", "red");
    }
  }
};
</script>

<style scoped></style>
