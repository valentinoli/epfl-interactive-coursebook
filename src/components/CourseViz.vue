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

    <div id="viz-svg" class="flex-grow-1">
      <v-tooltip left>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" @click="centerGraph()" absolute top right icon>
            <v-icon>mdi-crosshairs-gps</v-icon>
          </v-btn>
        </template>
        <span>Reset position</span>
      </v-tooltip>
    </div>

    <v-expansion-panels popout :value="0">
      <v-expansion-panel>
        <v-expansion-panel-header>
          <div><v-icon left>mdi-map-legend</v-icon> Legend</div>
        </v-expansion-panel-header>
        <v-expansion-panel-content eager>
          <div class="legend mx-4">
            <v-row>
              <v-col
                v-for="(val, key) in nodeColorMap"
                :key="key"
                cols="6"
                sm="3"
                md="2"
                xl="1"
              >
                <div
                  @mouseenter.self="colorLegendMouseenter($event, key)"
                  @mouseleave.self="colorLegendMouseleave($event)"
                  class="legend__item d-flex align-center"
                >
                  <div
                    class="legend__item-circle d-flex justify-center align-center"
                    :style="
                      `background-color: ${val}; opacity: ${$options.graph.graphOpacity};`
                    "
                  ></div>
                  <div class="ml-4">{{ key }}</div>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

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
      nodeSizeParam: "credits",
      nodeColorMapParam: "semester",
      nodeColorMap: {},
      nodeColorMapCounts: {}
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
    // {
    //   value: null,
    //   text: "Uniform"
    // },
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
    this.updateColorMap();
    this.render();
    this.centerGraph();

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
      this.updateColorMap();
      this.render();
      this.centerGraph();
    },
    ingoingToggled() {
      this.updateColorMap();
      this.render();
    },
    outgoingToggled() {
      this.updateColorMap();
      this.render();
    },
    nodeSizeParam() {
      this.render();
    },
    nodeColorMapParam() {
      // Color map is updated when user changes the node color param
      this.updateColorMap();
      this.render();
    }
  },
  methods: {
    centerGraph() {
      this.$options.graph.centerGraph();
    },
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
              if (param === "credits") {
                return [key, creditColors[index % creditColors.length].value];
              } else if (param === "section") {
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
      // this.$options.colorMaps[null] = {
      //   true: "green",
      //   false: "orange"
      // };
    },
    updateColorMap() {
      const param = this.nodeColorMapParam;
      const options = api.getCourseFilterOptions(this.subgraphNodes);

      // Replace last character of the parameter name with an "s" to get plural
      const paramPlural = !param || param.endsWith("s") ? param : `${param}s`;

      const map = this.$options.colorMaps[param];

      // Update the dynamic color map, filter out keys which are not present
      // in the graph (and consequently in the course filter options)
      this.nodeColorMap = Object.fromEntries(
        Object.entries(map).filter(colorEntry =>
          options[paramPlural].includes(colorEntry[0])
        )
      );

      this.nodeColorMapCounts = Object.fromEntries(
        Object.entries(map).map(colorEntry => [
          colorEntry[0],
          this.subgraphNodes.reduce(
            // Compute how often the color appears in the graph
            (acc, { [param]: p }) => (p === colorEntry[0] ? acc + 1 : acc),
            0
          )
        ])
      );
    },
    colorLegendMouseenter({ target }, key) {
      const circle = target.firstChild;
      const { graphOpacity, graphOpacityOffset } = this.$options.graph;
      circle.style.opacity = graphOpacity + graphOpacityOffset;
      circle.style.border = "1px solid #000";

      circle.innerHTML = this.nodeColorMapCounts[key];
    },
    colorLegendMouseleave({ target }) {
      const circle = target.firstChild;
      circle.style.opacity = this.$options.graph.graphOpacity;
      circle.style.border = "none";
      circle.innerHTML = "";
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
    updateCourseTooltipPosition([x, y], [clientX, clientY]) {
      if (this.courseTooltip) {
        const tooltip = document.querySelector(".viz-course-tooltip");
        const xOffset = 20;

        // We check the window position of the mouse to avoid overflow
        const { innerWidth, innerHeight } = window;
        if (clientX > innerWidth / 2) {
          tooltip.style.left = "initial";
          tooltip.style.right = `${innerWidth - x + xOffset}px`;
        } else {
          tooltip.style.left = `${x + xOffset}px`;
          tooltip.style.right = "initial";
        }

        if (clientY > innerHeight / 2) {
          tooltip.style.top = "initial";
          tooltip.style.bottom = `${innerHeight - y}px`;
        } else {
          tooltip.style.top = `${y}px`;
          tooltip.style.bottom = "initial";
        }
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
  position: relative;
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

.legend__item {
  cursor: pointer;
}

.legend__item-circle {
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

.v-expansion-panel[aria-expanded="false"] {
  max-width: 350px;
}
</style>
