<script setup>
import NavBar from './components/Nav.vue'
import Footer from './components/Footer.vue'
</script>

<template>
    <NavBar />
    
    <main class="flex-grow p-4">
        <router-view></router-view>
    </main>
    <Footer />
</template>

<style scoped>

</style>
