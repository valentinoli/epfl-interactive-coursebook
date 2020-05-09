<template>
  <v-select
    v-model="mutableValue"
    @change="$emit('update:value', mutableValue)"
    :items="items"
    :label="label"
    color="red"
    item-color="red"
    :disabled="!enabled"
    :autofocus="autofocus"
    light
    outlined
    dense
    clearable
  >
    <template v-slot:item="data">
      <!-- Custom HTML that describe how select should render items when the select is open -->
      <slot name="item-data" v-bind="data">
        <!-- Default if no slot content is provided -->
        {{ data.item.text || data.item }}
      </slot>
    </template>
    <template v-slot:selection="data">
      <!-- Custom HTML that describe how select should render selected items -->
      <slot name="selection-data" v-bind="data">
        <!-- Default if no slot content is provided -->
        {{ data.item.text || data.item }}
      </slot>
    </template>
  </v-select>
</template>

<script>
export default {
  props: {
    autofocus: {
      type: Boolean,
      default: false
    },
    enabled: {
      type: Boolean,
      default: true
    },
    value: {
      type: String,
      default: ""
    },
    items: {
      type: Array,
      default: () => []
    },
    label: {
      type: String,
      default: "Select an option"
    }
  },
  data() {
    return {
      // We need to create a data property for the v-model
      // since mutating a prop locally is considered an anti-pattern in Vue 2
      // https://stackoverflow.com/questions/39868963/vue-2-mutating-props-vue-warn
      // props down, events and data up
      mutableValue: this.value
    };
  }
};
</script>

<style scoped>
.v-select__selections {
  /* Override Vuetify property to display*/
  flex-wrap: nowrap;
}
</style>
