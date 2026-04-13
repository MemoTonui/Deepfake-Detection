<template >
  <RouterView />
</template>

<script setup lang="ts" >
import { RouterView } from 'vue-router'
import { useAuth } from '@/services/auth'

// Initialize auth state
const { user } = useAuth()
</script>

<style>
/* Global styles can go here */
body {
  @apply bg-gray-50;
}
</style>