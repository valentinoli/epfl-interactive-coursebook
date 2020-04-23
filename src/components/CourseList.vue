<template>
  <v-row align="center">
    <v-slide-y-transition mode="out-in">
      <v-col v-if="selectedCourse" class="d-flex flex-column flex-sm-column-reverse">
        <!-- <div> -->
          <v-item-group class="nav-source-btn-group">
            <v-btn @click="selectedCourse = null" large rounded dark color="red">
              <v-icon left dark>mdi-keyboard-return</v-icon> back
            </v-btn>
            <v-btn :href="selectedCourseUrl" target="_blank" large rounded outlined color="red">
              <v-icon left dark>mdi-web</v-icon> source
            </v-btn>
          </v-item-group>

          <CourseDetail v-bind="selectedCourse" />
        <!-- </div> -->
      </v-col>

      <!-- :key=page so new page doesn't inherit selected item highlighting -->
      <v-col v-else :key="page" align="center">
        <v-list dense rounded two-line width="100%">
          <v-pagination
            v-model="page"
            :length="pages"
            circle
            total-visible="10"
            color="red"
          />

          <v-list-item-group color="red">
            <v-row align="center">
              <v-col
                cols="12"
                sm="4"
                md="3"
                lg="2"
                xl="1"
                v-for="[k, v] in coursesDisplayed"
                :key="k"
              >
                <v-list-item
                  @click="onCourseClicked($event, k, v)"
                  :title="v.name"
                  v-ripple="{ class: `red--text` }"
                >
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
          </v-list-item-group>
        </v-list>
        <div>
          Showing
          {{ recordFrom }}-{{ recordTo }} of {{ courses.length }}
        </div>
      </v-col>
    </v-slide-y-transition>
  </v-row>
</template>

<script>
import CourseDetail from "@/components/CourseDetail";

export default {
  name: "CourseList",
  components: {
    CourseDetail
  },
  props: {
    courses: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedCourse: null,
      page: 1,
      pagesize: 24
    };
  },
  computed: {
    pages () {
      return Math.ceil(this.courses.length / this.pagesize);
    },
    recordFrom() {
      return (this.page - 1) * this.pagesize + 1;
    },
    recordTo() {
      return Math.min(this.recordFrom + this.pagesize - 1, this.courses.length);
    },
    coursesDisplayed () {
      const index = this.page - 1;
      const { pagesize } = this;
      return this.courses.slice(index * pagesize, index * pagesize + pagesize);
    },
    selectedCourseUrl () {
      const { selectedCourse } = this;
      if (selectedCourse) {
        return `https://edu.epfl.ch${selectedCourse.path}`;
      }
      return "";
    },
  },
  methods: {
    onCourseClicked(event, code, courseInfo) {
      this.selectedCourse = { ...{ code }, ...courseInfo };
    }
  }
};
</script>

<style scoped>
.nav-source-btn-group > .v-btn:not(:last-child) {
  margin-right: 10px;
}

.v-list-item {
  border: 0.5px groove rgba(255, 0, 0, 0.5);
}

.v-list-item--link::before,
.v-list-item--link:hover::before {
  /* Override Vuetify default color */
  background-color: red;
}
</style>
