<template>
    <div class="p-6 bg-white rounded-lg shadow-md">
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
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  
  const annotation = ref('');
  
  const saveAnnotation = () => {
    alert('Annotation saved: ' + annotation.value);
  };
  </script>