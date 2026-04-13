<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import logo from '../../assets/aires logo.svg'

const router = useRouter()
const password = ref('@#!@#asdf1231!_!@#')
const confirm_password = ref('@#!@#asdf1231!_!@#')


function new_pass() {
  router.push('/success')
}
</script>

<template>
  <div class="flex items-center justify-center h-screen bg-gray-50">
    <div class="w-full max-w-md  px-8 py-6 bg-white rounded-md shadow-md">
      <div class="">
        <div class="flex justify-center my-5 ">
            <img class="h-10 mx-auto mb-5" :src="logo" alt="Logo" />
        </div>
       <div class="mt-6">
        <span class="text-md font-semibold text-gray-700 my-1">Set new password</span>
        <p class="text-xs font-normal text-gray-600 my-1">Set a new password here!</p>

      </div>
      </div>

      <form class="text-xs mt-6" @submit.prevent="new_pass">
        <label class="block my-2">
          <span class=" text-gray-700">Password</span>
          <input
            v-model="password"
            type="password"
            class="block text-xs w-full mt-1 border-gray-200 rounded-md focus:border-sky-600 focus:ring focus:ring-opacity-40 focus:ring-sky-500"
          >
        </label>
        <label class="block my-4">
          <span class=" text-gray-700">Confirm Password</span>
          <input
            v-model="confirm_password"
            type="password"
            class="block text-xs w-full mt-1 border-gray-200 rounded-md focus:border-sky-600 focus:ring focus:ring-opacity-40 focus:ring-sky-500"
          >
        </label>

     


        <div class="mt-6">
          <button
            type="submit"
            class="w-full px-4 py-2 text-sm text-center text-white bg-sky-900 rounded-full focus:outline-none hover:bg-sky-500"
          >Reset Password</button>
        </div>
        <div class="my-5 text-xs flex justify-center">
            <a
              class="block text-gray-700 "
              href="#"
            ><span class="text-sky-600 fontme hover:underline">Back to Login</span></a>
          </div>
      </form>
    </div>
  </div>
</template>
