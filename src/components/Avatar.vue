<template>
  <v-col cols="12" sm="4" align="center">
    <v-avatar color="grey" size="120">
      <v-img :src="src" :alt="name"></v-img>
    </v-avatar>

    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>{{ name }}</v-list-item-title>
        <v-list-item-subtitle>{{ email }}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-col>
</template>

<script>
export default {
  name: "Avatar",
  props: ["src", "name", "email"]
};
</script>
