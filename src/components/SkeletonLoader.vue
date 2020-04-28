<template>
  <v-sheet
    :color="`grey ${theme.isDark ? 'darken-2' : 'lighten-4'}`"
    class="px-3 pt-3 pb-3"
  >
    <v-skeleton-loader
      class="mx-auto"
      max-width="500"
      type="card"
    ></v-skeleton-loader>
  </v-sheet>
</template>

<script>
export default { inject: ["theme"] };
</script>

<style scoped>
.v-sheet {
  height: 100%;
}
</style>
