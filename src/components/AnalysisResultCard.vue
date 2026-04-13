<template>
    <div class="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div class="flex items-start justify-between">
        <div>
          <h3 class="font-medium text-gray-900">Case: {{ result.caseName}}</h3>
          <p class="text-sm text-gray-500">Evidence ID: {{ result.evidence_id }}</p>
        </div>
        <span
          class="px-2 py-1 text-xs font-semibold rounded-full"
          :class="result.is_fake ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'"
        >
          {{ result.is_fake ? 'Fake' : 'Authentic' }}
        </span>
      </div>j vkv ndjlkjy
  
      <div class="mt-4">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">Confidence</span>
          <span class="text-sm font-semibold">
            {{ Math.round(result.confidence * 100) }}%
          </span>
        </div>
        <div class="w-full h-2 mt-1 bg-gray-200 rounded-full">
          <div
            class="h-2 rounded-full"
            :class="result.is_fake ? 'bg-red-500' : 'bg-green-500'"
            :style="{ width: `${result.confidence * 100}%` }"
          ></div>
        </div>
      </div>
  
      <div class="mt-4">
        <h4 class="text-sm font-medium text-gray-700">Explanation</h4>
        <p class="mt-1 text-sm text-gray-600">{{ result.explanation }}</p>
      </div>
  
      <div class="mt-4">
        <img
          :src="result.heatmap_url"
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
  
  <script setup lang="ts">
  defineProps({
    result: {
      type: Object as () => ({
        confidence: number
        caseName: string
        evidence_id: string
        explanation: string
        heatmap_url: string
        is_fake: boolean
        metadata: {
          frames_processed: number
          warning?: string
        }
      }),
      required: true
    }
  })
  
  defineEmits(['view-details'])
  </script>