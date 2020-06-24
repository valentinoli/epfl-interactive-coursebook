<template>
  <v-app>
    <v-app-bar app color="white" light>
      <v-btn to="/" exact text class="logo px-1 px-sm-4" :small="isXS">
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

      <div class="nav d-flex">
        <v-btn to="/" exact text :icon="isXS" :small="isXS">
          <v-icon :left="!isXS" :small="isXS">mdi-home</v-icon>
          <span v-if="!isXS">Home</span>
        </v-btn>

        <v-btn to="/about" text :icon="isXS" :small="isXS">
          <v-icon :left="!isXS" :small="isXS">mdi-information-outline</v-icon>
          <span v-if="!isXS">About</span>
        </v-btn>
      </div>
    </v-app-bar>

    <v-content>
      <template v-if="error">
        <v-row class="justify-center">
          <v-col cols="12" md="8" xl="6">
            <v-alert type="warning" class="ma-5">
              {{ error }}
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
          href="https://github.com/valentinoli/epfl-interactive-coursebook"
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
import loadData from "@/services/load-data";

export default {
  name: "App",
  components: {
    SkeletonLoader
  },
  async beforeCreate() {
    try {
      // Load all data to local storage
      // if it hasn't been loaded already
      await loadData();
    } catch (err) {
      if (err instanceof DOMException && err.name === "SecurityError") {
        this.error = `
          Your browser is configured to block cookies and other site data.
          This site relies on your browser's local storage and can't be viewed
          unless you allow it to save and read data.
        `;
      } else if (
        err instanceof DOMException &&
        (err.name === "QuotaExceededError" || err.code === 22)
      ) {
        window.localStorage.clear();
        this.error = `
          Your browser's local storage has exceeded its quota.
          Please try refreshing your browser.
        `;
      } else {
        this.error = `
          Some error occured when loading site data.
          Please try again later or contact the site administrator.
        `;
      }
      console.error(err);
    } finally {
      this.loading = false;
    }
  },
  data: () => ({
    loading: true,
    error: false
  }),
  computed: {
    isXS() {
      return this.$vuetify.breakpoint.xsOnly;
    }
  }
};
</script>

<style>
.theme--light.v-btn--router.v-btn--active::before {
  /* Override default style for active nav router link element */
  opacity: 0 !important;
}

.logo.theme--light.v-btn:hover::before {
  /* Override default opacity */
  opacity: 0;
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
