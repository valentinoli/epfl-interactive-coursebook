<template>
  <v-row class="network">
    <v-col>
      <svg class="main-svg" width="100%" height="100%"></svg>
    </v-col>
  </v-row>
</template>

<script>
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
    linksFiltered() {
      // Temporary computed value, until we implement this in the API
      const ids = this.courses.map(c => c.id);
      const links = this.links.filter(
        ({ source, target }) => ids.includes(source) && ids.includes(target)
      );
      return links;
    }
  },
  mounted() {
    const graph = new Graph();
    this.$options.graph = graph;

    this.render();
  },
  watch: {
    courses() {
      this.render();
    }
  },
  methods: {
    render() {
      this.$options.graph.render(this.courses, this.linksFiltered);
    }
  }
};
</script>

<style scoped>
.network {
  height: calc(100% - 50px);
}
</style>
