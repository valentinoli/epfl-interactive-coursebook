<template>
  <div id="viz-container" class="flex-grow-1 d-flex flex-column">
    <div
      id="viz-toolbar"
      class="mb-3 mx-2 mr-md-4 px-4 px-md-0 py-1 d-flex flex-wrap justify-center justify-md-space-between align-center"
    >
      <div class="d-flex">
        <v-switch
          v-model="ingoingToggled"
          class="mx-2"
          label="Ingoing"
        ></v-switch>
        <v-switch
          v-model="outgoingToggled"
          class="mx-2"
          label="Outgoing"
        ></v-switch>
      </div>
      <div class="d-flex">
        <v-select
          v-model="nodeSizeParam"
          :items="$options.nodeSizeParams"
          label="Node size"
          light
          dense
          hide-details
          class="ml-2"
        >
        </v-select>
        <v-select
          v-model="nodeColorMapParam"
          :items="$options.nodeColorMapParams"
          label="Node color"
          light
          dense
          hide-details
          class="ml-2"
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
import { categoricalColors, creditColors, semesterColors } from "@/d3/colors";
import api from "@/services/api";

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
      nodeSizeParam: 'credits',
      nodeColorMapParam: 'semester'
    };
  },
  nodeSizeParams: [
    {
      value: null,
      text: "Uniform"
    },
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
      text: "Requirements"
    },
    {
      value: "outdegree",
      text: "Preparation for"
    }
  ],
  nodeColorMapParams: [
    {
      value: null,
      text: "Uniform"
    },
    {
      value: "credits",
      text: "Credits"
    },
    {
      value: "semester",
      text: "Semester"
    },
    {
      value: "section",
      text: "Section"
    }
  ],
  created() {
    // Fetch course filter options
    // Need to call this in created lifecycle hook to make
    // sure data has been loaded into local storage
    this.courseFilterOptions = api.getAllCourseFilterOptions();
  },
  mounted() {
    const graph = new Graph(this);
    this.$options.graph = graph;

    this.createColorMaps();
    this.nodeColorMap = this.$options.colorMaps['semester'];
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
    nodeSizeParam() {
      this.render();
    },
    nodeColorMapParam(param) {
      // Color map is updated when user changes the node color param
      this.nodeColorMap = this.$options.colorMaps[param];
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
    createColorMaps() {
      const {
        courseFilterOptions: { credits, sections, semesters }
      } = this;

      // Rename plural to singular to match course prop key
      this.$options.colorMaps = Object.fromEntries(
        Object.entries({
          credits,
          section: sections,
          semester: semesters
        }).map(([param, values]) => [
          param,
          Object.fromEntries(
            values.map((key, index) => {
              if(param === 'credits'){
                return [key, creditColors[index%creditColors.length].value];
              }
              else if(param === 'section'){
                return [key, categoricalColors[index]];
              }
              //assume semester
              else {
                return [key, semesterColors[key]];
              }
            })
          )
        ])
      );
      // --> { credits: { 6: #color, 4: #color2, ... }, ...}

      // Add the default color map, entering nodes colored green, updated orange
      this.$options.colorMaps[null] = {
        true: "green",
        false: "orange"
      };
    },
    showCourseTooltip({
      id,
      name,
      credits,
      registrations,
      section,
      semester,
      ingoing,
      outgoing
    }) {
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
          Requirements: ${ingoing.length}
        </div>
        <div>
          Preparation for: ${outgoing.length}
        </div>
        <div>
          Section: ${section}
        </div>
        <div>
          Semester: ${semester}
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

.v-select {
  max-width: 200px;
}
</style>
