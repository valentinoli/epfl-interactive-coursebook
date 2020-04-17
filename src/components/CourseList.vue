<template>
  <div>
    <v-row v-if="selectedCourse">
      <v-col>
        <dl>
          <div v-for="(val, key) in selectedCourse" :key="key">
            <dt>{{ capitalize(replaceUnderscore(key)) }}</dt>
            <dd>{{ val }}</dd>
          </div>
        </dl>
      </v-col>
    </v-row>

    <v-row align="center">
      <v-list dense rounded two-line>
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
  </div>
</template>

<script>
import { replaceUnderscore, capitalize } from "@/services/util";

export default {
  name: "Home",
  props: ["courses"],
  data() {
    return {
      selectedCourse: null
    };
  },
  methods: {
    onCourseClicked(event, code, courseInfo) {
      this.selectedCourse = { ...{ code }, ...courseInfo };
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth"
      });
    },
    replaceUnderscore,
    capitalize
  }
};
</script>

<style scoped>
dt {
  font-weight: bold;
  min-width: 150px;
}

dt::after {
  content: ":";
}

dl > div {
  display: flex;
}
</style>
