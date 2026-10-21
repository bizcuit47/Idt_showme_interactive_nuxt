<script setup lang="ts">
import { createQr } from '~/utils/qr'

const { url } = defineProps<{
  url: string
}>()

const quietZone = 2

const qr = computed(() => createQr(url))
const viewBox = computed(() => {
  const side = qr.value.size + quietZone * 2
  return `${-quietZone} ${-quietZone} ${side} ${side}`
})
</script>

<template>
  <div class="map-qr">
    <svg class="map-qr-code" :viewBox="viewBox" role="img" aria-label="QR code" shape-rendering="crispEdges">
      <rect :x="-quietZone" :y="-quietZone" :width="qr.size + quietZone * 2" :height="qr.size + quietZone * 2" fill="#fff" />
      <path :d="qr.path" fill="#000" />
    </svg>
    <p class="map-qr-caption">
      สแกนเพื่อหาเป็ดของคุณ
    </p>
  </div>
</template>

<style scoped>
.map-qr {
  position: absolute;
  z-index: 9999;
  box-sizing: border-box;
  width: 340px;
  padding: 24px 24px 20px;
  border: 6px solid #000;
  border-radius: 36px;
  background: #fff;
  box-shadow: 12px 12px 0 0 #000;
  text-align: center;
}

.map-qr-code {
  display: block;
  width: 100%;
  height: auto;
}

.map-qr-caption {
  margin: 14px 0 0;
  color: #000;
  font-family: var(--fw-font-heading);
  font-size: 34px;
  font-weight: 800;
  line-height: 1.2;
}
</style>
