<template>
  <div class="d-flex flex-column">
    <!-- Toolbar -->
    <div
      class="viz-toolbar mb-3 mx-0 mx-md-2 mr-md-4 px-1 px-md-0 py-1 d-flex flex-wrap justify-center justify-md-space-between align-center"
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
          v-model="nodeGroupParam"
          :items="$options.nodeGroupParams"
          label="Node group"
          light
          dense
          hide-details
          class="ml-2"
        >
        </v-select>
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

    <!-- SVG -->
    <div class="svg-container">
      <v-tooltip left>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" @click="centerGraph" absolute top right icon>
            <v-icon>mdi-crosshairs-gps</v-icon>
          </v-btn>
        </template>
        <span>Reset position</span>
      </v-tooltip>
    </div>

    <!-- Legend -->
    <v-expansion-panels v-model="legend" class="legend-panel">
      <v-expansion-panel>
        <v-expansion-panel-header ref="legendHeader">
          <div><v-icon left>mdi-map-legend</v-icon> Legend</div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <div class="legend mx-4">
            <template
              v-if="nodeGroupParam"
            >
              <div class="title mb-1">
                <strong>Groups</strong>
              </div>
              <div class="mb-2">
                <strong>{{ capitalize(nodeGroupParam) }}</strong>
              </div>
              <v-row>
                <v-col
                  v-for="({ color, textColor }, key) in nodeGroupColorMap"
                  :key="`group-${key}`"
                >
                  <div
                    @mouseenter.self="colorLegendMouseenter($event, key, true)"
                    @mouseleave.self="colorLegendMouseleave($event, true)"
                    class="legend__item d-flex align-center"
                  >
                    <div
                      class="legend__item-square d-flex justify-center align-center"
                      :style="
                        `background-color: ${color}; opacity: ${
                          graph.nodeGroupOpacity
                        }; color: ${textColor || 'black'};`
                      "
                    ></div>
                    <div class="ml-4">{{ key }}</div>
                  </div>
                </v-col>
              </v-row>
            </template>
            <template>
              <div class="title mb-1 mt-6">
                <strong>Nodes</strong>
              </div>
              <div class="mb-2">
                <strong>{{
                  capitalize(nodeColorMapParam)
                }}</strong>
              </div>
              <v-row>
                <v-col
                  v-for="({ color, textColor }, key) in nodeColorMap"
                  :key="key"
                >
                  <div
                    @mouseenter.self="colorLegendMouseenter($event, key)"
                    @mouseleave.self="colorLegendMouseleave($event)"
                    class="legend__item d-flex align-center"
                  >
                    <div
                      class="legend__item-circle d-flex justify-center align-center"
                      :style="
                        `background-color: ${color}; opacity: ${
                          graph.graphOpacity
                        }; color: ${textColor || 'black'};`
                      "
                    ></div>
                    <div class="ml-4">{{ key }}</div>
                  </div>
                </v-col>
              </v-row>
            </template>
            <template
              v-if="
                ingoingNodesDisplayed.length ||
                  outgoingNodesDisplayed.length ||
                  ingoingOutgoingNodesDisplayed.length
              "
            >
              <div class="mt-6 mb-2">
                <strong>Neighborhood</strong>
              </div>
              <v-row>
                <v-col
                  v-for="({ label, color, textColor },
                  key) in nodeColorMapNeighborhood"
                  :key="key"
                >
                  <div
                    @mouseenter.self="colorLegendMouseenter($event, key, false, true)"
                    @mouseleave.self="colorLegendMouseleave($event)"
                    class="legend__item d-flex align-center"
                  >
                    <div
                      class="legend__item-circle d-flex justify-center align-center"
                      :style="
                        `background-color: ${color}; opacity: ${
                          graph.graphOpacity
                        }; color: ${textColor || 'black'};`
                      "
                    ></div>
                    <div class="ml-4">{{ label }}</div>
                  </div>
                </v-col>
              </v-row>
            </template>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- Course (node) tooltip -->
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
          @touchstart="$emit('selectCourse', courseTooltipCourseId)"
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
import debounce from "lodash.debounce";
import { capitalize } from "@/services/util";

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
      // set true to render the tooltip in order to find it in the DOM early
      courseTooltip: true,
      courseTooltipHtml: "",
      courseTooltipCourseId: null,
      touchInterface: false,
      outgoingToggled: true,
      ingoingToggled: true,
      nodeSizeParam: "credits",
      nodeColorMapParam: "semester",
      nodeGroupParam: "",
      graph: {},
      legend: undefined,
      didScroll: false
    };
  },
  nodeGroupParams: [
    {
      value: "",
      text: "None"
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
    this.createColorMaps(api.getAllCourseFilterOptions());
  },
  mounted() {
    this.graph = new Graph(this);

    this.renderGraph();
    this.centerGraph();

    window.addEventListener("scroll", () => {
      this.didScroll = true;
    });

    // Check regularly if page was recently scrolling
    window.setInterval(() => {
      if (this.didScroll) {
        this.didScroll = false;
      }
    }, 500);

    window.addEventListener(
      "resize",
      debounce(() => {
        // Reset SVG view box on resize
        this.graph.setSVGViewBox();

        // Note: attempted to call this.centerGraph() to center the graph on
        // window resize. However, the resize event is triggered when the
        // navigation drawer component is updated (the filters sidebar),
        // and it did not look nice to center the graph every time that happens
      }, 100)
    );

    // Hide the tooltip by default
    this.courseTooltip = false;

    // Attempt to check for touch interface
    // See http://www.stucox.com/blog/you-cant-detect-a-touchscreen/
    // We want to offer a friendly experience to touch device users
    // Caveats with the following approach:
    // 1. It requires interaction before you can know the result
    // 2. The event still won't fire for browsers which don't support the
    //    Touch Events API... which is a lot of them
    const onTouchStart = () => {
      this.touchInterface = true;

      // Tooltip should be clickable
      const tooltipEl = document.querySelector(".viz-course-tooltip");
      tooltipEl.addEventListener("touchstart", evt => {
        // Prevent default on a touchstart prevents the corresponding
        // mouse events from firing, i.e. click event won't fire and thereby
        // closing the tooltip
        evt.preventDefault();
        this.courseTooltip = true;
      });
      document.removeEventListener("touchstart", onTouchStart, true);
    };

    document.addEventListener("touchstart", onTouchStart, true);
  },
  watch: {
    legend(val) {
      // Legend is being opened if v-model is 0
      if (val === 0) {
        window.setTimeout(() => {
          // Force scrolling to the legend header when the legend is opened:
          // Note that this scrolling is redundant when page has scrolled
          // automatically. This typically happens if the legend has been
          // opened before once or twice (idk why).
          // Also, we don't want to programmatically scroll if the page has
          // already scrolled since that will cause the legend to flicker.
          // However, there is no clear way to avoid flickering that seems to
          // happen when the previous legend had greater height.

          if (!this.didScroll) {
            // Force scroll to legend if automatic scroll did not happen
            this.$vuetify.goTo(this.$refs.legendHeader, {
              duration: 500,
              easing: "easeInOutCubic"
            });
          }
        }, 50);
      }
    },
    subgraphNodes() {
      this.renderGraph();

      // Center graph when filter applied
      this.centerGraph();
    },
    ingoingToggled() {
      this.renderGraph();
    },
    outgoingToggled() {
      this.renderGraph();
    },
    nodeGroupParam() {
      this.renderGraph();
    },
    nodeSizeParam() {
      this.renderGraph();
    },
    nodeColorMapParam() {
      this.renderGraph();
    }
  },
  computed: {
    ingoingOutgoingNodesDisplayed() {
      // Some nodes might be part of both the ingoing and
      // outgoing neighborhoods, so we compute them
      if (this.ingoingToggled || this.outgoingToggled) {
        return [...this.ingoingNodes, ...this.outgoingNodes].filter(
          ({ ingoingNeighbor, outgoingNeighbor }) =>
            ingoingNeighbor && outgoingNeighbor
        );
      }

      return [];
    },
    ingoingNodesDisplayed() {
      if (this.ingoingToggled) {
        return this.ingoingNodes.filter(
          ({ id }) =>
            // keep the node if it is not part of both ingoing and outgoing 'hoods
            this.ingoingOutgoingNodesDisplayed.findIndex(n => n.id === id) ===
            -1
        );
      }

      return [];
    },
    outgoingNodesDisplayed() {
      if (this.outgoingToggled) {
        return this.outgoingNodes.filter(
          ({ id }) =>
            // keep the node if it is not part of both ingoing and outgoing 'hoods
            this.ingoingOutgoingNodesDisplayed.findIndex(n => n.id === id) ===
            -1
        );
      }

      return [];
    },
    ingoingLinksDisplayed() {
      return this.ingoingToggled ? this.ingoingLinks : [];
    },
    outgoingLinksDisplayed() {
      return this.outgoingToggled ? this.outgoingLinks : [];
    },
    nodes() {
      const {
        subgraphNodes,
        ingoingOutgoingNodesDisplayed,
        ingoingNodesDisplayed,
        outgoingNodesDisplayed
      } = this;

      const nodes = [
        ...subgraphNodes,
        ...ingoingOutgoingNodesDisplayed,
        ...ingoingNodesDisplayed,
        ...outgoingNodesDisplayed
      ];

      // Some nodes might be part of both the ingoing and
      // outgoing neighborhoods, so we remove duplicates
      // const nodesUnique = nodes.filter(
      //   (node, index, self) =>
      //     // search for the first index of the course id
      //     index === self.findIndex(n => n.id === node.id)
      // );

      return nodes;
    },
    links() {
      const {
        subgraphLinks,
        ingoingLinksDisplayed,
        outgoingLinksDisplayed
      } = this;

      const links = [
        ...subgraphLinks,
        ...ingoingLinksDisplayed,
        ...outgoingLinksDisplayed
      ];

      return links;
    },
    nodeColorMap() {
      return this.getFilteredColorMap(
        this.nodeColorMapParam,
        this.subgraphNodes
      );
    },
    nodeGroupColorMap() {
      if (this.nodeGroupParam) {
        return this.getFilteredColorMap(this.nodeGroupParam, this.nodes);
      }

      return {};
    },
    nodeColorMapCounts() {
      const { nodeColorMapParam: param, nodeColorMap, subgraphNodes } = this;
      return this.getColorMapCounts(param, nodeColorMap, subgraphNodes);
    },
    nodeGroupColorMapCounts() {
      const { nodeGroupParam: param, nodeGroupColorMap, nodes } = this;
      return this.getColorMapCounts(param, nodeGroupColorMap, nodes);
    },
    nodeColorMapNeighborhood() {
      const {
        ingoingOutgoingNodesDisplayed,
        ingoingNodesDisplayed,
        outgoingNodesDisplayed
      } = this;

      const map = {};
      if (ingoingNodesDisplayed.length) {
        map.ingoing = { label: "Ingoing", color: "#D3D3D3" };
      }
      if (outgoingNodesDisplayed.length) {
        map.outgoing = { label: "Outgoing", color: "#000000" };
      }
      if (ingoingOutgoingNodesDisplayed.length) {
        map.both = { label: "Ingoing/Outgoing", color: "#808080" };
      }

      // Compute legend text color and return
      return Object.fromEntries(
        Object.entries(map).map(([k, v]) => [
          k,
          { textColor: this.textColor(v.color), ...v }
        ])
      );
    },
    nodeColorMapNeighborhoodCounts() {
      const {
        ingoingOutgoingNodesDisplayed,
        ingoingNodesDisplayed,
        outgoingNodesDisplayed
      } = this;

      const counts = {
        both: ingoingOutgoingNodesDisplayed.length,
        ingoing: ingoingNodesDisplayed.length,
        outgoing: outgoingNodesDisplayed.length
      };

      return counts;
    }
  },
  methods: {
    centerGraph() {
      this.graph.centerGraph(this.nodes.length);
    },
    renderGraph() {
      this.graph.render(this.nodes, this.links);
    },
    colorMapParamPlural(param) {
      // Simple workaround
      // Replace last character of the parameter name with an "s" to get plural
      return !param || param.endsWith("s") ? param : `${param}s`;
    },
    getFilteredColorMap(param, nodes) {
      const paramPlural = this.colorMapParamPlural(param);
      const map = this.$options.colorMaps[param];

      const courseFilterOptions = api.getCourseFilterOptions(nodes);
      const paramOptions = courseFilterOptions[paramPlural];

      // Update the dynamic color map, filter out keys which are not present
      // in the graph (and consequently in the course filter options)
      const filteredMap = Object.fromEntries(
        Object.entries(map)
          .filter(colorEntry => paramOptions.includes(colorEntry[0]))
          // Add legend text color
          .map(([k, v]) => [k, { textColor: this.textColor(v), color: v }])
      );

      return filteredMap;
    },
    getColorMapCounts(param, colorMap, nodes) {
      const counts = Object.fromEntries(
        Object.entries(colorMap).map(colorEntry => [
          colorEntry[0],
          nodes.reduce(
            // Compute how often the color appears in the graph
            (acc, { [param]: p }) => (p === colorEntry[0] ? acc + 1 : acc),
            0
          )
        ])
      );

      return counts;
    },
    createColorMaps({ credits, sections, semesters }) {
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
              // assume semester
              else {
                return [key, semesterColors[key]];
              }
            })
          )
        ])
      );
      // --> { credits: { 6: #color, 4: #color2, ... }, ...}
    },
    hexToRgb(hex) {
      // https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb#answer-5624139
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [
            parseInt(result[1], 16), // r
            parseInt(result[2], 16), // g
            parseInt(result[3], 16) // b
          ]
        : null;
    },
    textColor(bgColor) {
      // https://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color#answer-3943023
      let rgb;
      if (bgColor.startsWith("#")) {
        // hex
        rgb = this.hexToRgb(bgColor);
      } else {
        // rgb(r, g, b)
        rgb = bgColor
          .slice(bgColor.indexOf("(") + 1, bgColor.indexOf(")"))
          .replace(/\s/g, "")
          .split(",");
      }

      const [r, g, b] = rgb;

      if (r * 0.299 + g * 0.587 + b * 0.114 > 186) {
        return "#000000";
      }

      return "#ffffff";
    },
    colorLegendMouseenter({ target }, key, isGroupLegend = false, isNeighbor = false) {
      const el = target.firstChild;
      if (!isGroupLegend) {
        const { graphOpacity, graphOpacityOffset } = this.graph;
        el.style.opacity = graphOpacity + graphOpacityOffset;
      }

      if (isNeighbor) {
        el.innerHTML = this.nodeColorMapNeighborhoodCounts[key];
      } else if(isGroupLegend) {
        el.innerHTML = this.nodeGroupColorMapCounts[key];
      } else {
        el.style.border = "1px solid #000000";
        el.innerHTML = this.nodeColorMapCounts[key];
      }
    },
    colorLegendMouseleave({ target }, isGroupLegend = false) {
      const el = target.firstChild;
      if (!isGroupLegend) {
        el.style.opacity = this.graph.graphOpacity;
      }
      el.style.border = "none";
      el.innerHTML = "";
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
    },
    capitalize,
  }
};
</script>

<style scoped>
.svg-container {
  width: 100%;
  position: relative;
}

.viz-course-tooltip {
  /* Position tooltip content absolutely */
  position: absolute;

  /* Override Vuetify default, enable pointer events */
  pointer-events: auto;
}

.v-select {
  max-width: 200px;
}

.legend-panel .v-expansion-panel[aria-expanded="false"] {
  max-width: 350px;
}

.legend .col {
  /* min-width according to the largest observed legend item */
  flex-grow: 0;
  min-width: 167px;
}

.legend:last-of-type .col:last-child {
  /* Ingoing/Outgoing */
  flex-grow: 1;
}

.legend__item {
  cursor: pointer;
}

.legend__item-square,
.legend__item-circle {
  width: 40px;
  height: 40px;
}

.legend__item-circle {
  border-radius: 50%;
}
</style>
