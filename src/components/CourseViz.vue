<template>
  <v-row class="network">
    <v-col>
      <svg class="main-svg" width="100%" height="100%"></svg>
    </v-col>
  </v-row>
</template>

<script>
// import drawDemoViz from "@/d3/demo-viz";
import Graph from "@/d3/graph";

export default {
  name: "CourseViz",
  components: {},
  props: {
    courses: {
      type: Array,
      default: () => []
    },
    links: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    nodes() {
      const nodes = this.courses.map(([id, val]) => ({ id, ...val }));
      return nodes;
    },
    linksFiltered() {
      // Temporary computed value, until we implement this in the API
      const ids = this.courses.map(c => c[0]);
      const links = this.links.filter(
        ({ source, target }) => ids.includes(source) && ids.includes(target)
      );
      return links;
    }
  },
  mounted() {
    console.log("viz component mounted");

    const graph = new Graph();
    this.$options.graph = graph;

    this.render();
  },
  watch: {
    courses() {
      console.log("filter applied");
      this.render();
    }
  },
  methods: {
    render() {
      this.$options.graph.render(this.nodes, this.linksFiltered);
    }
  }
};
</script>

<style scoped>
.network {
  height: calc(100% - 50px);
}
</style>
