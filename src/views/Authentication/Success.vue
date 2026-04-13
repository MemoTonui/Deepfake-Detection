<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import logo from '../../assets/aires logo.svg';

const router = useRouter();
const email = ref('johndoe@mail.com');

function complete() {
  router.push('/');
}
</script>

<template>
  <div class="flex items-center justify-center h-screen  bg-gray-50">
    <div class="w-full max-w-md px-8 py-10 bg-white rounded-md shadow-md flex flex-col items-center">
      
      <!-- Logo -->
      <div class="w-20 mb-5">
        <img class="h-10 mx-auto mb-5" :src="logo" alt="Logo" />
      </div>
      
      <!-- Text content -->
      <div class="text-center">
        <span class="block text-md font-semibold text-gray-700">Password Reset!</span>
        <p class="mt-4 text-xs font-normal text-gray-600">Your password has been successfully reset!</p>
        <p class="mt-2 text-xs font-normal text-gray-600">Click the button below to proceed.</p>
      </div>
      
      <!-- Proceed button -->
      <div class="mt-6 w-full">
        <button
          type="submit"
          @click.prevent="complete"
          class="w-full px-4 py-2 text-sm text-center text-white bg-sky-900 rounded-full focus:outline-none hover:bg-sky-500"
        >Proceed</button>
      </div>
      
    </div>
  </div>
</template>
