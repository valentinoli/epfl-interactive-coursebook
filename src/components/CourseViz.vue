<template>
  <v-row class="network">
    <v-col id="viz-container">
      <div id="viz-toolbar" class="mb-4">
        <!-- Info tooltip -->
        <v-tooltip
          attach="#viz-container"
          right
        >
          <template v-slot:activator="{ on }">
            <v-icon id="viz-user-info" v-on="on">mdi-information-outline</v-icon>
          </template>
          <div>Double click on a node to view the course</div>
        </v-tooltip>
      </div>

      <div id="viz-svg">
        <v-tooltip
          v-model="courseTooltip"
          attach="#viz-svg"
          content-class="viz-course-tooltip"
        >
          <!-- display tooltip content as raw html -->
          <div v-html="courseTooltipHtml"></div>
        </v-tooltip>
        <svg id="viz" width="100%" height="100%"></svg>
      </div>
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
  data() {
    return {
      courseTooltip: false,
      courseTooltipHtml: ""
    };
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
    showCourseTooltip(html) {
      this.courseTooltip = true;
      this.courseTooltipHtml = html;
    },
    updateCourseTooltipPosition([x, y]) {
      const tooltip = document.querySelector(".viz-course-tooltip");
      tooltip.style.top = `${y}px`;
      tooltip.style.left = `${x + 20}px`;
    },
    hideCourseTooltip() {
      this.courseTooltip = false;
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

#viz-svg {
  /* position relative to allow absolute positioning of children */
  position: relative;
  height: 100%;
}

.viz-course-tooltip {
  /* position tooltip content absolutely */
  position: absolute;
}

text {
  pointer-events: none;
}
</style>
