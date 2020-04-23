<template>
  <v-col class="d-flex" cols="12" :sm="sm" :md="md">
    <v-select
      v-model="mutableValue"
      @change="$emit('update:value', mutableValue)"
      :items="items"
      :label="label"
      color="red"
      item-color="red"
      :disabled="!enabled"
      :autofocus="autofocus"
      outlined
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
  </v-col>
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
    },
    sm: {
      type: Number,
      default: 6
    },
    md: {
      type: Number,
      default: 4
    }
  },
  data() {
    return {
      mutableValue: this.value
    };
  }
};
</script>
