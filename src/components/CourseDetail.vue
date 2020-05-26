<template>
  <div>
    <v-row class="course-detail mx-1">
      <v-col cols="12" md="3" xl="4" class="d-flex flex-column">
        <!-- General -->
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <span>{{ id }}</span>
            <v-btn
              :href="coursebookUrl"
              target="_blank"
              text
              icon
              color="red"
              title="View source"
            >
              <v-icon>mdi-web</v-icon>
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
        <v-alert v-if="note" type="info">
          {{ noteCleaned }}
        </v-alert>

        <v-alert v-if="number_of_places" type="info">
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
            <v-card-title>{{ title }}</v-card-title>
            <v-card-text>
              <div v-for="{ id, name } in courses" :key="id">
                <a @click="$emit('selectCourse', id)">
                  {{ id }} - {{ name }}
                </a>
              </div>
            </v-card-text>
          </v-card>
        </template>

        <!-- Lecturers -->
        <v-card v-if="lecturers.length > 0" class="lecturers">
          <v-card-title>Lecturers</v-card-title>
          <v-card-text>
            <div v-for="[name, url, src] in lecturers" :key="url" class="mb-3">
              <v-avatar color="grey" size="40" class="mr-2">
                <v-img :src="`https://people.epfl.ch${src}`" :alt="name"></v-img>
              </v-avatar>
              <a :href="url" target="_blank">{{ name }}</a
              >&nbsp;
              <v-icon x-small>mdi-open-in-new</v-icon>
            </div>
          </v-card-text>
        </v-card>

        <!-- Workload -->
        <v-card>
          <v-card-title>Workload</v-card-title>
          <v-list two-line>
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
a {
  color: red;
}

a:not(.v-btn):hover {
  /* Don't underline v-btn */
  text-decoration: underline;
}

a:not(:hover) {
  text-decoration: none;
}

.course-detail > .flex-column > .v-card,
.course-detail > .flex-column > .v-alert {
  flex-grow: 1;
}

.course-detail > .flex-column > .v-card:not(:first-child),
.course-detail > .flex-column > .v-alert:not(:first-child) {
  margin-top: 16px;
}
</style>
