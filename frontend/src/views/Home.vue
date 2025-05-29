
<template>
  <div ref="vantaRef" class="w-full landing-section">
    <div class="container space-x-4">
    <span class="text-7xl text-black mr-4">CodeBook</span>
    <span class="text-3xl text-black max-w-2xl">Empowering Developers to Share, Learn, and Grow.</span>
    </div></div>
    <div class="container flex justify-evenly home-s">
            <pre ref="codeBlock" class="bg-gray-900 text-green-400 p-4 rounded-lg shadow-lg w-full max-w-2xl mx-auto overflow-x-auto">
              <code>
              const publishPost = async () => {
                await writeCode();
                await hitPublish();
                console.log("Shared with the world!");
              };
              </code>
            </pre>
            <div class="flex flex-col justify-center">
              <span class="text-2xl text-black max-w-2xs text-center">Every snippet has a story. Share yours.</span>
              <div class="flex flex-row justify-center"><router-link to="/auth" class="click-btn btn-style701"><span>Publish</span></router-link></div>
            </div>
    </div>
</template>


<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'

export default {
  setup() {
    const vantaRef = ref(null)
    const title = ref(null)
    const subtitle = ref(null)
    const codeBlock = ref(null)
    const cta = ref(null)
    let vantaEffect = null

    onMounted(() => {
  
      if (window.VANTA && window.VANTA.BIRDS) {
        vantaEffect = window.VANTA.BIRDS({
          el: vantaRef.value,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          backgroundColor: 0xffffff,
          color1: 0x159b34,
          color2: 0x319806,
          colorMode: 'lerpGradient',
        })
      } else {
        console.error('VANTA.BIRDS not loaded')
      }
      const tl = gsap.timeline({ defaults: { duration: 1, ease: 'power3.out' } })
      tl.from(title.value, { y: -50, opacity: 0 })
        .from(subtitle.value, { y: -30, opacity: 0 }, "-=0.5")
        .from(codeBlock.value, { opacity: 0, scale: 0.95 }, "-=0.4")
        .from(cta.value, { y: 20, opacity: 0, scale: 0.9 }, "-=0.3")
    })

    onBeforeUnmount(() => {
      if (vantaEffect) vantaEffect.destroy()
    })

    return {
      vantaRef,
      title,
      subtitle,
      codeBlock,
      cta,
    }
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fira+Code&display=swap');

code {
  font-family: 'Fira Code', monospace;
  font-size: 0.95rem;
  line-height: 1.5;
}
</style>
