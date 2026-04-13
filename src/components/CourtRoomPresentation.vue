<template>
    <div class="p-6 bg-white rounded-lg shadow-md">
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
    </div>
  </template>
  
  <script setup lang="ts">
  const startDemo = () => {
    alert('Demo mode started.');
  };
  </script>