<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { CaseFile } from "@/services/caseFile"; 
import Sidebar from "@/components/Sidebar.vue";

const caseFiles = ref<CaseFile[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// ✅ Add sorting and filtering
const sortBy = ref<'date' | 'caseNumber' | 'verdict'>('date');
const sortOrder = ref<'asc' | 'desc'>('desc');
const filterVerdict = ref<'all' | 'fake' | 'authentic'>('all');

// ✅ Computed filtered and sorted data
const filteredCaseFiles = computed(() => {
  let filtered = [...caseFiles.value];
  
  // Apply filter
  if (filterVerdict.value !== 'all') {
    filtered = filtered.filter(file => 
      filterVerdict.value === 'fake' ? file.isFake : !file.isFake
    );
  }
  
  // Apply sort
  filtered.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy.value) {
      case 'date':
        comparison = new Date(a.uploadDate || 0).getTime() - new Date(b.uploadDate || 0).getTime();
        break;
      case 'caseNumber':
        comparison = (a.caseNumber || '').localeCompare(b.caseNumber || '');
        break;
      case 'verdict':
        comparison = (a.isFake === b.isFake) ? 0 : a.isFake ? 1 : -1;
        break;
    }
    
    return sortOrder.value === 'asc' ? comparison : -comparison;
  });
  
  return filtered;
});

// ✅ Add statistics
const stats = computed(() => ({
  total: caseFiles.value.length,
  fake: caseFiles.value.filter(f => f.isFake).length,
  authentic: caseFiles.value.filter(f => !f.isFake).length,
}));

async function fetchCaseFiles() {
  try {
    loading.value = true;
    error.value = null;

    console.log("📡 Fetching casefiles...");
    const token = localStorage.getItem('token');
    const res = await axios.get("http://localhost:5000/api/casefiles/", {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("📂 Casefiles from API:", res.data);

    caseFiles.value = (res.data.casefiles || []).map(
      (cf: any) => new CaseFile(cf)
    );
    console.log("📋 Casefiles stored in state:", caseFiles.value);
  } catch (err: any) {
    console.error("❌ Error fetching casefiles:", err);
    error.value = err.response?.data?.error || "Failed to load case files";
  } finally {
    loading.value = false;
  }
}

// ✅ Format date helper
function formatDate(date: string | Date | null): string {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'N/A';
  }
}

onMounted(fetchCaseFiles);
</script>

<template>
  <div class="flex h-screen font-poppins *:text-xs">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main content -->
    <main class="flex-1 p-6 overflow-auto bg-gray-50">
      <!-- Header -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Evidence Files</h2>
        <p class="text-gray-600 text-sm mt-1">View and analyze all evidence across cases</p>
      </div>

      <!-- Stats Cards -->
      <div v-if="!loading && !error" class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow p-4">
          <p class="text-gray-500 text-xs">Total Evidence</p>
          <p class="text-2xl font-bold text-gray-800">{{ stats.total }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <p class="text-gray-500 text-xs">Deepfakes Detected</p>
          <p class="text-2xl font-bold text-red-600">{{ stats.fake }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <p class="text-gray-500 text-xs">Authentic Files</p>
          <p class="text-2xl font-bold text-green-600">{{ stats.authentic }}</p>
        </div>
      </div>

      <!-- Filters & Controls -->
      <div v-if="!loading && !error" class="bg-white rounded-lg shadow p-4 mb-4">
        <div class="flex items-center justify-between gap-4">
          <!-- Filter -->
          <div class="flex items-center gap-2">
            <label class="text-gray-700 font-medium">Filter:</label>
            <select 
              v-model="filterVerdict"
              class="px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Evidence</option>
              <option value="fake">Deepfakes Only</option>
              <option value="authentic">Authentic Only</option>
            </select>
          </div>

          <!-- Sort -->
          <div class="flex items-center gap-2">
            <label class="text-gray-700 font-medium">Sort by:</label>
            <select 
              v-model="sortBy"
              class="px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Date Uploaded</option>
              <option value="caseNumber">Case Number</option>
              <option value="verdict">Verdict</option>
            </select>
            
            <button
              @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
              class="p-1.5 border border-gray-300 rounded-md hover:bg-gray-50"
              :title="sortOrder === 'asc' ? 'Ascending' : 'Descending'"
            >
              <svg 
                class="w-4 h-4 transition-transform"
                :class="{ 'rotate-180': sortOrder === 'desc' }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>

          <!-- Results count -->
          <div class="text-gray-600">
            Showing <span class="font-semibold">{{ filteredCaseFiles.length }}</span> of 
            <span class="font-semibold">{{ caseFiles.length }}</span> results
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-500">Loading case files...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-600 font-medium">{{ error }}</p>
      </div>

      <!-- Table -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Case Number
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded By
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Uploaded
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verdict
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr 
                v-for="file in filteredCaseFiles" 
                :key="file.id" 
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ file.caseNumber }}
                  </div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="text-sm text-gray-700">{{ file.uploadedBy }}</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="text-sm text-gray-700">{{ formatDate(file.uploadDate) }}</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {{ file.status }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span 
                    class="px-2 py-1 text-xs font-semibold rounded-full"
                    :class="file.isFake 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'"
                  >
                    {{ file.isFake ? 'Deepfake Detected' : 'Authentic' }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  <router-link
                    :to="`/casefiles/${file.id}`"
                    class="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                  >
                    View Details →
                  </router-link>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-if="filteredCaseFiles.length === 0">
                <td colspan="6" class="px-4 py-12 text-center">
                  <div class="text-gray-400">
                    <svg class="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p class="text-gray-500 font-medium">No case files found</p>
                    <p class="text-gray-400 text-xs mt-1">
                      {{ filterVerdict !== 'all' ? 'Try adjusting your filters' : 'Upload evidence to get started' }}
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>