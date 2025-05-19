
<script>
export default {
  mounted() {
    if (window.VANTA && window.VANTA.BIRDS) {
      this.vantaEffect = window.VANTA.BIRDS({
        el: this.$refs.vantaRef,
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
  },
  beforeDestroy() {
    if (this.vantaEffect) this.vantaEffect.destroy()
  },
}
</script>

<template>
  <div ref="vantaRef" class="w-full landing-section"><div class="container space-x-4">
    <span class="text-7xl text-black mr-4">CodeBook</span>
    <span class="text-3xl text-black max-w-2xl">Empowering Developers to Share, Learn, and Grow.</span>
    </div></div>
</template>

<style scoped>

</style>

