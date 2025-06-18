<script setup>
import NavBar from './components/Nav.vue'
import Footer from './components/Footer.vue'
import { useNotifications } from './composables/useNotifications'
useNotifications()
</script>

<template>
  <div>
    <NavBar />
    
    <main class="flex-grow p-4">
        <router-view></router-view>
    </main>
    <Footer />
  </div>
</template>

<style scoped>

</style>
