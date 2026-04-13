<!-- src/components/DashboardLayout.vue -->
<template>
  <div class="flex h-screen font-poppins bg-slate-100 *:text-xs">
    <Sidebar />

    <main class="flex-1 p-6">
      <!-- Header -->
      <div class="mb-6 border-b pb-4">
        <h1 class="text-2xl font-bold text-gray-800">
          Deepfake Detection Dashboard
        </h1>
        <p class="text-gray-600">Welcome back, {{ user?.email }}</p>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="p-6 bg-white rounded-lg shadow-md">
          <h2 class="text-gray-600 text-sm">Total Cases</h2>
          <p class="text-2xl font-bold">{{ stats.totalCases }}</p>
        </div>
        <div class="p-6 bg-white rounded-lg shadow-md">
          <h2 class="text-gray-600 text-sm">Evidence Files</h2>
          <p class="text-2xl font-bold">{{ stats.evidenceFiles }}</p>
        </div>
        <div class="p-6 bg-white rounded-lg shadow-md">
          <h2 class="text-gray-600 text-sm">Fake Evidence</h2>
          <p class="text-2xl font-bold text-red-600">{{ stats.fakeEvidence }}</p>
        </div>
        <div class="p-6 bg-white rounded-lg shadow-md">
          <h2 class="text-gray-600 text-sm">Avg Processing Time</h2>
          <p class="text-2xl font-bold">{{ stats.avgProcessingTime }}s</p>
        </div>
      </div>

      <!-- Recent Cases -->
      <div class="p-6 bg-white rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">Recent Evidence</h2>
          <router-link to="/cases" class="text-blue-600 hover:underline text-sm">
            View All Cases →
          </router-link>
        </div>
        
        <ul class="divide-y divide-gray-200">
          <li v-for="item in recentCases" :key="item.evidence_id" class="py-3">
            <div class="flex justify-between items-center">
              <div>
                <p class="font-medium text-gray-800">{{ item.caseName || 'Untitled' }}</p>
                <p class="text-xs text-gray-500">
                  {{ item.caseNumber }} — Uploaded by {{ item.submittedBy }}
                </p>
              </div>
              <span
                :class="item.isFake ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'"
                class="px-2 py-1 rounded text-xs"
              >
                {{ item.isFake ? 'Fake' : 'Authentic' }}
              </span>
            </div>
          </li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '@/services/auth'
import { fetchStats, fetchRecentCases } from '@/services/dashboard'
import Sidebar from '@/components/Sidebar.vue'

const { user } = useAuth()

const stats = ref({
  totalCases: 0,
  evidenceFiles: 0,
  fakeEvidence: 0,
  avgProcessingTime: 0,
})

const recentCases = ref<any[]>([])

onMounted(async () => {
  try {
    stats.value = await fetchStats()
    recentCases.value = await fetchRecentCases()
  } catch (error) {
    console.error("Dashboard fetch error:", error)
  }
})
</script>