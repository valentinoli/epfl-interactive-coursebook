<template>
  <v-row class="list" align="center">
    <v-slide-y-transition mode="out-in">
      <v-col
        v-if="selectedCourse"
        class="d-flex flex-column"
      >
        <CourseDetail v-bind="selectedCourse" />

        <v-item-group class="align-self-center align-self-md-start">
          <v-btn
            @click="selectedCourse = null"
            large
            outlined
            color="red"
          >
            <v-icon left dark>mdi-keyboard-return</v-icon> back
          </v-btn>
        </v-item-group>
      </v-col>

      <v-col v-else align="center">
        <v-list dense rounded two-line width="100%">
          <v-pagination
            v-if="courses.length > 0"
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
                sm="6"
                md="4"
                lg="3"
                xl="2"
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
                    <v-list-item-subtitle
                      v-text="v.name"
                    ></v-list-item-subtitle>
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
          {{ pageInfo }}
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
    pages() {
      return Math.ceil(this.courses.length / this.pagesize);
    },
    recordFrom() {
      return (this.page - 1) * this.pagesize + 1;
    },
    recordTo() {
      return Math.min(this.recordFrom + this.pagesize - 1, this.courses.length);
    },
    pageInfo() {
      const { courses, recordFrom, recordTo } = this
      if (courses.length) {
        return `Showing ${recordFrom}-${recordTo} of ${courses.length}`;
      }

      return `No courses found`;
    },
    coursesDisplayed() {
      const index = this.page - 1;
      const { pagesize } = this;
      return this.courses.slice(index * pagesize, index * pagesize + pagesize);
    }
  },
  methods: {
    onCourseClicked(event, code, courseInfo) {
      this.selectedCourse = { ...{ code }, ...courseInfo };
    }
  },
  watch: {
    courses () {
      // course selection changed, initialize current page
      this.page = 1;
    }
  }
};
</script>

<style scoped>
.v-list-item {
  border: 0.5px groove rgba(255, 0, 0, 0.5);
}

.v-list-item--link::before,
.v-list-item--link:hover::before {
  /* Override Vuetify default color */
  background-color: red;
}
</style>
