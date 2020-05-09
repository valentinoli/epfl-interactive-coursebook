<template>
  <v-row class="list" align="center">
    <v-col align="center">
      <v-list dense rounded two-line flat width="100%">
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
              v-for="{ id, name, specs } in coursesDisplayed"
              :key="id"
            >
              <v-list-item
                @click="$emit('selectCourse', id)"
                :title="name"
                v-ripple="{ class: `red--text` }"
                color="black"
              >
                <v-list-item-content>
                  <v-list-item-title v-text="id"></v-list-item-title>
                  <v-list-item-subtitle v-text="name"></v-list-item-subtitle>
                </v-list-item-content>
                <template v-if="specs">
                  <img
                    v-for="{ id, name, iconUrl } in specs"
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
  </v-row>
</template>

<script>
export default {
  name: "CourseList",
  props: {
    courses: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
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
      const { courses, recordFrom, recordTo } = this;
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
  watch: {
    courses() {
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
