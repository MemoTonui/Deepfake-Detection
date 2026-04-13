<!-- src/views/Cases.vue -->
<template>
  <div class="flex h-screen font-poppins *:text-xs">
    <Sidebar />
    
    <main class="flex-1 p-6 overflow-auto bg-gray-50">
      <!-- Header -->
      <div class="mb-6 flex justify-between items-center">
        <div>
          <h2 class="text-3xl font-bold">Cases</h2>
          <p class="text-gray-600 text-sm mt-2">Manage all forensic cases</p>
        </div>
        <button
          @click="showCreateModal = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          + Create New Case
        </button>
      </div>
      <hr/>

      <!-- Loading / Error -->
      <div v-if="loading" class="text-gray-500 my-5">Loading cases...</div>
      <div v-else-if="error" class="text-red-600 my-5">{{ error }}</div>

      <!-- Cases Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-5">
        <div
          v-for="caseItem in cases"
          :key="caseItem.id"
          @click="viewCase(caseItem.id)"
          class="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="font-bold text-lg">{{ caseItem.case_name }}</h3>
              <p class="text-gray-600 text-sm">{{ caseItem.case_number }}</p>
            </div>
            <span
              class="px-3 py-1 rounded-full text-xs"
              :class="caseItem.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'"
            >
              {{ caseItem.status }}
            </span>
          </div>
          
          <p class="text-gray-700 text-sm mb-4 line-clamp-2">
            {{ caseItem.description || 'No description' }}
          </p>
          
          <div class="flex justify-between text-xs text-gray-500">
            <span>{{ caseItem.evidence_count || 0 }} evidence files</span>
            <span>{{ formatDate(caseItem.created_at) }}</span>
          </div>
        </div>

        <div v-if="cases.length === 0" class="col-span-full text-center text-gray-500 py-12">
          No cases found. Create your first case to get started.
        </div>
      </div>

      <!-- Create Case Modal -->
      <div
        v-if="showCreateModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="showCreateModal = false"
      >
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 class="text-xl font-semibold mb-4">Create New Case</h3>
          
          <form @submit.prevent="createCase" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Case Number *</label>
              <input
                v-model="newCase.case_number"
                type="text"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., CASE-2025-001"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Case Name *</label>
              <input
                v-model="newCase.case_name"
                type="text"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Brief title for the case"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                v-model="newCase.description"
                rows="3"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Case details..."
              ></textarea>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="showCreateModal = false"
                class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="creating"
                class="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {{ creating ? 'Creating...' : 'Create Case' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Sidebar from '@/components/Sidebar.vue';

const router = useRouter();

const cases = ref<any[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const showCreateModal = ref(false);
const creating = ref(false);

const newCase = ref({
  case_number: '',
  case_name: '',
  description: ''
});

async function fetchCases() {
  try {
    loading.value = true;
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:5000/api/cases/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    cases.value = res.data.cases || [];
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to load cases';
  } finally {
    loading.value = false;
  }
}

async function createCase() {
  try {
    creating.value = true;
    const token = localStorage.getItem('token');
    const res = await axios.post(
      'http://localhost:5000/api/cases/',
      newCase.value,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    showCreateModal.value = false;
    newCase.value = { case_number: '', case_name: '', description: '' };
    
    // Navigate to the new case
    router.push(`/cases/${res.data.case_id}`);
  } catch (err: any) {
    alert(err.response?.data?.error || 'Failed to create case');
  } finally {
    creating.value = false;
  }
}

function viewCase(caseId: string) {
  router.push(`/cases/${caseId}`);
}

function formatDate(timestamp: any) {
  if (!timestamp) return 'N/A';
  try {
    return new Date(timestamp).toLocaleDateString();
  } catch {
    return 'N/A';
  }
}

onMounted(fetchCases);
</script>