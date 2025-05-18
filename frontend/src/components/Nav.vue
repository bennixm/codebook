<template>
  <nav class="bg-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">

        <div class="flex items-center">
          <span class="text-xl font-bold text-indigo-600">MyBrand</span>
        </div>

        <div class="-mr-2 flex items-center sm:hidden">
          <button @click="toggleMenu" type="button"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-white hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600 transition">
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="!isOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="hidden sm:flex sm:items-center space-x-4">
          <a href="#" class="text-gray-700 hover:text-indigo-600 font-medium">Home</a>
          <a href="#" class="text-gray-700 hover:text-indigo-600 font-medium">About</a>
          <a href="#" class="text-gray-700 hover:text-indigo-600 font-medium">Services</a>
          <a href="#" class="text-gray-700 hover:text-indigo-600 font-medium">Contact</a>
        </div>
      </div>
    </div>

    <div v-if="isOpen" class="sm:hidden px-4 pb-3">
      <a href="#" class="block py-2 text-gray-700 hover:text-indigo-600">Home</a>
      <a href="#" class="block py-2 text-gray-700 hover:text-indigo-600">About</a>
      <a href="#" class="block py-2 text-gray-700 hover:text-indigo-600">Services</a>
      <a href="#" class="block py-2 text-gray-700 hover:text-indigo-600">Contact</a>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
const isOpen = ref(false)
const toggleMenu = () => {
  isOpen.value = !isOpen.value
}
</script>

<style scoped>

</style>
