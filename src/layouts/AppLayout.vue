<template>
  <div class="flex h-screen font-poppins bg-slate-50 overflow-hidden">
    <Sidebar />
    <div class="flex flex-col flex-1 overflow-hidden">
      <TopBar />
      <main class="flex-1 overflow-y-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import TopBar from '@/components/TopBar.vue'
</script>