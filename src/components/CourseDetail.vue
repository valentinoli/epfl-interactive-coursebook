<template>
  <div>
    <v-row class="course-detail mx-1">
      <v-col cols="12" md="3" xl="4" class="d-flex flex-column">
        <!-- General -->
        <v-card>
          <v-card-title class="d-flex justify-space-between mb-2">
            <span>{{ id }}</span>
            <v-btn :href="coursebookUrl" target="_blank" outlined small>
              source<v-icon right small>mdi-open-in-new</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-subtitle>{{ name }}</v-card-subtitle>
          <v-list>
            <v-list-item v-for="(val, key) in generalInfo" :key="key">
              <v-list-item-content>
                <v-list-item-title>{{ key }}</v-list-item-title>
                <v-list-item-subtitle>{{ val }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="3" xl="4" class="d-flex flex-column">
        <!-- Notes -->
        <v-alert v-if="note" type="info" :elevation="2">
          {{ noteCleaned }}
        </v-alert>

        <v-alert v-if="number_of_places" type="info" :elevation="2">
          {{ `Limited number of places: ${number_of_places}` }}
        </v-alert>

        <!-- Ingoing/Outgoing prerequisites -->
        <template
          v-for="{ courses, title } in [
            { courses: ingoing, title: 'Requirements' },
            { courses: outgoing, title: 'Preparation for' }
          ]"
        >
          <v-card v-if="courses.length" :key="title">
            <v-card-title class="pb-0">{{ title }}</v-card-title>
            <v-list>
              <v-list-item
                v-for="{ id, name } in courses"
                :key="id"
                @click="$emit('selectCourse', id)"
                :title="name"
                dense
              >
                <v-list-item-content>
                  <v-list-item-title>{{ id }} {{ name }}</v-list-item-title>
                </v-list-item-content>
                <v-list-item-icon>
                  <v-icon small>mdi-eye</v-icon>
                </v-list-item-icon>
              </v-list-item>
            </v-list>
          </v-card>
        </template>

        <!-- Lecturers -->
        <v-card v-if="lecturers.length > 0">
          <v-card-title class="pb-0">Lecturers</v-card-title>
          <v-list>
            <v-list-item
              v-for="[name, url, src] in lecturers"
              :key="url"
              :href="url"
              target="_blank"
              :title="name"
              dense
            >
              <v-list-item-avatar color="grey">
                <v-img
                  v-if="src"
                  :src="`https://people.epfl.ch${src}`"
                  :alt="name"
                ></v-img>
                <v-icon v-else dark>mdi-account-circle</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title v-text="name"></v-list-item-title>
              </v-list-item-content>
              <v-list-item-icon>
                <v-icon small>mdi-open-in-new</v-icon>
              </v-list-item-icon>
            </v-list-item>
          </v-list>
        </v-card>

        <!-- Workload -->
        <v-card>
          <v-card-title>Workload</v-card-title>
          <v-list two-line class="pt-0">
            <v-list-item v-for="(val, key) in miscInfo" :key="key">
              <v-list-item-content>
                <v-list-item-title>{{ key }}</v-list-item-title>
                <v-list-item-subtitle>{{ val }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="6" xl="4" class="d-flex flex-column">
        <!-- Registrations -->
        <RegistrationsChart :id="id" />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import RegistrationsChart from "@/components/RegistrationsChart.vue";

export default {
  props: {
    path: String,

    id: String,
    name: String,

    // General
    section: String,
    semester: String,
    credits: String,
    language: String,
    exam_form: String,

    // Alerts
    note: String,
    number_of_places: String,

    // Workload
    lecture: String,
    exercises: String,
    project: String,
    practical_work: String,
    labs: String,

    // Programs and lecturers
    in_the_programs: {
      type: Array,
      default: () => []
    },
    lecturers: {
      type: Array,
      default: () => []
    },

    // Ingoing/outgoing prerequisites
    ingoing: {
      type: Array,
      default: () => []
    },
    outgoing: {
      type: Array,
      default: () => []
    },

    // Registrations
    registrations: {
      type: Object,
      default: () => ({})
    }
  },
  watch: {
    id() {
      // Scroll to top when new id is passed,
      // to enhance UX when user selects a course from
      // "Requirements" or "Preparation for" lists
      window.scrollTo(0, 0);
    }
  },
  components: {
    RegistrationsChart
  },
  computed: {
    generalInfo() {
      const info = {
        Semester: this.semester,
        Credits: this.credits,
        Language: this.language,
        "Exam form": this.exam_form,
        Section: this.section
      };
      const filtered = this.filterEmptyProps(info);
      return filtered;
    },
    miscInfo() {
      const info = {
        Lecture: this.lecture,
        Exercises: this.exercises,
        Project: this.project,
        "Practical work": this.practical_work,
        Labs: this.labs
      };

      const filtered = this.filterEmptyProps(info);
      return filtered;
    },
    noteCleaned() {
      const { note } = this;
      return note.startsWith("(") && note.endsWith(")")
        ? note.slice(1, -1)
        : note;
    },
    coursebookUrl() {
      return `https://edu.epfl.ch${this.path}`;
    }
  },
  methods: {
    filterEmptyProps(obj) {
      return Object.fromEntries(
        Object.entries(obj).filter(
          entry =>
            Boolean(entry[1]) &&
            !(entry[1] === "Inapplicable") && // if value is "Inapplicable", remove it
            (!Array.isArray(entry[1]) || entry[1].length > 0)
        )
      );
    }
  }
};
</script>

<style scoped>
.course-detail > .flex-column > .v-card,
.course-detail > .flex-column > .v-alert {
  flex-grow: 1;
}

.course-detail > .flex-column > .v-card:not(:last-child) {
  margin-bottom: 16px;
}
</style>
