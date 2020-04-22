<template>
  <div>
    <v-row>
      <v-col cols="12" sm="4" md="3" class="d-flex flex-column">
        <!-- General -->
        <v-card>
          <v-card-title>{{ code }}</v-card-title>
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
      <v-col cols="12" sm="4" md="3" class="d-flex flex-column">
        <!-- Notes -->
        <v-alert
          v-if="note"
          type="info"
        >
          {{
            note.startsWith('(') && note.endsWith(')')
            ? note.slice(1, -1)
            : note
          }}
        </v-alert>

        <v-alert
          v-if="number_of_places"
          type="info"
        >
          {{ `Limited number of places: ${number_of_places}` }}
        </v-alert>

        <!-- Lecturers and programs -->
        <v-card v-if="lecturers.length > 0">
          <v-card-title>Lecturers</v-card-title>
          <v-card-text>
            <div class="lecturer" v-for="[name, url] in lecturers" :key="url">
              <v-btn class="ma-2" icon color="red lighten-2" :href="url" target="_blank">
                <v-icon small>mdi-launch</v-icon>
              </v-btn>
              {{ name }}
            </div>
          </v-card-text>
        </v-card>

        <v-card v-if="in_the_programs.length > 0">
          <v-card-title>Programs</v-card-title>
          <v-card-text>
            <div class="text--primary" v-for="([name, semester], idx) in in_the_programs" :key="idx">
              {{ `${name}${semester ? ', ' + semester : ''}` }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4" md="6">
        <!-- Registrations -->
        <svg></svg>
      </v-col>
    </v-row>
  </div>
</template>

<script>
// import * as d3 from "d3";

export default {
  props: {
    code: String,
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

    // Registrations
    registrations: {
      type: Object,
      default: () => ({})
    }
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
        "Lecture": this.lecture,
        "Exercises": this.exercises,
        "Project": this.project,
        "Practical work": this.practical_work,
        "Labs": this.labs
      };

      const filtered = this.filterEmptyProps(info);
      return filtered;
    }
  },
  methods: {
    filterEmptyProps (obj) {
      return Object.fromEntries(
        Object.entries(obj).filter(entry =>
          Boolean(entry[1]) &&
          (!Array.isArray(entry[1]) || entry[1].length > 0)
        )
      );
    }
  }
};
</script>

<style scoped>
/* dl {
  margin-top: 50px;
}

dt {
  font-weight: bold;
  min-width: 150px;
}

dt::after {
  content: ":";
}

dl > div {
  display: flex;
} */
.lecturer {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow-x: hidden;
}

.v-card + .v-card {
  margin-top: 16px;
}
</style>
