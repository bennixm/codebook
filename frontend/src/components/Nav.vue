<template>
  <nav class="navbar">
  <div class="navbar-container">
  <div class="navbar-start">
    <div class="logo"></div>
    <div class="hidden lg:flex space-x-4 ml-6">
            <router-link to="/" class="nav-link transition duration-150 ease-in-out">Home</router-link>
            <router-link to="/" class="nav-link transition duration-150 ease-in-out">Blogs</router-link>
            <router-link to="/" class="nav-link transition duration-150 ease-in-out">Support</router-link>
    </div>
  </div>
  <div class="navbar-end hidden lg:flex space-x-2">
            <router-link to="/authentification" class="nav-link transition duration-150 ease-in-out flex items-center space-x-4"><User class="w-5 h-5 text-gray-600" /> Login</router-link>
            <router-link to="/" class="nav-link inset-ring-2 inset-ring-green-500 rounded-xl transition duration-150 ease-in-out flex items-center space-x-4">Join us</router-link>
  </div>
  <div class="lg:hidden flex items-center justify-center">
    <button class="btn btn-ghost" @click="isOpen = !isOpen">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 stroke-black" fill="none"
           viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round"
              :d="isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'" />
      </svg>
    </button>
  </div>
  </div>
</nav>
<div v-if="isOpen" class="lg:hidden px-4 py-2 space-y-2">
            <router-link to="/" class="text-gray-700 hover:text-blue-600">Home</router-link>
            <router-link to="/" class="text-gray-700 hover:text-blue-600">Blogs</router-link>
            <router-link to="/" class="text-gray-700 hover:text-blue-600">Support</router-link>
  <button class="btn btn-outline w-full">Login</button>
  <button class="btn btn-primary w-full">Register</button>
</div>
</template>

<script setup>
import { Home, User, Menu } from 'lucide-vue-next'
import { ref } from 'vue'
const isOpen = ref(false)
const toggleMenu = () => {
  isOpen.value = !isOpen.value
}
</script>

<style scoped>
/* Add custom styles here if needed */
</style>
