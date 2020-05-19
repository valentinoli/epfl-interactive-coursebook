<template>
  <v-row class="network">
    <v-col id="viz-container">
      <div id="viz-toolbar" class="mb-4">
        <!-- Tools soon to be added -->
      </div>

      <div id="viz">
        <v-tooltip
          v-model="courseTooltip"
          attach="#viz"
          content-class="viz-course-tooltip"
        >
          <!-- display tooltip content as raw html -->
          <div v-html="courseTooltipHtml"></div>

          <!-- content specific to touch interfaces -->
          <template v-if="touchInterface">
            <v-btn
              small
              @click="$emit('selectCourse', courseTooltipCourseId)"
              class="mt-2 mb-1"
            >
              <v-icon left>mdi-eye</v-icon>
              View course
            </v-btn>
          </template>
        </v-tooltip>
        <div id="viz-svg"></div>
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
      courseTooltip: true,
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

      // Tooltip should be clickable
      const tooltipEl = document.querySelector(".viz-course-tooltip");
      tooltipEl.addEventListener("click", evt => {
        evt.stopPropagation();
        this.courseTooltip = true;
      });
    };

    document.addEventListener("touchstart", onTouchStart);
    this.courseTooltip = false;
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
    showCourseTooltip({ id, name, credits }) {
      const html = `
        <div><strong>${id}</strong></div>
        <div>${name}</div>
        <div>Credits: ${credits}</div>
      `;
      this.courseTooltipHtml = html;
      this.courseTooltipCourseId = id;
      this.courseTooltip = true;
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
      // Do nothing if user has a touch interface
      // (instead he can select the link in the tooltip)
      if (!this.touchInterface) {
        // Emit the selectCourse event to the parent component
        this.$emit("selectCourse", id);
      }
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

#viz-svg {
  width: 100%;
  height: 100%;
  /* max-width: 1300px; */
  /* overflow-x: auto; */
  padding: 0px;
  margin: 3px;
}

#viz-toolbar {
  padding: 0 16px;
}

.viz-course-tooltip {
  /* position tooltip content absolutely */
  position: absolute;

  /* Override default Vuetify */
  pointer-events: auto;
}

text {
  pointer-events: none;
}
</style>
