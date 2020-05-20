<template>
  <v-row class="course-detail">
    <v-col cols="12" md="3" class="d-flex flex-column">
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
              <a @click="$emit('selectCourse', id)"> {{ id }} - {{ name }} </a>
            </div>
          </v-card-text>
        </v-card>
      </template>

      <!-- Notes -->
      <v-alert v-if="note" type="info">
        {{ noteCleaned }}
      </v-alert>

      <v-alert v-if="number_of_places" type="info">
        {{ `Limited number of places: ${number_of_places}` }}
      </v-alert>
    </v-col>
    <v-col cols="12" md="3" class="d-flex flex-column">
      <!-- Lecturers -->
      <v-card v-if="lecturers.length > 0" class="lecturers">
        <v-card-title>Lecturers</v-card-title>
        <v-card-text>
          <div v-for="[name, url] in lecturers" :key="url">
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

      <!-- Programs -->
      <v-card v-if="in_the_programs.length > 0">
        <v-card-title>Programs</v-card-title>
        <v-card-text>
          <div
            class="text--primary"
            v-for="(val, idx) in in_the_programs"
            :key="idx"
          >
            {{ val.join(", ") }}
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="5" class="d-flex flex-column">
      <!-- Registrations -->
      <svg id="viz-registrations"></svg>
    </v-col>
  </v-row>
</template>

<script>
import * as d3 from "d3";

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
  mounted() {
    this.logdata();
    this.renderRegistrations();
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
    },
    renderRegistrations() {
      const margin = { top: 30, right: 0, bottom: 10, left: 60 };
      const barHeight = 25;

      //mapping key:value to {year: key, registrations: value}
      let data = [];
      var element = {};
      Object.entries(this.registrations).forEach(item => {
        element = {};
        element.year = item[0];
        element.registrations = item[1];
        data.push(element);
      });
      data = data.reverse();

      const height =
        Math.ceil((data.length + 0.1) * barHeight) + margin.top + margin.bottom;
      const width = "400";

      const x = d3
        .scaleLinear()
        .domain([0, d3.max(data, d => d.registrations)])
        .range([margin.left, width - margin.right]);

      const format = x.tickFormat(20, data.format);

      const y = d3
        .scaleBand()
        .domain(d3.range(data.length))
        .rangeRound([margin.top, height - margin.bottom])
        .padding(0.1);

      const xAxis = g =>
        g
          .attr("transform", `translate(0,${margin.top})`)
          .call(d3.axisTop(x).ticks(width / 80, data.format))
          .call(g => g.select(".domain").remove());

      const yAxis = g =>
        g.attr("transform", `translate(${margin.left},0)`).call(
          d3
            .axisLeft(y)
            .tickFormat(i => data[i].year)
            .tickSizeOuter(0)
        );

      // selecting the svg from the template
      const svg = d3.select("#viz-registrations");
      svg.selectAll("*").remove();
      svg.attr("viewBox", [0, 0, width, height]);

      //add rectangles
      svg
        .append("g")
        .attr("fill", "steelblue")
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", x(0))
        .attr("y", (d, i) => y(i))
        .attr("width", d => x(d.registrations) - x(0))
        .attr("height", y.bandwidth());

      //add white text on bars
      svg
        .append("g")
        .attr("fill", "white")
        .attr("text-anchor", "end")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .selectAll("text")
        .data(data)
        //add black text outside small or absent bars
        .join("text")
        .attr("x", d => x(d.registrations))
        .attr("y", (d, i) => y(i) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("dx", -4)
        .text(d => format(d.registrations))
        .call(text =>
          text
            .filter(d => x(d.registrations) - x(0) < 20) // short bars
            .attr("dx", +4)
            .attr("fill", "black")
            .attr("text-anchor", "start")
        );

      svg.append("g").call(xAxis);

      svg.append("g").call(yAxis);
    },
    logdata() {
      console.log(this.registrations);
    } /*,
    render() {
      this.$options.histogram.render(???);
    }*/
  },
  watch: {
    registrations() {
      // course selection changed, initialize current page
      this.renderRegistrations();
    }
  }
};
</script>

<style scoped>
a {
  color: red;
}

a:hover {
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
