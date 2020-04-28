<template>
  <v-container fluid class="home">
    <v-row v-if="error">
      <v-col>{{ error }}</v-col>
    </v-row>

    <SkeletonLoader v-else-if="loading" />

    <v-row v-else class="home-content d-flex flex-column flex-sm-row">
      <v-card
        class="filters d-flex flex-column align-center align-sm-start justify-start"
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
        <!-- <div class="d-flex justify-center align-center d-sm-none">
          <v-btn class="ma-2" text icon color="red lighten-2">
            <v-icon>mdi-arrow</v-icon>
          </v-btn>
        </div> -->
      </v-card>
      <v-col class="view-pane">
        <v-tabs class="d-flex justify-center justify-sm-start">
          <v-tab
            @click="
              currentTabComponent = `CourseViz`;
            "
            >Network</v-tab
          >
          <v-tab
            @click="
              currentTabComponent = `CourseList`;
            "
            >List</v-tab
          >
        </v-tabs>
        <keep-alive>
          <component :is="currentTabComponent" :courses="courses"></component>
        </keep-alive>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// @ is an alias to /src
import api from "@/services/api";
import CourseList from "@/components/CourseList";
import CourseViz from "@/components/CourseViz";
import Select from "@/components/Select";
import SkeletonLoader from "@/components/SkeletonLoader";

export default {
  name: "Home",
  components: {
    CourseList,
    CourseViz,
    Select,
    SkeletonLoader
  },
  data() {
    return {
      currentTabComponent: "CourseViz",

      loading: true,
      loadingCourses: false,
      error: false,

      programs: [],
      masterspecs: [],
      sections: [],
      credits: [],
      semesters: [],
      courses: [],

      selectedLevel: "",
      selectedProgram: "",
      selectedMasterspec: "",
      selectedSection: "",
      selectedCredits: "",
      selectedSemester: ""
    };
  },
  async created() {
    try {
      await api.loadAllData();
      // Don't need getters and setters for the levels
      this.$options.levels = api.getAllLevels();
      this.courses = api.getCourses();

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
    }
  },
  computed: {
    programEnabled() {
      return this.selectedLevel !== `` && this.programs.length > 0;
    },
    masterspecsEnabled() {
      return this.selectedProgram !== `` && this.masterspecs.length > 0;
    }
  }
};
</script>

<style scoped>
.spec-icon {
  margin-right: 5px;
}

.home {
  padding-right: 0;
  padding-left: 0;
  padding-bottom: 0;
}

.home,
.home-content {
  height: 100%;
}

.view-pane {
  padding: 5px 30px 15px;
}

.filters {
  padding: 30px;
}

.filters .v-select {
  width: 270px;
  flex-grow: 0;
}
</style>
