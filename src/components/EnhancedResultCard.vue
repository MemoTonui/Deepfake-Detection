<template>
  <div class="p-6 bg-white rounded-lg shadow-md">
    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">
          Case #{{ result.caseNumber || 'UNKNOWN' }}
        </h2>
        <p class="text-sm text-gray-500 mt-1">....
          Uploaded By: {{ result.submittedBy }}
        </p>
        <p class="text-sm text-gray-400">
          Date: {{ new Date(result.processed_at).toLocaleString() }}
        </p>
      </div>
      <span
        class="px-4 py-2 text-lg font-bold rounded-full"
        :class="result.result.is_fake ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'"
      >
        {{ result.result.is_fake ? 'DEEPFAKE' : 'AUTHENTIC' }}
      </span>
    </div>

    <!-- Case Metadata -->
    <div class="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
      <div>
        <p class="text-xs text-gray-500">Case ID</p>
        <p class="font-medium">{{ result.caseNumber }}</p>
      </div>
      <div>
        <p class="text-xs text-gray-500">Case Name</p>
        <p class="font-medium">{{ result.caseName }}</p>
      </div>
      <div>
        <p class="text-xs text-gray-500">Evidence Type</p>
        <p class="font-medium">{{ result.evidence_type }}</p>
      </div>
      <div>
        <p class="text-xs text-gray-500">Confidence</p>
        <p class="font-medium text-lg" :class="getConfidenceColor(result.result.confidence)">
          {{ (result.result.confidence * 100).toFixed(2) }}%
        </p>
        <p class="text-[10px] text-gray-500 mt-1">
          {{ getConfidenceLabel(result.result.confidence) }}
        </p>
      </div>
    </div>

    <!-- Verdict Explanation Card -->
    <div class="mb-6 p-4 rounded-lg border-l-4" :class="result.result.is_fake ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <svg v-if="result.result.is_fake" class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <svg v-else class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="flex-1">
          <h4 class="text-sm font-semibold mb-1" :class="result.result.is_fake ? 'text-red-900' : 'text-green-900'">
            Verdict: {{ result.result.is_fake ? 'DEEPFAKE DETECTED' : 'AUTHENTIC VIDEO' }}
          </h4>
          <p class="text-xs" :class="result.result.is_fake ? 'text-red-700' : 'text-green-700'">
            The system has {{ result.result.confidence > 0.7 ? 'high' : result.result.confidence > 0.5 ? 'moderate' : 'low' }} 
            confidence ({{ (result.result.confidence * 100).toFixed(1) }}%) that this video is 
            {{ result.result.is_fake ? 'manipulated' : 'authentic' }}.
          </p>
        </div>
      </div>
    </div>

    <!-- Description -->
    <div v-if="result.description" class="mb-6">
      <h4 class="text-sm font-semibold text-gray-700 mb-2">Description</h4>
      <p class="text-sm text-gray-600">{{ result.description }}</p>
    </div>

    <!-- Main Visualization -->
    <div class="grid md:grid-cols-2 gap-6 mb-6">
      <div>
        <h4 class="text-sm font-semibold text-gray-700 mb-3">Evidence File</h4>
        <video
          v-if="result.file_url"
          :src="`http://localhost:5000${result.file_url}`"
          controls
          class="w-full rounded-lg shadow"
        ></video>
      </div>
      <div>
        <h4 class="text-sm font-semibold text-gray-700 mb-3">Heatmap Analysis</h4>
        <img
          :src="`http://localhost:5000${result.result.heatmap_url}`"
          alt="Analysis heatmap"
          class="w-full rounded-lg shadow"
        />
      </div>
    </div>

    <!-- Component Breakdown -->
    <div class="mb-6">
      <h4 class="text-lg font-semibold text-gray-900 mb-4">Model Component Analysis</h4>
      <div class="grid grid-cols-3 gap-4">
        <div class="p-4 bg-blue-50 rounded-lg">
          <p class="text-xs text-blue-600 font-medium">Xception Model</p>
          <p class="text-2xl font-bold text-blue-900 mt-1">
            {{ (result.result.components.xception * 100).toFixed(1) }}%
          </p>
          <div class="w-full h-2 mt-2 bg-blue-200 rounded-full">
            <div
              class="h-2 bg-blue-600 rounded-full transition-all"
              :style="{ width: `${result.result.components.xception * 100}%` }"
            ></div>
          </div>
          <p class="text-[10px] text-blue-700 mt-1">
            {{ result.result.components.xception > 0.5 ? 'Detects manipulation' : 'No manipulation' }}
          </p>
        </div>

        <div class="p-4 bg-purple-50 rounded-lg">
          <p class="text-xs text-purple-600 font-medium">ResNet50V2 Model</p>
          <p class="text-2xl font-bold text-purple-900 mt-1">
            {{ (result.result.components.resnet * 100).toFixed(1) }}%
          </p>
          <div class="w-full h-2 mt-2 bg-purple-200 rounded-full">
            <div
              class="h-2 bg-purple-600 rounded-full transition-all"
              :style="{ width: `${result.result.components.resnet * 100}%` }"
            ></div>
          </div>
          <p class="text-[10px] text-purple-700 mt-1">
            {{ result.result.components.resnet > 0.5 ? 'Detects manipulation' : 'No manipulation' }}
          </p>
        </div>

        <div class="p-4 bg-amber-50 rounded-lg">
          <p class="text-xs text-amber-600 font-medium">Anomaly Detection</p>
          <p class="text-2xl font-bold text-amber-900 mt-1">
            {{ (result.result.components.anomaly * 100).toFixed(1) }}%
          </p>
          <div class="w-full h-2 mt-2 bg-amber-200 rounded-full">
            <div
              class="h-2 bg-amber-600 rounded-full transition-all"
              :style="{ width: `${result.result.components.anomaly * 100}%` }"
            ></div>
          </div>
          <p class="text-[10px] text-amber-700 mt-1">
            {{ result.result.components.anomaly > 0.5 ? 'Anomalies found' : 'No anomalies' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Frame-by-Frame Analysis -->
    <div v-if="result.result.frame_analysis" class="mb-6">
      <h4 class="text-lg font-semibold text-gray-900 mb-4">Frame-by-Frame Analysis</h4>
      <div class="grid grid-cols-5 gap-3">
        <div
          v-for="(frame, idx) in result.result.frame_analysis"
          :key="idx"
          class="text-center"
        >
          <img
            v-if="result.result.frame_thumbnails?.[idx]"
            :src="`http://localhost:5000${result.result.frame_thumbnails[idx]}`"
            :alt="`Frame ${frame.frame_number}`"
            class="w-full rounded-md shadow mb-2"
          />
          <p class="text-xs font-medium text-gray-700">Frame {{ frame.frame_number }}</p>
          <p
            class="text-xs font-semibold"
            :class="frame.is_fake ? 'text-red-600' : 'text-green-600'"
          >
            {{ (frame.confidence * 100).toFixed(1) }}%
          </p>
          <p class="text-[10px] text-gray-500">
            {{ frame.is_fake ? 'Fake' : 'Real' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Confidence Statistics -->
    <div v-if="result.result.confidence_stats" class="mb-6">
      <h4 class="text-lg font-semibold text-gray-900 mb-4">Confidence Statistics</h4>
      <div class="grid grid-cols-4 gap-4">
        <div class="p-3 bg-gray-50 rounded-lg text-center">
          <p class="text-xs text-gray-600">Mean</p>
          <p class="text-lg font-bold">{{ (result.result.confidence_stats.mean * 100).toFixed(2) }}%</p>
        </div>
        <div class="p-3 bg-gray-50 rounded-lg text-center">
          <p class="text-xs text-gray-600">Std Dev</p>
          <p class="text-lg font-bold">{{ (result.result.confidence_stats.std * 100).toFixed(2) }}%</p>
        </div>
        <div class="p-3 bg-gray-50 rounded-lg text-center">
          <p class="text-xs text-gray-600">Min</p>
          <p class="text-lg font-bold">{{ (result.result.confidence_stats.min * 100).toFixed(2) }}%</p>
        </div>
        <div class="p-3 bg-gray-50 rounded-lg text-center">
          <p class="text-xs text-gray-600">Max</p>
          <p class="text-lg font-bold">{{ (result.result.confidence_stats.max * 100).toFixed(2) }}%</p>
        </div>
      </div>
    </div>

    <!-- Confusion Matrix -->
    <div v-if="result.result.confusion_matrix" class="mb-6">
      <h4 class="text-lg font-semibold text-gray-900 mb-4">Model Performance Metrics</h4>
      <div class="grid grid-cols-2 gap-4">
        <div class="p-4 bg-green-50 rounded-lg border-2 border-green-200">
          <p class="text-sm text-green-700 font-medium">True Positive Rate</p>
          <p class="text-3xl font-bold text-green-900">
            {{ (result.result.confusion_matrix.true_positive * 100).toFixed(2) }}%
          </p>
          <p class="text-xs text-green-600 mt-1">Correctly identified deepfakes</p>
        </div>
        <div class="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <p class="text-sm text-blue-700 font-medium">True Negative Rate</p>
          <p class="text-3xl font-bold text-blue-900">
            {{ (result.result.confusion_matrix.true_negative * 100).toFixed(2) }}%
          </p>
          <p class="text-xs text-blue-600 mt-1">Correctly identified authentic</p>
        </div>
        <div class="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
          <p class="text-sm text-yellow-700 font-medium">False Positive Rate</p>
          <p class="text-3xl font-bold text-yellow-900">
            {{ (result.result.confusion_matrix.false_positive * 100).toFixed(2) }}%
          </p>
          <p class="text-xs text-yellow-600 mt-1">Authentic marked as fake</p>
        </div>
        <div class="p-4 bg-red-50 rounded-lg border-2 border-red-200">
          <p class="text-sm text-red-700 font-medium">False Negative Rate</p>
          <p class="text-3xl font-bold text-red-900">
            {{ (result.result.confusion_matrix.false_negative * 100).toFixed(2) }}%
          </p>
          <p class="text-xs text-red-600 mt-1">Deepfake marked as authentic</p>
        </div>
      </div>
    </div>

    <!-- System Metadata -->
    <div class="p-4 bg-gray-50 rounded-lg">
      <h4 class="text-sm font-semibold text-gray-700 mb-3">System Information</h4>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div>
          <p class="text-gray-500">Detection Method</p>
          <p class="font-medium">{{ result.result.metadata.detection_method }}</p>
        </div>
        <div>
          <p class="text-gray-500">Model Accuracy</p>
          <p class="font-medium">{{ result.result.metadata.model_accuracy }}</p>
        </div>
        <div>
          <p class="text-gray-500">AUC Score</p>
          <p class="font-medium">{{ result.result.metadata.auc_score }}</p>
        </div>
        <div>
          <p class="text-gray-500">Frames Analyzed</p>
          <p class="font-medium">{{ result.result.metadata.frames_processed }}</p>
        </div>
      </div>
    </div>
    <!-- Anomaly Detection Chart -->
    <div v-if="result.result.anomaly_chart_url" class="mb-6">
    <h4 class="text-lg font-semibold text-gray-900 mb-4">Anomaly Detection Analysis</h4>
    <img
        :src="`http://localhost:5000${result.result.anomaly_chart_url}`"
        alt="Anomaly detection chart"
        class="w-full rounded-lg shadow border"
    />
    </div>

    <!-- Explanation -->
    <div class="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
      <h4 class="text-sm font-semibold text-blue-900 mb-2">Expert Analysis</h4>
      <p class="text-sm text-blue-800">{{ result.result.explanation }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DetectionResult } from '@/services/detection'

defineProps<{
  result: DetectionResult
}>()

const getConfidenceColor = (confidence: number) => {
  if (confidence > 0.7) return 'text-red-600'
  if (confidence > 0.5) return 'text-orange-600'
  if (confidence > 0.3) return 'text-yellow-600'
  return 'text-green-600'
}

const getConfidenceLabel = (confidence: number) => {
  if (confidence > 0.7) return 'High confidence - Likely fake'
  if (confidence > 0.5) return 'Moderate confidence - Possibly fake'
  if (confidence > 0.3) return 'Low confidence - Uncertain'
  return 'Very low confidence - Likely authentic'
}
</script>