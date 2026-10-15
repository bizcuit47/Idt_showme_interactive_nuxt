<script setup lang="ts">
const buildings = [
  { x: 20, width: 150, height: 430, color: '#3b3f7a' },
  { x: 150, width: 120, height: 330, color: '#5b4fa8' },
  { x: 290, width: 170, height: 520, color: '#2f5f9e' },
  { x: 470, width: 130, height: 380, color: '#7a4fa8' },
  { x: 620, width: 160, height: 470, color: '#3f6fb0' },
  { x: 790, width: 120, height: 340, color: '#5d4f9f' },
  { x: 920, width: 150, height: 450, color: '#2f4f8f' },
]

const trees = [
  { x: 70, y: 1080, size: 1 },
  { x: 1010, y: 1110, size: 1.1 },
  { x: 90, y: 1840, size: 1.2 },
  { x: 980, y: 1850, size: 1.15 },
]

const groundTop = 880
</script>

<template>
  <svg
    viewBox="0 0 1080 1920"
    size-full inset-0 absolute
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <linearGradient id="map-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#14163a" />
        <stop offset="0.6" stop-color="#3a2b7a" />
        <stop offset="1" stop-color="#e58a6b" />
      </linearGradient>
      <linearGradient id="map-ground" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3f8f5a" />
        <stop offset="1" stop-color="#1f5a3c" />
      </linearGradient>
      <pattern id="map-windows" width="30" height="40" patternUnits="userSpaceOnUse">
        <rect x="8" y="8" width="14" height="20" rx="2" fill="#ffe9a8" fill-opacity="0.75" />
      </pattern>
    </defs>

    <rect width="1080" :height="groundTop + 40" fill="url(#map-sky)" />
    <circle cx="880" cy="250" r="90" fill="#ffd166" fill-opacity="0.9" />
    <g fill="#fff" fill-opacity="0.18">
      <ellipse cx="220" cy="300" rx="130" ry="36" />
      <ellipse cx="300" cy="270" rx="90" ry="30" />
      <ellipse cx="700" cy="440" rx="150" ry="38" />
    </g>

    <g v-for="building in buildings" :key="building.x">
      <rect
        :x="building.x" :y="groundTop - building.height"
        :width="building.width" :height="building.height"
        :fill="building.color"
      />
      <rect
        :x="building.x" :y="groundTop - building.height + 20"
        :width="building.width" :height="building.height - 60"
        fill="url(#map-windows)"
      />
    </g>

    <rect :y="groundTop" width="1080" :height="1920 - groundTop" fill="url(#map-ground)" />
    <rect y="1000" width="1080" height="110" fill="#8d8aa8" fill-opacity="0.35" />
    <g stroke="#fff" stroke-opacity="0.45" stroke-width="8" stroke-dasharray="60 50">
      <line x1="0" y1="1055" x2="1080" y2="1055" />
    </g>

    <g v-for="tree in trees" :key="`${tree.x}-${tree.y}`" :transform="`translate(${tree.x} ${tree.y}) scale(${tree.size})`">
      <rect x="-12" y="-20" width="24" height="90" rx="8" fill="#6b4a2f" />
      <circle cx="0" cy="-60" r="62" fill="#2f9e5a" />
      <circle cx="-34" cy="-30" r="42" fill="#3cb36a" />
      <circle cx="34" cy="-34" r="40" fill="#34a860" />
    </g>
  </svg>
</template>
