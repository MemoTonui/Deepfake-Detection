<template>
    <div class="min-h-screen bg-slate-100 p-6">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <h1 class="text-3xl font-semibold text-gray-800 mb-6">Upload Here</h1>
  
        <!-- Tabs for Step-by-Step Workflow -->
        <div class="mb-6">
          <div class="flex space-x-4 border-b border-gray-300">
            <button
              v-for="(tab, index) in tabs"
              :key="index"
              @click="activeTab = index"
              :class="{
                'border-sky-500 text-sky-600': activeTab === index,
                'border-transparent text-gray-500 hover:text-gray-700': activeTab !== index,
              }"
              class="py-2 px-4 text-sm font-medium border-b-2 focus:outline-none"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>
  
        <!-- Step 1: Upload Evidence -->
        <div v-if="activeTab === 0" class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-semibold mb-4">Upload Evidence</h2>
          <div
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop="handleFileDrop"
            :class="{
              'border-2 border-dashed border-sky-500 bg-sky-50': isDragging,
              'border-2 border-dashed border-gray-300': !isDragging,
            }"
            class="p-8 text-center rounded-lg cursor-pointer"
          >
            <input
              type="file"
              ref="fileInput"
              @change="handleFileUpload"
              class="hidden"
              accept="video/*,audio/*,image/*"
            />
            <p class="text-gray-600">
              Drag and drop files here or
              <span class="text-sky-600 underline" @click="triggerFileInput">click to upload</span>.
            </p>
            <p v-if="uploadedFile" class="mt-4 text-sm text-gray-500">
              Uploaded: {{ uploadedFile.name }}
            </p>
            <div v-if="uploadProgress > 0" class="mt-4">
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-sky-600 h-2 rounded-full"
                  :style="{ width: uploadProgress + '%' }"
                ></div>
              </div>
              <p class="text-sm text-gray-600 mt-2">{{ uploadProgress }}% uploaded</p>
            </div>
          </div>
          <button
            @click="nextTab"
            class="mt-6 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            Next
          </button>
        </div>
  
        <!-- Step 2: Analysis -->
        <div v-if="activeTab === 1" class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-semibold mb-4">Analysis Results</h2>
          <div v-if="analysisResults">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="text-xl font-semibold mb-2">Flagged Inconsistencies</h3>
                <ul class="list-disc list-inside">
                  <li v-for="(issue, index) in analysisResults.issues" :key="index">
                    {{ issue }}
                  </li>
                </ul>
              </div>
              <div>
                <h3 class="text-xl font-semibold mb-2">Heatmap</h3>
                <img :src="analysisResults.heatmapUrl" alt="Heatmap" class="rounded-lg shadow-md" />
              </div>
            </div>
          </div>
          <div v-else class="text-gray-600">No analysis results yet.</div>
          <button
            @click="nextTab"
            class="mt-6 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            Next
          </button>
        </div>
  
        <!-- Step 3: Review & Annotations -->
        <div v-if="activeTab === 2" class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-semibold mb-4">Review & Annotations</h2>
          <textarea
            v-model="annotation"
            placeholder="Add your notes here..."
            class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            rows="4"
          ></textarea>
          <button
            @click="saveAnnotation"
            class="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            Save Annotation
          </button>
          <button
            @click="nextTab"
            class="mt-6 ml-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            Next
          </button>
        </div>
  
        <!-- Step 4: Generate Report -->
        <div v-if="activeTab === 3" class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-semibold mb-4">Generate Report</h2>
          <button
            @click="generateReport"
            class="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            Download PDF Report
          </button>
          <button
            @click="nextTab"
            class="mt-6 ml-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            Next
          </button>
        </div>
  
        <!-- Step 5: Courtroom Presentation -->
        <div v-if="activeTab === 4" class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-semibold mb-4">Courtroom Presentation</h2>
          <div class="flex justify-center">
            <video controls class="rounded-lg shadow-md">
              <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <button
            @click="startDemo"
            class="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            Start Demo Mode
          </button>
          <button
            @click="saveAndFinish"
            class="mt-6 ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Save & Finish
          </button>
        </div>
  
        <!-- Results Table -->
        <div v-if="activeTab === 5" class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-semibold mb-4">Saved Results</h2>
          <table class="min-w-full leading-normal">
            <thead>
              <tr>
                <th class="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
                  Case Number
                </th>
                <th class="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
                  Case Name
                </th>
                <th class="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
                  Status
                </th>
                <th class="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(result, index) in savedResults" :key="index">
                <td class="px-5 py-5 text-sm bg-white border-b border-gray-200">
                  {{ result.caseNumber }}
                </td>
                <td class="px-5 py-5 text-sm bg-white border-b border-gray-200">
                  {{ result.caseName }}
                </td>
                <td class="px-5 py-5 text-sm bg-white border-b border-gray-200">
                  <span
                    class="relative inline-block px-3 py-1 font-semibold leading-tight"
                    :class="{
                      'text-green-900': result.status === 'complete',
                      'text-yellow-900': result.status === 'processing',
                      'text-gray-900': result.status === 'pending',
                    }"
                  >
                    <span
                      aria-hidden
                      class="absolute inset-0 opacity-50 rounded-full"
                      :class="{
                        'bg-green-200': result.status === 'complete',
                        'bg-yellow-200': result.status === 'processing',
                        'bg-gray-200': result.status === 'pending',
                      }"
                    ></span>
                    <span class="relative">{{ result.status }}</span>
                  </span>
                </td>
                <td class="px-5 py-5 text-sm bg-white border-b border-gray-200">
                  <button
                    @click="viewDetails(result)"
                    class="text-sky-600 hover:text-sky-900"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  
  interface Result {
    caseNumber: string;
    caseName: string;
    status: 'pending' | 'processing' | 'complete';
  }
  
  const tabs = [
    { label: 'Upload Evidence' },
    { label: 'Analysis' },
    { label: 'Review' },
    { label: 'Generate Report' },
    { label: 'Presentation' },
    { label: 'Results' },
  ];
  
  const activeTab = ref(0);
  const isDragging = ref(false);
  const uploadedFile = ref<File | null>(null);
  const uploadProgress = ref(0);
  const analysisResults = ref({
    issues: ['Lip-sync mismatch at 00:12', 'Background noise anomaly at 00:45'],
    heatmapUrl: 'https://via.placeholder.com/400x200.png?text=Heatmap',
  });
  const annotation = ref('');
  const savedResults = ref<Result[]>([]);
  
  const triggerFileInput = () => {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput.click();
  };
  
  const handleFileDrop = (event: DragEvent) => {
    event.preventDefault();
    isDragging.value = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      uploadedFile.value = files[0];
      simulateUpload();
    }
  };
  
  const handleFileUpload = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      uploadedFile.value = input.files[0];
      simulateUpload();
    }
  };
  
  const simulateUpload = () => {
    uploadProgress.value = 0;
    const interval = setInterval(() => {
      if (uploadProgress.value < 100) {
        uploadProgress.value += 10;
      } else {
        clearInterval(interval);
      }
    }, 200);
  };
  
  const saveAnnotation = () => {
    alert('Annotation saved: ' + annotation.value);
  };
  
  const generateReport = () => {
    alert('PDF report generated and downloaded.');
  };
  
  const startDemo = () => {
    alert('Demo mode started.');
  };
  
  const saveAndFinish = () => {
    savedResults.value.push({
      caseNumber: 'CASE-001',
      caseName: uploadedFile.value?.name || 'Untitled Case',
      status: 'complete',
    });
    activeTab.value = 5; // Navigate to Results tab
  };
  
  const viewDetails = (result: Result) => {
    alert(`Viewing details for case: ${result.caseNumber}`);
  };
  
  const nextTab = () => {
    if (activeTab.value < tabs.length - 1) {
      activeTab.value++;
    }
  };
  </script>