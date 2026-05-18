<script lang="ts" setup>
import { ref, watch } from 'vue';
import logo from '../../assets/aires logo.svg';
import router from '../../router';

// Define the number of OTP input fields
const fields = 4;

// Define the email prop
const props = defineProps<{
  email: string;
}>();

// Reactive data array to store OTP input values
const data = ref<string[]>(Array(fields).fill(''));

// Reference for the input elements
const firstInputEl = ref<HTMLInputElement[]>([]);

// Define the emit function to update model value
const emit = defineEmits(['update:modelValue']);

function login() {
  router.push('/'); // Navigate to login page
}

function createNewPassword() {
  router.push('/new_password'); // Navigate to login page
}

// Watcher to monitor changes to the data array and emit the value
watch(
  data,
  (newVal) => {
    if (newVal.every(value => value !== '') && newVal.length === fields) {
      emit('update:modelValue', Number(newVal.join('')));
    } else {
      emit('update:modelValue', null);
    }
  },
  { deep: true }
);

// Function to handle navigation between OTP input fields
const handleOtpInput = (e: Event) => {
  const target = e.target as HTMLInputElement

  if (target.value && target.nextElementSibling) {
    (target.nextElementSibling as HTMLInputElement).focus()
  } else if ((e as InputEvent).inputType === 'deleteContentBackward' && target.previousElementSibling) {
    (target.previousElementSibling as HTMLInputElement).focus()
  }
}

// Function to handle pasting of OTP values into input fields
const handlePaste = (e: ClipboardEvent) => {
  const pasteData = e.clipboardData?.getData('text') || '';
  const maxLength = fields;
  const values = pasteData.slice(0, maxLength).split('');
  
  // Populate the OTP fields with the pasted data
  values.forEach((value, index) => {
    data.value[index] = value;
    if (firstInputEl.value[index + 1]) {
      firstInputEl.value[index + 1].focus();
    }
  });
};
</script>

<template>
  <div class="flex items-center justify-center h-screen bg-gray-50">
    <div class="w-full max-w-md px-8 py-6 bg-white rounded-md shadow-md">
      
      <!-- Centered logo and text at the top -->
      <div class="text-center mt-5">
        <img class="h-10 mx-auto mb-5" :src="logo" alt="Logo" />
        <div class="mt-6">
          <span class="block text-md font-semibold text-gray-700">Check your email!</span>
          <p class="mt-1 text-xs font-normal text-gray-600">We have sent a one-time password to {{ props.email }}</p>
        </div>
      </div>

      <!-- OTP fields -->
      <div class="otp w-full flex justify-between mt-8">
        <template v-for="fieldIndex in fields" :key="fieldIndex">
          <input
            v-model="data[fieldIndex - 1]"
            :ref="el => firstInputEl[fieldIndex - 1] = el as HTMLInputElement"
            type="text"
            maxlength="1"
            class="border border-slate-200 rounded-xs w-10 h-10 text-center"
            @input="handleOtpInput"
            @paste="fieldIndex === 1 && handlePaste"
          />
        </template>
      </div>

      <!-- Verify button -->
      <div class="mt-8">
        <button
        @click="createNewPassword"
          type="submit"
          class="w-full px-4 py-2 text-sm text-center text-white bg-sky-900 rounded-full focus:outline-none hover:bg-sky-500"
        >
          Verify
        </button>
      </div>

      <!-- Resend and Back to Login links -->
      <div class="my-5 text-xs flex justify-center">
        <a class="block text-gray-700" href="#">
          Didn’t receive email? <span class="text-sky-600 fontme hover:underline">Click to resend</span>
        </a>
      </div>
      <div class="my-5 text-xs flex justify-center">
        <a
          class="block text-gray-700"
          href="#"
          @click.prevent="login"
        >
          <span class="text-sky-600 fontme hover:underline">Back to Login</span>
        </a>
      </div>
      
    </div>
  </div>
</template>
