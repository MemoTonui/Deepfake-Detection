<template>
    <div class="p-6 bg-white rounded-lg shadow-md">
      <h2 class="text-2xl font-semibold mb-4">Generate Report</h2>
      <button
        @click="generateReport"
        class="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
      >
        Download PDF Report
      </button>
    </div>
  </template>
  
  <script setup lang="ts">
  const generateReport = () => {
    alert('PDF report generated and downloaded.');
  };
  </script>