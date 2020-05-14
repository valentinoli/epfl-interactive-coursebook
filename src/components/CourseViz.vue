<template>
  <v-row class="network">
    <v-col class="viz-container">
      <svg id="viz" width="100%" height="100%"></svg>
      <div id="tooltip"></div>
    </v-col>
  </v-row>
</template>

<script>
import Graph from "@/d3/graph";

export default {
  name: "CourseViz",
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
    const graph = new Graph(this);
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
    },
    onNodeDblClick({ id }) {
      // Emit the selectCourse event to the parent component
      this.$emit("selectCourse", id);
    }
  }
};
</script>

<style scoped>
.network {
  height: calc(100% - 50px);
}

.viz-container {
  position: relative;
}

#tooltip {
  display: none;
  position: absolute;
  background-color: white;
  border: 1px solid black;
  border-radius: 5px;
  padding: 5px;
}

text {
  pointer-events: none;
}
</style>
