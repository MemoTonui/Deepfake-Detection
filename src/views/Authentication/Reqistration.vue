<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import logo from '../../assets/aires logo.svg'

const router = useRouter()

const form = ref({
  name: 'Jane Doe',
  phone: '071234567',
  email: 'johndoe@mail.com',
  password: '@#!@#asdf1231!_!@#',
  confirm_password: '@#!@#asdf1231!_!@#',
  dob: '',
  gender: '',
  secondaryEmail: '',
  secondaryPhone: '',
  organization: '',
  role: '',
  specialization: '',
})



function register() {
  router.push('/')  // Navigate to login page
}
</script>

<template>
  <div class="flex items-center justify-center bg-gray-50">
    <div class="w-full max-w-xl px-8 py-6 bg-white rounded-md shadow-md">
      <div class="flex justify-center my-5">
        <img class="h-10 mx-auto mb-5" :src="logo" alt="Logo" />
      </div>
      <h1 class="text-lg font-semibold text-gray-700 m-3">Account Setup</h1><hr/>
     
<div class="m-8">
      <h1 class="text-md font-semibold text-gray-700 my-1">Personal Details</h1>
      <p class="text-xs font-normal text-gray-600 my-1">
        Enter some of your personal details here      </p>

        <div class="text-xs">
        <div class="flex justify-between gap-4">
        <label class=" my-2">
          <span class="text-gray-700">Date of Birth</span>
          <input
            v-model="form.dob"
            type="date"
            class=" text-xs w-full mt-1 border-gray-200 rounded-md focus:border-sky-600 focus:ring focus:ring-opacity-40 focus:ring-sky-500"
            required
          />
        </label>

        <label class=" my-2">
          <span class="text-gray-700">Select Gender</span>
          <select
            v-model="form.gender"
            class="text-xs w-full mt-1 border-gray-200 rounded-md focus:border-sky-600 focus:ring focus:ring-opacity-40 focus:ring-sky-500"
            required
          >
            <option value="" disabled selected>Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </label> 
    </div>     

    <div class="flex justify-between gap-4">

        <label class=" my-2">
          <span class="text-gray-700">Secondary Email</span>
          <input
            v-model="form.secondaryEmail"
            type="email"
            class="text-xs w-full mt-1 border-gray-200 rounded-md focus:border-sky-600 focus:ring focus:ring-opacity-40 focus:ring-sky-500"
          />
        </label>

        <label class=" my-2">
          <span class="text-gray-700">Secondary Phone Number</span>
          <input
            v-model="form.secondaryPhone"
            type="tel"
            class=" text-xs w-full mt-1 border-gray-200 rounded-md focus:border-sky-600 focus:ring focus:ring-opacity-40 focus:ring-sky-500"
            placeholder="07* *** ****"
          />
        </label>
        </div>
    </div>
</div>


    <div class="m-8">
      <h1 class="text-md font-semibold text-gray-700 my-1">Professional Details</h1>
      <p class="text-xs font-normal text-gray-600 my-1">
        We  need some of your details here. </p>

        <div class="text-xs">
        <label class="block my-4">
          <span class="text-gray-700">Select your organization</span>
          <select
            v-model="form.organization"
            class="block text-xs w-full mt-1 border-gray-200 rounded-md focus:border-sky-600 focus:ring focus:ring-opacity-40 focus:ring-sky-500"
            required
          >
            <option value="" disabled selected>Select Organization</option>
            <option value="org1">Organization 1</option>
            <option value="org2">Organization 2</option>
            <option value="org3">Organization 3</option>
          </select>
        </label>

        <label class="block my-4">
          <span class="text-gray-700">What’s your Role in this company</span>
          <input
            v-model="form.role"
            type="text"
            class="block text-xs w-full mt-1 border-gray-200 rounded-md focus:border-sky-600 focus:ring focus:ring-opacity-40 focus:ring-sky-500"
            placeholder="Enter your Role"
            required
          />
        </label>

        <label class="block my-4">
          <span class="text-gray-700">What is your area of specialization?</span>
          <select
            v-model="form.specialization"
            class="block text-xs w-full mt-1 border-gray-200 rounded-md focus:border-sky-600 focus:ring focus:ring-opacity-40 focus:ring-sky-500"
            required
          >
            <option value="" disabled selected>Select Area of Specialization</option>
            <option value="specialization1">Specialization 1</option>
            <option value="specialization2">Specialization 2</option>
            <option value="specialization3">Specialization 3</option>
          </select>
        </label>
        </div>
    </div>
        <div class="m-8">
          <button
            type="submit"
            @click.prevent="register"
            class="w-full px-4 py-2 text-xs text-center text-white bg-sky-900 rounded-full focus:outline-none hover:bg-sky-500"
          >
Setup Account          </button>
        </div>

        
    </div>
  </div>
</template>
