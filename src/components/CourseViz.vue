<template>
  <v-row class="network">
    <v-col>
      <svg class="main-svg" width="100%" height="100%"></svg>
    </v-col>
  </v-row>
</template>

<script>
// import CourseDetail from "@/components/CourseDetail";
// import drawDemoViz from "@/d3/demo-viz";
import { drawGraph, startSimulation } from "@/d3/graph";
import allLinks from "@/d3/links";

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
  computed: {
    nodes () {
      const nodes = this.courses.map(([id, val]) => ({ id, ...val }));
      return nodes;
    },
    links () {
      const ids = this.courses.map(c => c[0]);
      const links = allLinks.filter(
        ({ source, target }) => ids.includes(source) && ids.includes(target)
      );
      const mapped = links.map(l => ({ id: `${l.source} -> ${l.target}`, ...l }));
      console.log(mapped[0]);
      return mapped;
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
    startSimulation(this.nodes, this.links);
    // this.draw();
    console.log("viz component mounted");
  },
  watch: {
    courses() {
      console.log("filter applied", this.links[0]);
      this.draw();
    }
  },
  methods: {
    draw() {
      drawGraph(this.nodes, this.links);
    }
  }
};
</script>

<style scoped>
.network {
  height: calc(100% - 50px);
}
</style>
