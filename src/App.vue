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

      <div class="d-none d-sm-none d-md-flex">
        <v-btn to="/" exact text>
          <span class="mr-2">Home</span>
        </v-btn>

        <v-btn to="/story" text>
          <span class="mr-2">Story</span>
        </v-btn>

        <v-btn to="/about" text>
          <span class="mr-2">About</span>
        </v-btn>

        <v-btn
          href="https://github.com/com-480-data-visualization/com-480-project-vizcachas"
          target="_blank"
          text
        >
          <span class="mr-2">View on GitHub</span>
          <img src="./assets/GitHub-Mark-32px.png" alt="Github Logo" />
        </v-btn>
      </div>
    </v-app-bar>

    <v-content>
      <transition name="fade">
        <keep-alive>
          <router-view />
        </keep-alive>
      </transition>
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
            Contact
          </a>
        </span>
      </div>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: "App",

  data: () => ({
    //
  })
};
</script>

<style>
.theme--light.v-btn--active::before {
  /* Override default style for active nav router link element */
  opacity: 0 !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.contact-link {
  color: black !important;
  text-decoration: none;
}

.contact-link:hover {
  text-decoration: underline;
}
</style>
