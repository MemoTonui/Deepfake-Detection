<template>
  <div class="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div class="flex items-start justify-between">
      <div>
        <h3 class="font-medium text-gray-900">
          Case: {{ result.caseName }} ({{ result.caseNumber }})
        </h3>
        <p class="text-sm text-gray-500">Evidence: {{ result.file_name }}</p>
        <p class="text-xs text-gray-400">Submitted by: {{ result.uploadedBy }}</p>
      </div>
      <span
        class="px-2 py-1 text-xs font-semibold rounded-full"
        :class="result.result.is_fake ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'"
      >
        {{ result.result.is_fake ? 'Fake' : 'Authentic' }}
      </span>
    </div>

    <div class="mt-4">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-700">Confidence</span>
        <span class="text-sm font-semibold">
          {{ Math.round(result.result.confidence * 100) }}%
        </span>
      </div>
      <div class="w-full h-2 mt-1 bg-gray-200 rounded-full">
        <div
          class="h-2 rounded-full"
          :class="result.result.is_fake ? 'bg-red-500' : 'bg-green-500'"
          :style="{ width: `${result.result.confidence * 100}%` }"
        ></div>
      </div>
    </div>

    <div class="mt-4">
      <h4 class="text-sm font-medium text-gray-700">Description</h4>
      <p class="mt-1 text-sm text-gray-600">{{ result.description }}</p>
      <p v-if="result.metadata.warning" class="mt-1 text-xs text-amber-600">
        ⚠️ {{ result.metadata.warning }}
      </p>
    </div>

    <div class="mt-4">
      <img
        :src="result.result.heatmap_url || result.heatmap_url"
        alt="Manipulation heatmap"
        class="w-full rounded-md"
      />
    </div>

    <div class="flex justify-end mt-4">
      <button
        @click="$emit('view-details')"
        class="px-3 py-1 text-sm text-sky-600 hover:text-sky-700 hover:underline"
      >
        View Details →
      </button>
    </div>
  </div>
</template>
rfver
<script setup lang="ts">
import type { DetectionResult } from '@/services/detection'

defineProps<{
  result: DetectionResult
}>()

defineEmits(['view-details'])
</script>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AnnotationsEditor from '@/components/AnnotationsEditor.vue'

const route = useRoute()
const loading = ref(false)
const result = ref<any>(null)
const videoUrl = ref('')

const generateReport = () => {
  // Implement report generation
  alert('Report generation would be triggered here')
}

onMounted(async () => {
  if (route.params.evidenceId) {
    loading.value = true
    try {
      // Fetch analysis results from API
      // const response = await fetchAnalysisResults(route.params.evidenceId)
      // result.value = response
      // videoUrl.value = getVideoUrlForEvidence(route.params.evidenceId)
    } catch (error) {
      console.error('Failed to load analysis results:', error)
    } finally {
      loading.value = false
    }
  }
})
</script>