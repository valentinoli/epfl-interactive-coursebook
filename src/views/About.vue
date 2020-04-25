<template>
  <v-container fluid class="about">
    <v-row align="center" justify="center">
      <v-col cols="12" md="9">
        <h1>What is this all about?</h1>
        <p>
          If you are a student at EPFL, you know that sometimes it can be hard
          to pick suitable courses for the upcoming semester. If you are a
          teacher at EPFL, you might be familiar with the challenge of
          understanding what other teachers are teaching your students and how
          it relates to the content in your course or which courses teach
          similar or related concepts. You might have browsed through the
          different study plans and course books and opened multiple tabs on
          your web browser in order to make sense of the highly interconnected
          system of knowledge that is being presented in a fragmented way.
        </p>
        <p>
          This is why we decided to create the EPFL Interactive Coursebook. The
          aim is to visualize the courses currently taught at EPFL and the
          relationships between them. Since we want to visualize relationships,
          the data is represented on a network graph. The courses themselves are
          represented by the nodes of the graph and dependencies between courses
          as edges. The purpose is not only to provide an impressive
          visualization, but also a rich interactive tool with options for
          searching and filtering. This can come in handy in many instances, for
          example when students want to see only the courses of their own
          program.
        </p>
      </v-col>
    </v-row>
    <v-row align="center" justify="center">
      <Avatar
        v-for="{ src, name, email } in $options.people"
        :key="src"
        :src="src"
        :name="name"
        :email="email"
      />
    </v-row>
  </v-container>
</template>

<script>
import Avatar from "@/components/Avatar";

export default {
  name: "About",
  components: {
    Avatar
  },
  people: [
    {
      src: require("@/assets/valentin.png"),
      name: "Valentin Oliver Loftsson",
      email: "valentin.loftsson@epfl.ch"
    },
    {
      src: require("@/assets/michal.jpeg"),
      name: "Michal Pleskowicz",
      email: "michal.pleskowicz@epfl.ch"
    },
    {
      src: require("@/assets/Michael.jpg"),
      name: "Michaël Spierer",
      email: "michael.spierer@epfl.ch"
    }
  ]
};
</script>

<style scoped>
p {
  text-align: justify;
}
</style>
