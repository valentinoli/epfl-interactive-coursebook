<template>
  <div id="viz-container" class="flex-grow-1 d-flex flex-column">
    <div
      id="viz-toolbar"
      class="mb-3 mx-2 mr-md-4 px-4 px-md-0 py-1 d-flex flex-wrap justify-center justify-md-space-between align-center"
    >
      <!-- Tools soon to be added -->
      <div class="d-flex">
        <v-switch
          v-model="ingoingToggled"
          color="red"
          class="mx-2"
          label="Ingoing"
        ></v-switch>
        <v-switch
          v-model="outgoingToggled"
          color="red"
          class="mx-2"
          label="Outgoing"
        ></v-switch>
      </div>
      <div class="d-flex">
        <v-select
          v-model="nodeSizeParameter"
          :items="nodeSizeParameters"
          label="Node size parameter"
          color="red"
          item-color="red"
          light
          dense
          hide-details
          class="node-size-select ml-2"
        >
        </v-select>
      </div>
    </div>

    <div id="viz-svg" class="flex-grow-1"></div>
    <v-tooltip
      v-model="courseTooltip"
      attach="#app"
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
  </div>
</template>

<script>
import Graph from "@/d3/graph";

export default {
  name: "CourseViz",
  props: {
    subgraphNodes: {
      type: Array,
      default: () => []
    },
    ingoingNodes: {
      type: Array,
      default: () => []
    },
    outgoingNodes: {
      type: Array,
      default: () => []
    },
    subgraphLinks: {
      type: Array,
      default: () => []
    },
    ingoingLinks: {
      type: Array,
      default: () => []
    },
    outgoingLinks: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      courseTooltip: true,
      courseTooltipHtml: "",
      courseTooltipCourseId: null,
      touchInterface: false,
      outgoingToggled: true,
      ingoingToggled: true,
      nodeSizeParameter: "credits",
      nodeSizeParameters: [
        {
          value: "credits",
          text: "Credits"
        },
        {
          value: "registrations",
          text: "Registrations"
        },
        {
          value: "indegree",
          text: "In-degree"
        },
        {
          value: "outdegree",
          text: "Out-degree"
        }
      ]
    };
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
    subgraphNodes() {
      this.render();
    },
    ingoingToggled() {
      this.render();
    },
    outgoingToggled() {
      this.render();
    },
    nodeSizeParameter() {
      this.render();
    }
  },
  methods: {
    render() {
      const {
        subgraphNodes,
        ingoingNodes,
        outgoingNodes,
        subgraphLinks,
        ingoingLinks,
        outgoingLinks,
        ingoingToggled,
        outgoingToggled
      } = this;

      const nodes = [
        ...subgraphNodes,
        ...(ingoingToggled ? ingoingNodes : []),
        ...(outgoingToggled ? outgoingNodes : [])
      ];

      // Some nodes might be part of both the ingoing and
      // outgoing neighborhoods, so we remove duplicates
      const nodesUnique = nodes.filter(
        (node, index, self) =>
          // search for the first index of the course id
          index === self.findIndex(n => n.id === node.id)
      );
      const links = [
        ...subgraphLinks,
        ...(ingoingToggled ? ingoingLinks : []),
        ...(outgoingToggled ? outgoingLinks : [])
      ];

      this.$options.graph.render(nodesUnique, links);
    },
    showCourseTooltip({ id, name, credits, registrations, ingoing, outgoing }) {
      const html = `
        <div>
          <strong>${id}</strong>
        </div>
        <div class="mb-2">
          ${name}
        </div>
        <div>
          Credits: ${credits}
        </div>
        <div>
          Registrations: ${
            registrations ? registrations["2019-2020"] : "Unknown"
          }
        </div>
        <div>
          In-degree: ${ingoing.length}
        </div>
        <div>
          Out-degree: ${outgoing.length}
        </div>
      `;
      this.courseTooltipHtml = html;
      this.courseTooltipCourseId = id;
      this.courseTooltip = true;
    },
    updateCourseTooltipPosition([x, y]) {
      if (this.courseTooltip) {
        const tooltip = document.querySelector(".viz-course-tooltip");
        tooltip.style.top = `${y}px`;
        tooltip.style.left = `${x + 20}px`;
      }
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
#viz-svg {
  width: 100%;
  margin: 0 3px;
}

#viz-toolbar {
  /* border: 0.5px solid grey;
  border-radius: 7px; */
}

.viz-course-tooltip {
  /* position tooltip content absolutely */
  position: absolute;

  /* Override default Vuetify */
  pointer-events: auto;
}

.node-size-select {
  max-width: 200px;
}
</style>
