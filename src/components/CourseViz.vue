<template>
  <v-row class="network">
    <v-col id="viz-container">
      <div id="viz-toolbar" class="mb-4">
        <!-- Info tooltip -->
        <!-- <v-tooltip attach="#viz-container" right>
          <template v-slot:activator="{ on }">
            <v-icon id="viz-user-info" v-on="on"
              >mdi-information-outline</v-icon
            >
          </template>
          <div>Double click on a node to view the course</div>
        </v-tooltip> -->
      </div>

      <div id="viz">
        <v-tooltip
          v-model="courseTooltip"
          attach="#viz"
          content-class="viz-course-tooltip"
        >
          <!-- display tooltip content as raw html -->
          <div v-html="courseTooltipHtml"></div>
          <template v-if="touchInterface">
            <v-btn small @click="onNodeClick(this.courseTooltipCourseId)" class="mt-2 mb-1">
              <v-icon left>mdi-eye</v-icon>
              View course
            </v-btn>
          </template>
        </v-tooltip>
        <svg id="viz-svg" width="100%" height="100%"></svg>
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
      courseTooltipHtml: "",
      courseTooltipCourseId: null,
      touchInterface: false
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

    // Check for touch interface
    // We want to offer a friendly experience to touch device users
    const onTouchStart = () => {
      if (this.touchInterface) {
        document.removeEventListener("touchstart", onTouchStart);
      }
      this.touchInterface = true;
    }

    document.addEventListener("touchstart", onTouchStart);
  },
  watch: {
    courses() {
      this.render();
    }
    // courseTooltip() {
    //   if (this.touchInterface && this.courseTooltip) {
    //     const tooltipEl = document.querySelector(".viz-course-tooltip");
    //     tooltipEl.addEventListener("touchstart", () => {
    //       this.courseTooltip = true;
    //     })
    //   }
    // }
  },
  methods: {
    render() {
      this.$options.graph.render(this.courses, this.linksFiltered);
    },
    showCourseTooltip({ id, name, credits }) {
      const html = `
        <div><strong>${id}</strong></div>
        <div>${name}</div>
        <div>Credits: ${credits}</div>
      `;
      this.courseTooltip = true;
      this.courseTooltipHtml = html;
      this.courseTooltipCourseId = id;
    },
    updateCourseTooltipPosition([x, y]) {
      const tooltip = document.querySelector(".viz-course-tooltip");
      tooltip.style.top = `${y}px`;
      tooltip.style.left = `${x + 20}px`;
    },
    hideCourseTooltip() {
      this.courseTooltip = false;
    },
    onNodeClick(id) {
      // Emit the selectCourse event to the parent component
      this.$emit("selectCourse", id);
      console.log("clicked");
    }
  }
};
</script>

<style scoped>
.network {
  height: calc(100% - 50px);
}

#viz {
  /* position relative to allow absolute positioning of children */
  position: relative;
  height: 100%;
}

#viz-toolbar {
  padding: 0 16px;
}

.viz-course-tooltip {
  /* position tooltip content absolutely */
  position: absolute;
}

text {
  pointer-events: none;
}
</style>
