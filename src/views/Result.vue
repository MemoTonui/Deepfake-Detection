<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

interface Result {
  id: string;
  caseNumber: string;
  caseName: string;
  uploadedBy: string;
  uploadDate: string;
  fileType: 'image' | 'video';
  fileUrl: string;
  result: 'real' | 'fake';
  confidence: number;
  details: string;
  heatmapUrl: string;
}

const route = useRoute();
const result = ref<Result | null>(null);
const isLoading = ref(true);

// Fetch result data based on the ID from the route
onMounted(async () => {
  const resultId = route.params.id;
  try {
    // Simulate an API call to fetch result data
    const response = await fetch(`/api/results/${resultId}`);
    const data = await response.json();
    result.value = data;
  } catch (error) {
    console.error('Failed to fetch result:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <div v-if="isLoading" class="flex justify-center items-center h-screen">
      <p class="text-gray-700">Loading results...</p>
    </div>

    <div v-else-if="result" class="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Case Results</h1>

      <!-- Case Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 class="text-xl font-semibold text-gray-700 mb-2">Case Details</h2>
          <div class="space-y-2">
            <p><span class="font-medium">Case Number:</span> {{ result.caseNumber }}</p>
            <p><span class="font-medium">Case Name:</span> {{ result.caseName }}</p>
            <p><span class="font-medium">Uploaded By:</span> {{ result.uploadedBy }}</p>
            <p><span class="font-medium">Upload Date:</span> {{ result.uploadDate }}</p>
          </div>
        </div>

        <!-- Detection Result -->
        <div>
          <h2 class="text-xl font-semibold text-gray-700 mb-2">Detection Result</h2>
          <div class="space-y-2">
            <p>
              <span class="font-medium">Result:</span>
              <span
                :class="{
                  'text-green-600': result.result === 'real',
                  'text-red-600': result.result === 'fake',
                }"
              >
                {{ result.result === 'real' ? 'Real' : 'Fake' }}
              </span>
            </p>
            <p><span class="font-medium">Confidence:</span> {{ (result.confidence * 100).toFixed(2) }}%</p>
            <p><span class="font-medium">Details:</span> {{ result.details }}</p>
          </div>
        </div>
      </div>

      <!-- Uploaded File -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold text-gray-700 mb-4">Uploaded File</h2>
        <div v-if="result.fileType === 'image'" class="flex justify-center">
          <img :src="result.fileUrl" alt="Uploaded Image" class="max-w-full h-auto rounded-lg shadow-md" />
        </div>
        <div v-else-if="result.fileType === 'video'" class="flex justify-center">
          <video controls class="max-w-full h-auto rounded-lg shadow-md">
            <source :src="result.fileUrl" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      <!-- Heatmap -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold text-gray-700 mb-4">Heatmap</h2>
        <div class="flex justify-center">
          <img :src="result.heatmapUrl" alt="Heatmap" class="max-w-full h-auto rounded-lg shadow-md" />
        </div>
      </div>

      <!-- Back Button -->
      <div class="flex justify-end">
        <router-link
          to="/"
          class="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors"
        >
          Back to Cases
        </router-link>
      </div>
    </div>

    <div v-else class="text-center text-gray-700">
      <p>No result found for this case.</p>
    </div>
  </div>
</template>