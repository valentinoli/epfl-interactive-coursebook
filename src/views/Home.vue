<template>
  <v-container fluid class="home">
    <v-row v-if="error">
      <v-col>{{ error }}</v-col>
    </v-row>

    <SkeletonLoader v-else-if="loading" />

    <v-row v-else class="home-content">
      <div id="filter">
        <v-app id="filter-toggle">
          <v-sheet
            height="400"
            width="200"
            class="overflow-hidden"
            style="position: relative;"
          >
            <v-container class="fill-height">
              <v-row align="center" justify="center">
                <v-btn color="pink" dark @click.stop="drawer = !drawer">
                  Filter
                </v-btn>
              </v-row>
            </v-container>

            <v-navigation-drawer v-model="drawer" app temporary width="500">
              <v-card>
                <v-row class="flex-column" justify="center" align="center">
                  <!-- Hierarchical filters -->
                  <v-col
                    cols="auto"
                    sm="7"
                    md="12"
                    class="filters__hierarchical"
                  >
                    <p class="subtitle-1">
                      Hierarchical filters
                    </p>
                    <Select
                      :value.sync="selectedLevel"
                      :items="$options.levels"
                      :autofocus="true"
                      label="Select level"
                    />

                    <Select
                      :enabled="programEnabled"
                      :value.sync="selectedProgram"
                      :items="programs"
                      :key="selectedLevel || `noprogram`"
                      label="Select program"
                    />

                    <Select
                      :enabled="masterspecsEnabled"
                      :value.sync="selectedMasterspec"
                      :items="masterspecs"
                      :key="selectedProgram || `nospec`"
                      label="Select specialization"
                    >
                      <template v-slot:item-data="{ item }">
                        <img class="spec-icon" :src="item.iconUrl" />
                        <span>{{ item.text }}</span>
                      </template>
                      <template v-slot:selection-data="{ item }">
                        <div class="d-flex align-start mt-2">
                          <img class="spec-icon" :src="item.iconUrl" />
                          <span>{{ item.text }}</span>
                        </div>
                      </template>
                    </Select>
                  </v-col>

                  <!-- Global filters -->
                  <v-col cols="auto" sm="7" md="12" class="filters__global">
                    <p class="subtitle-1">
                      Global filters
                    </p>
                    <Select
                      :value.sync="selectedSection"
                      :items="sections"
                      :key="selectedSection || `nosection`"
                      label="Select section"
                    />

                    <Select
                      :value.sync="selectedCredits"
                      :items="credits"
                      :key="selectedCredits || `nocredits`"
                      label="Select credits"
                    />

                    <Select
                      :value.sync="selectedSemester"
                      :items="semesters"
                      :key="selectedSemester || `nosemester`"
                      label="Select semester"
                    />
                  </v-col>

                  <v-col
                    cols="auto"
                    sm="7"
                    md="12"
                    class="filters__autocompletes"
                  >
                    <p class="subtitle-1">
                      Search tools
                    </p>
                    <!-- Course cherry-picker -->
                    <v-autocomplete
                      v-model="courseCherries"
                      :items="nodesFiltered"
                      :item-value="item => item"
                      :item-text="({ id, name }) => `${id} - ${name}`"
                      append-icon="mdi-magnify"
                      label=""
                      placeholder="Search filtered courses..."
                      menu-props="closeOnContentClick"
                      multiple
                      hide-no-data
                      hide-details
                      outlined
                    >
                      <template v-slot:selection="{ item }">
                        <v-chip
                          outlined
                          close
                          @click:close="removeCourseCherry(item.id)"
                          :title="item.name"
                        >
                          {{ item.id }}
                        </v-chip>
                      </template>
                    </v-autocomplete>
                  </v-col>
                </v-row>
              </v-card>
            </v-navigation-drawer>
          </v-sheet>
        </v-app>
      </div>
      <v-col cols="12" md="8" xl="9" class="view-pane d-flex flex-column">
        <div class="d-flex flex-column flex-md-row mb-2 view-pane__tabs">
          <v-tabs
            v-model="mainTab"
            hide-slider
            optional
            :centered="$vuetify.breakpoint.smAndDown"
            class="mb-2 mb-md-0"
          >
            <v-tab v-for="({ name }, idx) in $options.mainTabs" :key="idx">
              {{ name }}
            </v-tab>
          </v-tabs>
          <v-tabs
            v-if="courseTabs.length > 0"
            v-model="courseTab"
            hide-slider
            optional
            show-arrows
            center-active
            :centered="$vuetify.breakpoint.smAndDown"
            :right="$vuetify.breakpoint.mdAndUp"
            class="course-tabs"
          >
            <v-tab
              v-for="({ id, name }, idx) in courseTabs"
              :key="idx"
              :title="name"
            >
              {{ id }}
              <v-btn icon x-small class="ml-1 mr-n2">
                <v-icon x-small @click.stop="removeCourseTab(idx)"
                  >mdi-close</v-icon
                >
              </v-btn>
            </v-tab>
          </v-tabs>
        </div>
        <v-slide-x-transition mode="out-in">
          <keep-alive>
            <component
              :is="currentComponent"
              v-bind="currentProperties"
              @selectCourse="selectCourse"
            ></component>
          </keep-alive>
        </v-slide-x-transition>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// @ is an alias to /src
import api from "@/services/api";
import CourseViz from "@/components/CourseViz";
import CourseList from "@/components/CourseList";
import CourseDetail from "@/components/CourseDetail";
import Select from "@/components/Select";
import SkeletonLoader from "@/components/SkeletonLoader";

export default {
  name: "Home",
  el: "#filter",
  components: {
    CourseViz,
    CourseList,
    CourseDetail,
    Select,
    SkeletonLoader
  },
  data() {
    return {
      currentComponent: "CourseViz",
      drawer: null,
      // Tab indices
      mainTab: 0,
      courseTab: undefined,

      // Available course tabs
      courseTabs: [],

      // Course tab being viewed
      courseDetail: null,

      // Loading/error states
      loading: true,
      loadingCourses: false,
      error: false,

      // Dropdowns
      programs: [],
      masterspecs: [],
      sections: [],
      credits: [],
      semesters: [],

      // Dropdowns: selected values
      selectedLevel: "",
      selectedProgram: "",
      selectedMasterspec: "",
      selectedSection: "",
      selectedCredits: "",
      selectedSemester: "",

      // Displayed courses and links
      subgraphNodes: [],
      ingoingNodes: [],
      outgoingNodes: [],
      subgraphLinks: [],
      ingoingLinks: [],
      outgoingLinks: [],

      // Courses matching filter conditions
      nodesFiltered: [],

      // Cherry-picked courses from filtered courses
      courseCherries: []
    };
  },
  mainTabs: [
    {
      component: "CourseViz",
      name: "Network"
    },
    {
      component: "CourseList",
      name: "List"
    }
  ],
  async created() {
    try {
      await api.loadAllData();
      // Don't need getters and setters for the levels
      this.$options.levels = api.getAllLevels();
      this.updateCourseGraph();

      this.updateCourseFilters();
    } catch (err) {
      this.error = err;
    } finally {
      this.loading = false;
    }
  },
  watch: {
    selectedLevel() {
      this.programs = api.getProgramsByLevel(this.selectedLevel);

      this.selectedProgram = "";
      this.selectedMasterspec = "";

      this.setCourseFiltersAndUpdateCourseGraph();
    },
    selectedProgram() {
      if (this.selectedLevel === "master") {
        this.masterspecs = api.getMasterspecsByProgram(this.selectedProgram);
      }

      this.selectedMasterspec = "";

      this.setCourseFiltersAndUpdateCourseGraph();
    },
    selectedMasterspec() {
      this.setCourseFiltersAndUpdateCourseGraph();
    },
    selectedSection() {
      this.updateCourseGraph();
    },
    selectedCredits() {
      this.updateCourseGraph();
    },
    selectedSemester() {
      this.updateCourseGraph();
    },
    courseCherries() {
      const { courseCherries } = this;
      if (courseCherries.length > 0) {
        this.subgraphNodes = courseCherries;
      } else {
        this.subgraphNodes = this.nodesFiltered;
      }

      const subgraphIds = this.subgraphNodes.map(({ id }) => id);
      this.updateLinksAndNeighborHoods(subgraphIds);
    },
    mainTab(newTab, prevTab) {
      // Called when the model for main tabs changes
      if (newTab === undefined) {
        // user tried deselecting current tab manually
        // --> force selection
        this.mainTab = prevTab;
      } else if (newTab !== null) {
        // deselect course tab
        this.courseTab = null;

        const { component } = this.$options.mainTabs[newTab];
        this.setCurrentComponent(component);
      }
    },
    courseTab(newTab, prevTab) {
      // Called when the model for course tabs changes
      if (newTab === undefined) {
        // user tried deselecting current tab manually
        // --> force selection
        this.courseTab = prevTab;
      } else if (newTab !== null) {
        // deselect main tab
        this.mainTab = null;

        this.courseDetail = this.courseTabs[newTab];
        this.setCurrentComponent("CourseDetail");
      }
    }
  },
  methods: {
    setCourseFiltersAndUpdateCourseGraph() {
      // Needs to be done in this order
      this.setCourseFilterDefaults();
      this.updateCourseGraph();
      this.updateCourseFilters();
    },
    setCourseFilterDefaults() {
      this.selectedSection = "";
      this.selectedCredits = "";
      this.selectedSemester = "";
    },
    updateLinksAndNeighborHoods(subgraphIds) {
      const {
        ingoingNodes,
        outgoingNodes,
        subgraphLinks,
        ingoingLinks,
        outgoingLinks
      } = api.getLinksAndNeighborhoods(subgraphIds);
      this.ingoingNodes = ingoingNodes;
      this.outgoingNodes = outgoingNodes;
      this.subgraphLinks = subgraphLinks;
      this.ingoingLinks = ingoingLinks;
      this.outgoingLinks = outgoingLinks;
    },
    updateCourseGraph() {
      const subgraphNodes = api.getSubgraphNodes(this);

      // Clone array to keep track of which courses match the filters
      this.nodesFiltered = JSON.parse(JSON.stringify(subgraphNodes));

      if (!this.courseCherries.length) {
        // If there are no cherry picked courses,
        // update the graph/list, otherwise
        // let courseCherries watcher take care of it
        this.subgraphNodes = subgraphNodes;
        const ids = subgraphNodes.map(({ id }) => id);
        this.updateLinksAndNeighborHoods(ids);
      }
    },
    updateCourseFilters() {
      // Call this method only after courses have been updated
      const { sections, credits, semesters } = api.getCourseFilterOptions(
        this.subgraphNodes
      );

      this.sections = sections;
      this.credits = credits;
      this.semesters = semesters;
    },
    removeCourseCherry(id) {
      const index = this.courseCherries.findIndex(course => course.id === id);
      this.courseCherries.splice(index, 1);
    },
    setCurrentComponent(component) {
      this.currentComponent = component;
    },
    removeCourseTab(index) {
      this.courseTabs.splice(index, 1);

      if (this.courseTabs.length > 0) {
        // there are some tabs available
        if (index === this.courseTab) {
          // if closed tab is the current one,
          // select the one before (if first one closed, select first one)
          this.courseTab = index > 0 ? index - 1 : 0;
        } else if (this.courseTab > index) {
          // closed tab comes before the current tab
          // --> fix current tab index
          this.courseTab = this.courseTab - 1;
        }
      } else {
        // otherwise, select the first main tab
        this.courseTab = null;
        this.mainTab = 0;
      }
    },
    selectCourse(courseId) {
      // Called when user selects a course from
      // a main tab component: list or network
      const courseIndex = this.courseTabs.findIndex(
        ({ id }) => id === courseId
      );
      if (courseIndex >= 0) {
        // course is already available as a tab
        this.courseTab = courseIndex;
      } else {
        // course is not a tab, so we add it as a tab and select it
        const course = api.getCourseById(courseId);
        const newLength = this.courseTabs.push(course);
        this.courseTab = newLength - 1;
      }
    }
  },
  computed: {
    programEnabled() {
      return this.selectedLevel !== `` && this.programs.length > 0;
    },
    masterspecsEnabled() {
      return this.selectedProgram !== `` && this.masterspecs.length > 0;
    },
    currentProperties() {
      // Compute properties to pass on to the current component
      const {
        currentComponent,
        subgraphNodes,
        ingoingNodes,
        outgoingNodes,
        subgraphLinks,
        ingoingLinks,
        outgoingLinks,
        courseDetail
      } = this;

      switch (currentComponent) {
        case "CourseList":
        case "DemoViz":
          return { courses: subgraphNodes };
        case "CourseViz":
          return {
            subgraphNodes,
            ingoingNodes,
            outgoingNodes,
            subgraphLinks,
            ingoingLinks,
            outgoingLinks
          };
        case "CourseDetail":
          return courseDetail;
        default:
          return {};
      }
    }
  }
};
</script>

<style scoped>
.spec-icon {
  margin-right: 5px;
}

.home {
  padding: 0;
}

.home,
.home-content {
  height: 100%;
}

.view-pane {
  min-height: 100vh;
}

.view-pane__tabs {
  width: 100%;
}

.view-pane__tabs .v-tabs {
  width: auto;
}

.view-pane__tabs .v-tabs.course-tabs {
  overflow-x: auto;
}

.filters-pane > .v-card {
  padding: 30px;
  height: 100%;
}

.filters-pane .v-select,
.filters-pane .v-autocomplete {
  width: 100%;
}
</style>

<style>
.filters-pane .v-select__selections input[readonly="readonly"] {
  /* Override style to fit selected items that don't fit on one line */
  height: 0;
  padding: 0;
}

.v-autocomplete.v-select--is-menu-active .v-input__icon--append .v-icon {
  transform: none;
}
</style>
