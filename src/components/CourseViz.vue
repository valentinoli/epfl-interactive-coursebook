<template>
  <v-row class="network">
    <v-col>
      <svg class="main-svg" width="100%" height="100%"></svg>
    </v-col>
  </v-row>
</template>

<script>
// import CourseDetail from "@/components/CourseDetail";
import drawDemoViz from "@/services/demo-viz";

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
      drawDemoViz(this.courses);
    }
  }
};
</script>

<style scoped>
.network {
  height: calc(100% - 50px);
}
</style>
