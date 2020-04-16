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

    <v-row v-if="selectedCourse">
      <v-col>
        <dl class="course-info" id="selected-course">
          <div v-for="(val, key) in selectedCourse" :key="key">
            <dt>{{ capitalize(replaceUnderscore(key)) }}</dt>
            <dd>{{ val }}</dd>
          </div>
        </dl>
      </v-col>
    </v-row>

    <v-row align="center">
      <div v-if="loadingCourses">
        Loading...
      </div>
      <!-- class="d-flex align-center flex-column flex-sm-row flex-sm-wrap sm3" -->
      <v-list v-else dense rounded two-line>
        <v-row>
          <v-col
            cols="12"
            sm="6"
            md="4"
            lg="3"
            v-for="[k, v] in courses"
            :key="k"
          >
            <v-list-item @click="onCourseClicked($event, k, v)" :title="v.name">
              <v-list-item-content>
                <v-list-item-title v-text="k"></v-list-item-title>
                <v-list-item-subtitle v-text="v.name"></v-list-item-subtitle>
              </v-list-item-content>
              <template v-if="v.specs">
                <img
                  v-for="{ id, name, iconUrl } in v.specs"
                  :key="id"
                  :src="iconUrl"
                  :title="name"
                />
              </template>
            </v-list-item>
          </v-col>
        </v-row>
      </v-list>
    </v-row>
  </v-container>
</template>

<script>
// @ is an alias to /src
/* eslint-disable */
import api from "@/services/api";
import { replaceUnderscore, capitalize } from "@/services/util";

export default {
  name: "Home",
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
      selectedMasterspec: "",
      selectedCourse: null
    };
  },
  async created () {
    console.log("created");
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
  beforeUpdate () {
    console.log("beforeUpdate");
  },
  updated () {
    console.log("updated");
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
        this.selectedCourse = null;
      }, 50)
    },
    onCourseClicked (event, code, courseInfo) {
      this.selectedCourse = {...{ code }, ...courseInfo};
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    },
    replaceUnderscore,
    capitalize
  }
};
</script>

<style scoped>
.course-info dt {
  font-weight: bold;
  min-width: 150px;
}

.course-info dt::after {
  content: ":";
}

.course-info > div {
  display: flex;
}
</style>
