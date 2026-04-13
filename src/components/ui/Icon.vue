<!-- src/components/ui/Icon.vue -->
<script setup lang="ts">
import * as icons from '@/utils/icons'
import { computed } from 'vue';

const props = defineProps({
  name: {
    type: String,
    required: true,
    validator: (value: string) => value in icons
  },
  size: {
    type: String,
    default: '5'
  },
  class: {
    type: String,
    default: ''
  }
})

const iconComponent = computed(() => icons[props.name as keyof typeof icons])
</script>

<template>
  <component 
    :is="iconComponent" 
    :class="`w-${size} h-${size} ${class}`"
  />
</template>