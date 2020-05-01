<template>
  <v-row class="network">
    <v-col>
      <svg class="main-svg" width="100%" height="100%"></svg>
    </v-col>
  </v-row>
</template>

<script>
import drawDemoViz from "@/d3/demo-viz";

export default {
  name: "DemoViz",
  props: {
    courses: {
      type: Array,
      default: () => []
    }
  },
  mounted() {
    this.render();
  },
  watch: {
    courses() {
      this.render();
    }
  },
  methods: {
    render() {
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
