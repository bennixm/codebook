<script setup>
import NavBar from './components/Nav.vue'
import Footer from './components/Footer.vue'

import { watch } from 'vue';
import { useAuth } from './composables/useAuth';
import socket from './plugins/socket';

const auth = useAuth();


watch(
 () => auth.authReady && auth.user?._id,
  (readyAndId) => {
   
   if (typeof readyAndId === 'string') {
     console.log(`→ emitting join for user ${readyAndId}`);
      socket.emit('join', { userId: readyAndId });
    }
  }
);
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
