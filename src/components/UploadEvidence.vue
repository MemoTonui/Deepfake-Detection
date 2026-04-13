<!-- src/components/UploadEvidence.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios';
import { useAuth } from '@/services/auth'
import { 
  CloudArrowUpIcon as CloudUploadIcon, 
  VideoCameraIcon as VideoIcon, 
  XMarkIcon as XIcon 
} from '@heroicons/vue/24/outline'

// Props
const props = defineProps<{
  caseId?: string  // Optional: if provided, use this case; otherwise show dropdown
}>()

const emit = defineEmits<{
  (e: 'upload-success', result: any): void
}>()

const { user } = useAuth()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const selectedFile = ref<File | null>(null)
const selectedCaseId = ref(props.caseId || '')
const cases = ref<any[]>([])
const caseName = ref('')
const description = ref('')
const submittedBy = ref('')
const uploading = ref(false)
const uploadProgress = ref(0)
const errorMessage = ref('')

async function fetchCases() {
  if (props.caseId) return; // Don't fetch if caseId is provided
  
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:5000/api/cases/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    cases.value = res.data.cases;
  } catch (err) {
    console.error('Failed to fetch cases:', err);
  }
}

const triggerFileInput = () => fileInput.value?.click()

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files?.length) handleFileSelection(files[0])
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files?.length) handleFileSelection(input.files[0])
}

const handleFileSelection = (file: File) => {
  const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska']
  const maxSize = 500 * 1024 * 1024
  
  if (!validTypes.includes(file.type)) {
    errorMessage.value = 'Invalid file type. Please upload MP4, MOV, AVI, or MKV files only.'
    return
  }
  
  if (file.size > maxSize) {
    errorMessage.value = 'File exceeds 500MB limit. Please choose a smaller file.'
    return
  }
  
  errorMessage.value = ''
  selectedFile.value = file
}

const removeFile = () => {
  selectedFile.value = null
  if (!props.caseId) selectedCaseId.value = ''
  caseName.value = ''
  description.value = ''
  errorMessage.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

const cancelUpload = () => {
  removeFile()
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const startAnalysis = async () => {
  const caseIdToUse = props.caseId || selectedCaseId.value;
  
  if (!caseIdToUse) {
    errorMessage.value = 'Please select a case';
    return;
  }
  
  if (!selectedFile.value) {
    errorMessage.value = 'Please select a file';
    return;
  }

  uploading.value = true;
  uploadProgress.value = 0;
  errorMessage.value = '';

  const formData = new FormData();
  formData.append('video', selectedFile.value);
  formData.append('case_id', caseIdToUse);
  formData.append('caseName', caseName.value);
  formData.append('description', description.value);

  try {
    const token = localStorage.getItem('token');
    const res = await axios.post(
      'http://localhost:5000/api/detect',
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            uploadProgress.value = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
          }
        }
      }
    );

    emit('upload-success', res.data);
    removeFile();
  } catch (err: any) {
    console.error('❌ Upload failed:', err);
    errorMessage.value = err.response?.data?.error || 'Upload failed';
  } finally {
    uploading.value = false;
  }
}

onMounted(() => {
  if (user.value) {
    submittedBy.value = user.value.email || user.value.uid
  }
  fetchCases();
})
</script>

<template>
  <div>
    <!-- Upload Dropzone -->
    <div
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="handleDrop"
      :class="{
        'border-sky-500 bg-sky-50': isDragging,
        'border-gray-300': !isDragging,
      }"
      class="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md cursor-pointer"
    >
      <input
        ref="fileInput"
        type="file"
        accept="video/*"
        class="hidden"
        @change="handleFileChange"
      />
      <CloudUploadIcon class="w-12 h-12 text-sky-500" />
      <p class="mt-2 text-sm text-gray-600">
        Drag and drop your video file here, or
        <span class="font-medium text-sky-600" @click="triggerFileInput">click to browse</span>
      </p>
      <p class="mt-1 text-xs text-gray-500">Supports MP4, MOV, AVI (Max 500MB)</p>
    </div>

    <!-- Case Selection (only if not provided as prop) -->
    <div v-if="!caseId && cases.length > 0" class="mt-4">
      <label class="block text-sm font-medium text-gray-700">Select Case *</label>
      <select
        v-model="selectedCaseId"
        class="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
      >
        <option value="">-- Select a case --</option>
        <option v-for="caseItem in cases" :key="caseItem.id" :value="caseItem.id">
          {{ caseItem.case_number }} - {{ caseItem.case_name }}
        </option>
      </select>
    </div>

    <!-- Selected File + Form -->
    <div v-if="selectedFile" class="mt-4 space-y-4">
      <!-- File summary -->
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
        <div class="flex items-center">
          <VideoIcon class="w-5 h-5 text-gray-400" />
          <span class="ml-2 text-sm font-medium">{{ selectedFile.name }}</span>
          <span class="ml-2 text-xs text-gray-500">{{ formatFileSize(selectedFile.size) }}</span>
        </div>
        <button @click="removeFile" class="text-gray-400 hover:text-gray-500">
          <XIcon class="w-5 h-5" />
        </button>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Case Name</label>
        <input
          v-model="caseName"
          type="text"
          placeholder="Brief title"
          class="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          v-model="description"
          rows="3"
          placeholder="Add context for this evidence"
          class="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
        ></textarea>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-3">
        <button
          @click="cancelUpload"
          :disabled="uploading"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          @click="startAnalysis"
          :disabled="uploading"
          class="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 disabled:opacity-50"
        >
          <span v-if="!uploading">Analyze Video</span>
          <span v-else class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ uploadProgress }}%
          </span>
        </button>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="errorMessage" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
      <p class="text-sm text-red-600">{{ errorMessage }}</p>
    </div>
  </div>
</template>