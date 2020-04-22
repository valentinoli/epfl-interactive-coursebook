<template>
  <v-container fluid class="home">
    <v-row v-if="error">
      <v-col>{{ error }}</v-col>
    </v-row>
    <v-row v-else-if="loading">
      <v-col>Loading...</v-col>
    </v-row>

    <v-row v-else align="center" justify="center" justify-sm="start">
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
    </v-row>

    <!-- <v-row align="center" justify="center">

    </v-row> -->

    <v-row v-if="loadingCourses">
      <v-col>Loading...</v-col>
    </v-row>
    <CourseList v-else :courses="courses" />
  </v-container>
</template>

<script>
// @ is an alias to /src
/* eslint-disable */
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
      selectedMasterspec: ""
    };
  },
  async created () {
    try {
      await api.loadAllData();
      // Don't need getters and setters for the levels
      this.$options.levels = api.getAllLevels();
      this.courses = api.getCourses();
    } catch (err) {
      this.error = err;
    } finally {
      this.loading = false;
    }
  },
  watch: {
    selectedSection () {
      this.selectedLevel = "";
      this.selectedProgram = "";
      this.selectedMasterspec = "";

      this.setCourses();
    },
    selectedLevel () {
      this.programs = api.getProgramsByLevel(this.selectedLevel);

      this.selectedProgram = "";
      this.selectedMasterspec = "";

      this.setCourses(/*newLevel*/);
    },
    selectedProgram () {
      if (this.selectedLevel === "master") {
        this.masterspecs = api.getMasterspecsByProgram(this.selectedProgram);
      }

      this.selectedMasterspec = "";

      this.setCourses();
    },
    selectedMasterspec () {
      this.setCourses();
    }
  },
  methods: {
    setCourses () {
      this.loadingCourses = true;
      window.setTimeout(() => {
        this.courses = api.getCourses(this);
        this.loadingCourses = false;
      }, 25)
    }
  },
  computed: {
    programEnabled () {
      return this.selectedLevel !== `` && this.programs.length > 0;
    },
    masterspecsEnabled () {
      return this.selectedProgram !== `` && this.masterspecs.length > 0;
    }
  }
};
</script>

<style scoped>
.spec-icon {
  margin-right: 32px;
}
</style>
