<template>
  <v-container fluid class="home">
    <v-row align="center">
      <v-col v-if="error" class="d-flex" cols="12">{{ error }}</v-col>
      <v-col v-else-if="loading" class="d-flex" cols="12">Loading...</v-col>
      <template v-else>
        <v-col class="d-flex" cols="12" sm="4">
          <v-select
            v-model="selectedLevel"
            :items="levels"
            label="Select level"
            outlined
            autofocus
            clearable
          ></v-select>
        </v-col>

        <v-col class="d-flex" cols="12" sm="4">
          <v-autocomplete
            v-if="programs.length && selectedLevel"
            v-model="selectedProgram"
            :items="programs"
            label="Select program"
            outlined
            autofocus
            clearable
          ></v-autocomplete>
        </v-col>

        <v-col class="d-flex" cols="12" sm="4">
          <v-autocomplete
            v-if="masterspecs.length && selectedProgram"
            v-model="selectedMasterspec"
            :items="masterspecs"
            label="Select specialization"
            outlined
            autofocus
            clearable
            :specs="masterspecs"
          >
            <template v-slot:item="{ item }">
              <v-list-item-icon>
                <img :src="item.iconUrl" />
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-html="item.text"></v-list-item-title>
              </v-list-item-content>
            </template>
          </v-autocomplete>
        </v-col>
      </template>
    </v-row>

    <v-container fluid class="data">
      <div v-if="loadingCourses">
        Loading...
      </div>
      <CourseList v-else :courses="courses" />
    </v-container>
  </v-container>
</template>

<script>
// @ is an alias to /src
/* eslint-disable */
import api from "@/services/api";
import CourseList from "@/components/CourseList"

export default {
  name: "Home",
  components: {
    CourseList
  },
  data () {
    return {
      loading: true,
      loadingCourses: false,
      error: false,
      levels: [],
      programs: [],
      masterspecs: [],
      courses: {},  // object
      selectedLevel: "",
      selectedProgram: "",
      selectedMasterspec: ""
    };
  },
  async created () {
    try {
      await api.loadAllData();
      this.levels = api.getAllLevels();
      this.courses = api.getCourses();
    } catch (err) {
      this.error = err;
    } finally {
      this.loading = false;
    }
  },
  watch: {
    selectedLevel (newLevel) {
      this.setCourses(newLevel);

      this.programs = api.getProgramsByLevel(newLevel);

      this.selectedProgram = "";
      this.selectedMasterspec = "";
    },
    selectedProgram (newProgram) {
      this.setCourses(this.selectedLevel, newProgram);

      if (this.selectedLevel === "master") {
        this.masterspecs = api.getMasterspecsByProgram(newProgram);
      }

      this.selectedMasterspec = "";
    },
    selectedMasterspec (newSpec) {
      this.setCourses(this.selectedLevel, this.selectedProgram, newSpec);
    }
  },
  methods: {
    setCourses (level = "", program = "", spec = "") {
      this.loadingCourses = true;
      window.setTimeout(() => {
        this.courses = api.getCourses(level, program, spec);
        this.loadingCourses = false;
      }, 50)
    }
  }
};
</script>
