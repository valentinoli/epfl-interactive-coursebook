<template>
  <v-app>
    <v-app-bar app color="white" light>
      <v-btn to="/" exact text>
        <v-img
          alt="EPFL Logo"
          class="shrink mr-2"
          contain
          src="https://web2018.epfl.ch/4.2.0/icons/epfl-logo.svg"
          transition="scale-transition"
          width="40"
        />

        <span>Interactive Coursebook</span>
      </v-btn>

      <v-spacer></v-spacer>

      <div class="nav d-none d-sm-none d-md-flex">
        <v-btn to="/" exact text> <v-icon left>mdi-home</v-icon> Home </v-btn>

        <v-btn to="/story" text>
          <v-icon left>mdi-book-open-page-variant</v-icon> Story
        </v-btn>

        <v-btn to="/about" text>
          <v-icon left>mdi-information-variant</v-icon> About
        </v-btn>
      </div>
    </v-app-bar>

    <v-content>
      <template v-if="error">
        <v-row>
          <v-col>
            <v-alert type="error">
              Data loading failed
            </v-alert>
          </v-col>
        </v-row>
      </template>
      <template v-else-if="loading">
        <SkeletonLoader />
      </template>
      <template v-else>
        <keep-alive>
          <router-view />
        </keep-alive>
      </template>
    </v-content>

    <v-footer
      app
      elevation="2"
      color="white"
      class="d-flex justify-center align-center font-weight-light"
    >
      <div>
        <v-icon left>mdi-copyright</v-icon>
        <span>
          2020 -&nbsp;
        </span>
        <span>
          <a
            href="mailto:valentin.loftsson@epfl.ch,michal.pleskowicz@epfl.ch,michael.spierer@epfl.ch"
            target="_blank"
            class="contact-link"
          >
            Contact</a
          ></span
        >
        <v-btn
          href="https://github.com/com-480-data-visualization/com-480-project-vizcachas"
          target="_blank"
          text
          icon
          title="View on GitHub"
        >
          <v-icon>mdi-github</v-icon>
        </v-btn>
      </div>
    </v-footer>
  </v-app>
</template>

<script>
import SkeletonLoader from "@/components/SkeletonLoader";
import api from "@/services/api";

export default {
  name: "App",
  components: {
    SkeletonLoader
  },
  async beforeCreate() {
    console.log("before create");
    try {
      // Load all data to local storage
      // if it hasn't been loaded already
      await api.loadAllData();
    } catch (err) {
      console.error(err);
      this.error = err;
    } finally {
      this.loading = false;
    }
  },
  data: () => ({
    loading: true,
    error: false
  })
};
</script>

<style>
.theme--light.v-btn--router.v-btn--active::before {
  /* Override default style for active nav router link element */
  opacity: 0 !important;
}

.nav .v-btn:not(:last-child) {
  margin-right: 5px;
}

.nav .theme--light.v-btn--router.v-btn--active {
  background-color: rgba(255, 0, 0, 0.7);
  color: white;
}

.contact-link {
  color: black !important;
  text-decoration: none;
}

.contact-link:hover {
  text-decoration: underline;
}
</style>
