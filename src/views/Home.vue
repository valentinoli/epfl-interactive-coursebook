<template>
  <v-container fluid class="home">
    <v-row v-if="error">
      <v-col>{{ error }}</v-col>
    </v-row>

    <v-sheet
      v-else-if="loading"
      :color="`grey ${theme.isDark ? 'darken-2' : 'lighten-4'}`"
      class="px-3 pt-3 pb-3"
    >
      <v-skeleton-loader
        class="mx-auto"
        max-width="500"
        type="card"
      ></v-skeleton-loader>
    </v-sheet>

    <div v-else>
      <v-row align="center" justify="center" justify-sm="start">
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
            {{ item.text }}
          </template>
          <template v-slot:selection-data="{ item }">
            <img class="spec-icon" :src="item.iconUrl" />
            {{ item.text }}
          </template>
        </Select>

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
      </v-row>

      <CourseList :courses="courses" />
    </div>
  </v-container>
</template>

<script>
// @ is an alias to /src
import api from "@/services/api";
import CourseList from "@/components/CourseList"
import Select from "@/components/Select"

export default {
  name: "Home",
  components: {
    CourseList,
    Select
  },
  data () {
    return {
      loading: true,
      loadingCourses: false,
      error: false,
      programs: [],
      masterspecs: [],
      sections: [],
      courses: [],
      selectedLevel: "",
      selectedProgram: "",
      selectedMasterspec: "",
      selectedSection: "",
      selectedCredits: "",
      selectedSemester: ""
    };
  },
  async created () {
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
    selectedLevel () {
      this.programs = api.getProgramsByLevel(this.selectedLevel);

      this.selectedProgram = "";
      this.selectedMasterspec = "";

      this.setCourseFiltersAndUpdateCourses();
    },
    selectedProgram () {
      if (this.selectedLevel === "master") {
        this.masterspecs = api.getMasterspecsByProgram(this.selectedProgram);
      }

      this.selectedMasterspec = "";

      this.setCourseFiltersAndUpdateCourses();
    },
    selectedMasterspec () {
      this.setCourseFiltersAndUpdateCourses();
    },
    selectedSection () {
      this.updateCourses();
    },
    selectedCredits () {
      this.updateCourses();
    },
    selectedSemester () {
      this.updateCourses();
    }
  },
  methods: {
    setCourseFiltersAndUpdateCourses () {
      // Needs to be done in this order
      this.setCourseFilterDefaults();
      this.updateCourses();
      this.updateCourseFilters();
    },
    setCourseFilterDefaults () {
      this.selectedSection = "";
      this.selectedCredits = "";
      this.selectedSemester = "";
    },
    updateCourses () {
      this.courses = api.getCourses(this);
    },
    updateCourseFilters () {
      // Call this method only after courses have been updated
      const {
        sections,
        credits,
        semesters
      } = api.getCourseFilterOptions(this.courses);

      this.sections = sections;
      this.credits = credits;
      this.semesters = semesters;
    }
  },
  computed: {
    programEnabled () {
      return this.selectedLevel !== `` && this.programs.length > 0;
    },
    masterspecsEnabled () {
      return this.selectedProgram !== `` && this.masterspecs.length > 0;
    }
  },
  inject: ['theme']
};
</script>

<style scoped>
.spec-icon {
  margin-right: 32px;
}
</style>
