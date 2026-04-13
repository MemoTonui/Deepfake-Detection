<template>
  <div class="flex h-screen font-poppins *:text-xs">
    <Sidebar />
    
    <main class="flex-1 p-6 overflow-auto bg-gray-50">
<div v-if="loading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-500">Loading case files...</p>
        </div>
      </div>      <div v-else-if="error" class="text-red-600">{{ error }}</div>
      
      <div v-else>
        <!-- Case Header -->
        <div class="mb-6">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-2xl font-bold">{{ caseData.case_name }}</h2>
              <p class="text-gray-600">{{ caseData.case_number }}</p>
            </div>
            <span
              class="px-3 py-1 rounded-full text-sm"
              :class="caseData.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'"
            >
              {{ caseData.status }}
            </span>
          </div>
          <p class="text-gray-600 mt-2">{{ caseData.description }}</p>
        </div>
        
        <!-- Case Info -->
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="p-4 bg-white rounded-lg shadow">
            <p class="text-gray-500 text-xs">Created By</p>
            <p class="font-semibold">{{ caseData.created_by_email }}</p>
          </div>
          <div class="p-4 bg-white rounded-lg shadow">
            <p class="text-gray-500 text-xs">Created At</p>
            <p class="font-semibold">{{ formatDate(caseData.created_at) }}</p>
          </div>
          <div class="p-4 bg-white rounded-lg shadow">
            <p class="text-gray-500 text-xs">Evidence Count</p>
            <p class="font-semibold">{{ caseData.evidence?.length || 0 }}</p>
          </div>
        </div>
        
       
        
        <!-- Evidence List -->
        <div class="my-6">
            <div class="flex justify-between">
                <div>
                    <h3 class="text-lg font-semibold mb-3">Evidence Files</h3>
                </div>
                 <!-- Upload Evidence Button -->
                <div class="mb-6">
                <button
                    @click="showUploadModal = true"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    + Upload Evidence
                </button>
                </div>
            </div>
          <div class="bg-white rounded-lg shadow overflow-hidden">
            <table class="min-w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">File Name</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Uploaded By</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Verdict</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr v-for="evidence in caseData.evidence" :key="evidence.id" class="hover:bg-gray-50">
                  <td class="px-4 py-3">{{ evidence.file_name }}</td>
                  <td class="px-4 py-3">{{ evidence.uploaded_by_email }}</td>
                  <td class="px-4 py-3">{{ formatDate(evidence.uploaded_at) }}</td>
                  <td class="px-4 py-3">
                    <span
                      class="px-2 py-1 rounded-full text-xs"
                      :class="evidence.is_fake ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'"
                    >
                      {{ evidence.is_fake ? 'Deepfake' : 'Authentic' }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <button
                      @click="viewEvidence(evidence.id)"
                      class="text-blue-600 hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Audit Logs -->
        <div>
          <h3 class="text-lg font-semibold mb-3">Activity Log</h3>
          <div class="bg-white rounded-lg shadow p-4">
            <div v-for="log in caseData.audit_logs" :key="log.created_at" class="py-2 border-b last:border-0">
              <div class="flex justify-between items-start">
                <div>
                  <span class="font-medium">{{ log.user_email }} </span>
                  <span>  </span>
                  <span class="text-gray-600"> {{ getActionText(log.action) }}</span>
                </div>
                <span class="text-gray-500 text-xs">{{ formatDate(log.timestamp) }}</span>
              </div>
              <div v-if="log.details" class="text-gray-600 text-xs mt-1">
                {{log.details }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Upload Modal -->
        <div
          v-if="showUploadModal"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          @click.self="showUploadModal = false"
        >
          <div class="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 class="text-xl font-semibold mb-4">Upload Evidence</h3>
            <UploadEvidence
              :caseId="caseId"
              @upload-success="handleUploadSuccess"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import Sidebar from '@/components/Sidebar.vue';
import UploadEvidence from '@/components/UploadEvidence.vue';

const route = useRoute();
const router = useRouter();
const caseId = route.params.id as string;

const caseData = ref<any>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const showUploadModal = ref(false);

async function fetchCase() {
  try {
    loading.value = true;
    const token = localStorage.getItem('token');
    const res = await axios.get(`http://localhost:5000/api/cases/${caseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    caseData.value = res.data;
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to load case';
  } finally {
    loading.value = false;
  }
}

function handleUploadSuccess() {
  showUploadModal.value = false;
  fetchCase(); // Refresh case data
}

function viewEvidence(evidenceId: string) {
  router.push(`/casefiles/${evidenceId}`);
}

function getActionText(action: string) {
  const actions: Record<string, string> = {
    'VIEW_CASE': 'viewed this case',
    'CREATE_CASE': 'created this case',
    'UPLOAD_EVIDENCE': 'uploaded evidence',
    'ANALYZE_EVIDENCE': 'analyzed evidence',
    'EXPORT_REPORT': 'exported a report',
    'UPDATE_CASE': 'updated case information'
  };
  return actions[action] || action;
}

function formatDate(timestamp: any) {
  if (!timestamp) return 'N/A';
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return 'N/A';
  }
}

onMounted(fetchCase);
</script>