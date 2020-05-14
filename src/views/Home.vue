<template>
  <v-container fluid class="home">
    <v-row v-if="error">
      <v-col>{{ error }}</v-col>
    </v-row>

    <SkeletonLoader v-else-if="loading" />

    <v-row v-else class="home-content">
      <v-col cols="12" md="4" lg="3" class="pt-0">
        <v-card
          class="filters d-flex flex-column align-center align-md-start justify-start"
        >
          <p class="title">
            Filters
          </p>

          <div class="filters__hierarchical">
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
                <img class="spec-icon" :src="item.iconUrl" />
                <span>{{ item.text }}</span>
              </template>
            </Select>
          </div>

          <div class="filters__global">
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
              label="Select number of credits"
            />

            <Select
              :value.sync="selectedSemester"
              :items="semesters"
              :key="selectedSemester || `nosemester`"
              label="Select semester"
            />
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="8" lg="9" class="view-pane">
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
            v-if="courseTabs.length > -1"
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
              @[selectCourseEventName]="selectCourse"
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
      mainTab: 0,
      courseTab: null,
      courseTabs: [],
      displayedCourse: null,

      loading: true,
      loadingCourses: false,
      error: false,

      programs: [],
      masterspecs: [],
      sections: [],
      credits: [],
      semesters: [],
      courses: [],
      links: [],

      selectedLevel: "",
      selectedProgram: "",
      selectedMasterspec: "",
      selectedSection: "",
      selectedCredits: "",
      selectedSemester: ""
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
      this.courses = api.getCourses(this);
      this.links = api.getLinks();

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

      this.setCourseFiltersAndUpdateCourses();
    },
    selectedProgram() {
      if (this.selectedLevel === "master") {
        this.masterspecs = api.getMasterspecsByProgram(this.selectedProgram);
      }

      this.selectedMasterspec = "";

      this.setCourseFiltersAndUpdateCourses();
    },
    selectedMasterspec() {
      this.setCourseFiltersAndUpdateCourses();
    },
    selectedSection() {
      this.updateCourses();
    },
    selectedCredits() {
      this.updateCourses();
    },
    selectedSemester() {
      this.updateCourses();
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

        this.displayedCourse = this.courseTabs[newTab];
        this.setCurrentComponent("CourseDetail");
      }
    }
  },
  methods: {
    setCourseFiltersAndUpdateCourses() {
      // Needs to be done in this order
      this.setCourseFilterDefaults();
      this.updateCourses();
      this.updateCourseFilters();
    },
    setCourseFilterDefaults() {
      this.selectedSection = "";
      this.selectedCredits = "";
      this.selectedSemester = "";
    },
    updateCourses() {
      this.courses = api.getCourses(this);
    },
    updateCourseFilters() {
      // Call this method only after courses have been updated
      const { sections, credits, semesters } = api.getCourseFilterOptions(
        this.courses
      );

      this.sections = sections;
      this.credits = credits;
      this.semesters = semesters;
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
      const { currentComponent, courses, links, displayedCourse } = this;

      switch (currentComponent) {
        case "CourseList":
        case "DemoViz":
          return { courses };
        case "CourseViz":
          return { courses, links };
        case "CourseDetail":
          return displayedCourse;
        default:
          return {};
      }
    },
    selectCourseEventName() {
      if (this.currentComponent !== "CourseDetail") {
        // We only want to bind the selectCourse event
        // to the list and viz components
        return "selectCourse";
      }

      return null;
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
  padding: 10px 30px 15px;
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

.filters {
  padding: 30px;
}

.filters .v-select {
  /* width: 270px; */
  /* flex-grow: 0; */
}
</style>
