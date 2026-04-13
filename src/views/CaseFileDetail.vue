<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import Sidebar from '@/components/Sidebar.vue';
import type { DetectionResult } from '@/services/detection';

const route = useRoute();
const caseFile = ref<any>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// Computed property to check if we have enhanced data
const hasEnhancedData = computed(() => {
  return caseFile.value?.result?.frame_analysis && 
         caseFile.value?.result?.components &&
         caseFile.value?.result?.confusion_matrix;
});

async function fetchCaseFile() {
  try {
    loading.value = true;
    error.value = null;
    console.log('📡 Fetching casefile', route.params.id);

    const res = await axios.get(
      `http://localhost:5000/api/casefiles/${route.params.id}`
    );

    console.log('📂 Casefile details:', res.data);

    // ✅ safe defaults
    caseFile.value = {
      id: res.data.id,
      caseNumber: res.data.caseNumber || 'N/A',
      caseName: res.data.caseName || 'Unknown',
      caseDescription: res.data.description || 'Unknown',
      uploadedBy: res.data.submittedBy || res.data.uploader_id,
      type: res.data.evidence_type || res.data.type || 'video',
      uploadDate: res.data.processed_at || res.data.uploadDate
        ? new Date(res.data.processed_at || res.data.uploadDate).toUTCString()
        : 'N/A',
      isFake: res.data.result?.is_fake ?? res.data.isFake ?? false,
      status: res.data.status || 'complete',

      // ✅ map Firestore names to what your template expects
      fileUrl: res.data.file_url || res.data.fileUrl || null,
      resultsLink: res.data.heatmap_url || res.data.resultsLink || null,
      confidence: res.data.result?.confidence ?? null,
      description: res.data.description || '',
      
      // ✅ Enhanced detection results
      result: res.data.result || {},

      logs: res.data.logs || [],
      digitalEvidence: res.data.digitalEvidence || [],
    };
  } catch (err: any) {
    console.error('❌ Error fetching casefile:', err);
    error.value = err.response?.data?.error || 'Failed to load case file';
  } finally {
    loading.value = false;
  }
}

async function exportReport() {
  if (!caseFile.value) return;

  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(
      `http://localhost:5000/api/casefiles/${route.params.id}/report`,
      { 
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    // Download PDF
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Case_${caseFile.value.caseNumber}_Report.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err: any) {
    console.error('❌ Failed to export report:', err);
    alert('Failed to generate report. Please try again.');
  }
}

onMounted(fetchCaseFile);
</script>

<template>
  <div class="flex h-screen font-poppins">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <main class="flex-1 p-6 m-8 overflow-auto bg-gray-50">
      <div class="mx-auto">
        <!-- Page Header -->
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h2 class="text-3xl font-semibold text-gray-800">
              Case File Details
            </h2>
            <p class="text-gray-500 text-sm">Detailed evidence and analysis</p>
          </div>

          <!-- Export Button -->
          <button
            @click="exportReport"
            class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow"
          >
            Export Report (PDF)
          </button>
        </div>

        <hr />
        <div class="">
          <div class="my-5">
            <!-- Loading / Error States -->
            <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-500">Loading case files...</p>
        </div>
      </div>
            <div v-else-if="error" class="text-red-600 font-medium">
              {{ error }}
            </div>

            <!-- Casefile Data -->
            <div v-else-if="caseFile" class="space-y-6">
              <!-- Case Info Card -->
              <div class="bg-white shadow-md rounded-xl p-6 border">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-xl font-semibold text-gray-800">
                    Case #{{ caseFile.caseNumber }}
                  </h3>
                  <span
                    class="px-4 py-2 text-sm rounded-full font-bold"
                    :class="
                      caseFile.isFake
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    "
                  >
                    {{ caseFile.isFake ? 'DEEPFAKE' : 'AUTHENTIC' }}
                  </span>
                </div>

                <hr />
                <div class="gap-3 text-sm text-gray-700">

                  <!-- Explanation -->
                <div v-if="caseFile.result.explanation" class="p-4 bg-blue-50 my-5 rounded-lg border-l-4 border-blue-500">
                  <h4 class="text-sm font-semibold text-blue-900 mb-2">
                    Expert Analysis
                  </h4>
                  <p class="text-sm text-blue-800">{{ caseFile.result.explanation }}</p>
                </div>

                  <p class="py-3">
                    <span class="font-medium text-gray-600">Uploaded By:</span>
                    {{ caseFile.uploadedBy }}
                  </p>
                  <p class="py-3">
                    <span class="font-medium text-gray-600">Date Uploaded:</span>
                    {{ caseFile.uploadDate }}
                  </p>
                  <p class="py-3">
                    <span class="font-medium text-gray-600">Confidence:</span>
                    <span class="ml-2 font-bold text-lg">
                      {{
                        caseFile.confidence !== null
                          ? (caseFile.confidence * 100).toFixed(2) + '%'
                          : 'N/A'
                      }}
                    </span>
                  </p>
                </div>

                <h3 class="text-lg font-semibold text-gray-800 my-4">
                  Case Metadata
                </h3>
                <hr />
                <div class="grid grid-cols-2 mt-4 gap-4 text-sm text-gray-700">
                  <p>
                    <span class="font-medium text-gray-600">Case ID:</span>
                    {{ caseFile.caseNumber }}
                  </p>
                  <p>
                    <span class="font-medium text-gray-600">Case Name:</span>
                    {{ caseFile.caseName }}
                  </p>
                  <p>
                    <span class="font-medium text-gray-600">Evidence Type:</span>
                    {{ caseFile.type }}
                  </p>
                  <p>
                    <span class="font-medium text-gray-600">Processed At:</span>
                    {{ caseFile.uploadDate }}
                  </p>
                  <p class="col-span-2">
                    <span class="font-medium text-gray-600">Description:</span>
                    {{ caseFile.caseDescription || 'No description provided' }}
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-12 gap-5">
                <!-- Evidence Card -->
                <div
                  v-if="caseFile.fileUrl"
                  class="bg-white shadow-md rounded-xl p-6 border col-span-7"
                >
                  <h3 class="text-lg font-semibold text-gray-800 mb-4">
                    Evidence File
                  </h3>

                  <video
                    v-if="caseFile.type === 'video'"
                    controls
                    class="w-full max-h-[480px] rounded-lg shadow-md object-contain"
                  >
                    <source
                      :src="`http://localhost:5000${caseFile.fileUrl}`"
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>

                  <img
                    v-else-if="caseFile.type === 'image'"
                    :src="`http://localhost:5000${caseFile.fileUrl}`"
                    class="w-full max-h-[480px] rounded-lg shadow-md object-contain"
                  />

                  <a
                    v-else
                    :href="`http://localhost:5000${caseFile.fileUrl}`"
                    target="_blank"
                    class="text-blue-600 hover:underline"
                  >
                    Download File
                  </a>
                </div>

                <!-- Heatmap Card -->
                <div
                  v-if="caseFile.resultsLink || caseFile.result?.heatmap_url"
                  class="bg-white shadow-md rounded-xl p-6 border col-span-5"
                >
                  <h3 class="text-lg font-semibold text-gray-800 mb-4">
                    Heatmap Analysis
                  </h3>
                  <img
                    :src="`http://localhost:5000${caseFile.result?.heatmap_url || caseFile.resultsLink}`"
                    alt="Heatmap"
                    class="w-full max-h-[480px] rounded-lg shadow-md object-contain"
                  />
                </div>
              </div>

              <!-- Enhanced Analysis Section -->
              <div v-if="hasEnhancedData" class="space-y-6">
                <!-- Component Breakdown -->
                <div class="bg-white shadow-md rounded-xl p-6 border">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">
                    Model Component Analysis
                  </h3>
                  <div class="grid grid-cols-3 gap-4">
                    <div class="p-4 bg-blue-50 rounded-lg">
                      <p class="text-xs text-blue-600 font-medium">Xception Model</p>
                      <p class="text-2xl font-bold text-blue-900 mt-1">
                        {{ (caseFile.result.components.xception * 100).toFixed(1) }}%
                      </p>
                      <div class="w-full h-2 mt-2 bg-blue-200 rounded-full">
                        <div
                          class="h-2 bg-blue-600 rounded-full transition-all"
                          :style="{ width: `${caseFile.result.components.xception * 100}%` }"
                        ></div>
                      </div>
                    </div>

                    <div class="p-4 bg-purple-50 rounded-lg">
                      <p class="text-xs text-purple-600 font-medium">ResNet50V2 Model</p>
                      <p class="text-2xl font-bold text-purple-900 mt-1">
                        {{ (caseFile.result.components.resnet * 100).toFixed(1) }}%
                      </p>
                      <div class="w-full h-2 mt-2 bg-purple-200 rounded-full">
                        <div
                          class="h-2 bg-purple-600 rounded-full transition-all"
                          :style="{ width: `${caseFile.result.components.resnet * 100}%` }"
                        ></div>
                      </div>
                    </div>

                    <div class="p-4 bg-amber-50 rounded-lg">
                      <p class="text-xs text-amber-600 font-medium">Anomaly Detection</p>
                      <p class="text-2xl font-bold text-amber-900 mt-1">
                        {{ (caseFile.result.components.anomaly * 100).toFixed(1) }}%
                      </p>
                      <div class="w-full h-2 mt-2 bg-amber-200 rounded-full">
                        <div
                          class="h-2 bg-amber-600 rounded-full transition-all"
                          :style="{ width: `${caseFile.result.components.anomaly * 100}%` }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Frame-by-Frame Analysis -->
                <div v-if="caseFile.result.frame_analysis" class="bg-white shadow-md rounded-xl p-6 border">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">
                    Frame-by-Frame Analysis
                  </h3>
                  <div class="grid grid-cols-5 gap-3">
                    <div
                      v-for="(frame, idx) in caseFile.result.frame_analysis"
                      :key="idx"
                      class="text-center"
                    >
                      <img
                        v-if="caseFile.result.frame_thumbnails?.[idx]"
                        :src="`http://localhost:5000${caseFile.result.frame_thumbnails[idx]}`"
                        :alt="`Frame ${frame.frame_number}`"
                        class="w-full rounded-md shadow mb-2"
                      />
                      <p class="text-xs font-medium text-gray-700">
                        Frame {{ frame.frame_number }}
                      </p>
                      <p
                        class="text-xs font-semibold"
                        :class="frame.is_fake ? 'text-red-600' : 'text-green-600'"
                      >
                        {{ (frame.confidence * 100).toFixed(1) }}%
                      </p>
                      <div class="mt-1 space-y-0.5 text-[10px] text-gray-500">
                        <p>X: {{ (frame.xception_score * 100).toFixed(0) }}%</p>
                        <p>R: {{ (frame.resnet_score * 100).toFixed(0) }}%</p>
                        <p>A: {{ (frame.anomaly_score * 100).toFixed(0) }}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Confidence Statistics -->
                <div v-if="caseFile.result.confidence_stats" class="bg-white shadow-md rounded-xl p-6 border">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">
                    Confidence Statistics
                  </h3>
                  <div class="grid grid-cols-4 gap-4">
                    <div class="p-3 bg-gray-50 rounded-lg text-center">
                      <p class="text-xs text-gray-600">Mean</p>
                      <p class="text-lg font-bold">
                        {{ (caseFile.result.confidence_stats.mean * 100).toFixed(2) }}%
                      </p>
                    </div>
                    <div class="p-3 bg-gray-50 rounded-lg text-center">
                      <p class="text-xs text-gray-600">Std Dev</p>
                      <p class="text-lg font-bold">
                        {{ (caseFile.result.confidence_stats.std * 100).toFixed(2) }}%
                      </p>
                    </div>
                    <div class="p-3 bg-gray-50 rounded-lg text-center">
                      <p class="text-xs text-gray-600">Min</p>
                      <p class="text-lg font-bold">
                        {{ (caseFile.result.confidence_stats.min * 100).toFixed(2) }}%
                      </p>
                    </div>
                    <div class="p-3 bg-gray-50 rounded-lg text-center">
                      <p class="text-xs text-gray-600">Max</p>
                      <p class="text-lg font-bold">
                        {{ (caseFile.result.confidence_stats.max * 100).toFixed(2) }}%
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Confusion Matrix -->
                <div v-if="caseFile.result.confusion_matrix" class="bg-white shadow-md rounded-xl p-6 border">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">
                    Model Performance Metrics
                  </h3>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                      <p class="text-sm text-green-700 font-medium">True Positive Rate</p>
                      <p class="text-3xl font-bold text-green-900">
                        {{ (caseFile.result.confusion_matrix.true_positive * 100).toFixed(2) }}%
                      </p>
                      <p class="text-xs text-green-600 mt-1">
                        Correctly identified deepfakes
                      </p>
                    </div>
                    <div class="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <p class="text-sm text-blue-700 font-medium">True Negative Rate</p>
                      <p class="text-3xl font-bold text-blue-900">
                        {{ (caseFile.result.confusion_matrix.true_negative * 100).toFixed(2) }}%
                      </p>
                      <p class="text-xs text-blue-600 mt-1">
                        Correctly identified authentic
                      </p>
                    </div>
                    <div class="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                      <p class="text-sm text-yellow-700 font-medium">False Positive Rate</p>
                      <p class="text-3xl font-bold text-yellow-900">
                        {{ (caseFile.result.confusion_matrix.false_positive * 100).toFixed(2) }}%
                      </p>
                      <p class="text-xs text-yellow-600 mt-1">
                        Authentic marked as fake
                      </p>
                    </div>
                    <div class="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                      <p class="text-sm text-red-700 font-medium">False Negative Rate</p>
                      <p class="text-3xl font-bold text-red-900">
                        {{ (caseFile.result.confusion_matrix.false_negative * 100).toFixed(2) }}%
                      </p>
                      <p class="text-xs text-red-600 mt-1">
                        Deepfake marked as authentic
                      </p>
                    </div>
                  </div>
                </div>

                <!-- System Metadata -->
                <div class="bg-white shadow-md rounded-xl p-6 border">
                  <h3 class="text-sm font-semibold text-gray-700 mb-3">
                    System Information
                  </h3>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p class="text-gray-500">Detection Method</p>
                      <p class="font-medium">{{ caseFile.result.metadata?.detection_method || 'N/A' }}</p>
                    </div>
                    <div>
                      <p class="text-gray-500">Model Accuracy</p>
                      <p class="font-medium">{{ caseFile.result.metadata?.model_accuracy || 'N/A' }}</p>
                    </div>
                    <div>
                      <p class="text-gray-500">AUC Score</p>
                      <p class="font-medium">{{ caseFile.result.metadata?.auc_score || 'N/A' }}</p>
                    </div>
                    <div>
                      <p class="text-gray-500">Frames Analyzed</p>
                      <p class="font-medium">{{ caseFile.result.metadata?.frames_processed || 'N/A' }}</p>
                    </div>
                  </div>
                </div>

                
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Logs Card -->
      <div
        v-if="caseFile?.logs?.length"
        class="bg-white shadow-md rounded-xl p-6 border mt-6"
      >
        <h3 class="text-lg font-semibold text-gray-800 mb-4">
          Access & Update Logs
        </h3>

        <table class="w-full text-sm text-left border-collapse">
          <thead class="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th class="py-2 px-3">User</th>
              <th class="py-2 px-3">Action</th>
              <th class="py-2 px-3">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(log, idx) in caseFile.logs" :key="idx" class="border-t">
              <td class="py-2 px-3">{{ log.user || log.actor_id }}</td>
              <td class="py-2 px-3 capitalize">{{ log.action || log.details }}</td>
              <td class="py-2 px-3 text-gray-500">
                {{ new Date(log.timestamp).toLocaleString() }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>