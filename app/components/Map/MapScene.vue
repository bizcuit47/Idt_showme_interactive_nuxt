<script setup lang="ts">
const sky = '#b7c6c2'
const yellow = '#ffe17c'
const charcoal = '#171e19'

const buildings = [
  { x: 30, width: 150, height: 400, fill: '#fff', windows: 'map-windows-dark' },
  { x: 190, width: 120, height: 300, fill: charcoal, windows: 'map-windows-light' },
  { x: 330, width: 170, height: 500, fill: yellow, windows: 'map-windows-dark' },
  { x: 520, width: 130, height: 350, fill: charcoal, windows: 'map-windows-light' },
  { x: 670, width: 160, height: 440, fill: '#fff', windows: 'map-windows-dark' },
  { x: 850, width: 190, height: 330, fill: yellow, windows: 'map-windows-dark' },
]

const clouds = [
  { x: 220, y: 330, rx: 120, ry: 34 },
  { x: 700, y: 400, rx: 140, ry: 36 },
]

const trees = [
  { x: 80, y: 1120, size: 1 },
  { x: 1000, y: 1150, size: 1.1 },
  { x: 90, y: 1840, size: 1.2 },
  { x: 980, y: 1850, size: 1.15 },
]

const groundTop = 880
const roadTop = 1000
const roadHeight = 110
const shadow = 12
</script>

<template>
  <svg
    viewBox="0 0 1080 1920"
    size-full inset-0 absolute
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <pattern id="map-dots" width="96" height="96" patternUnits="userSpaceOnUse">
        <circle cx="16" cy="16" r="6" fill="#b7c6c2" fill-opacity="0.18" />
      </pattern>
      <pattern id="map-windows-dark" width="40" height="56" patternUnits="userSpaceOnUse">
        <rect x="10" y="12" width="20" height="28" fill="#171e19" />
      </pattern>
      <pattern id="map-windows-light" width="40" height="56" patternUnits="userSpaceOnUse">
        <rect x="10" y="12" width="20" height="28" fill="#ffe17c" />
      </pattern>
    </defs>

    <rect width="1080" :height="groundTop + 6" :fill="sky" />

    <circle :cx="890 + shadow" :cy="260 + shadow" r="90" fill="#000" />
    <circle cx="890" cy="260" r="90" fill="#fff" stroke="#000" stroke-width="6" />

    <g v-for="cloud in clouds" :key="cloud.x">
      <ellipse :cx="cloud.x + shadow" :cy="cloud.y + shadow" :rx="cloud.rx" :ry="cloud.ry" fill="#000" />
      <ellipse :cx="cloud.x" :cy="cloud.y" :rx="cloud.rx" :ry="cloud.ry" fill="#fff" stroke="#000" stroke-width="6" />
    </g>

    <g v-for="building in buildings" :key="building.x">
      <rect
        :x="building.x + shadow" :y="groundTop - building.height + shadow"
        :width="building.width" :height="building.height"
        fill="#000"
      />
      <rect
        :x="building.x" :y="groundTop - building.height"
        :width="building.width" :height="building.height"
        :fill="building.fill" stroke="#000" stroke-width="6"
      />
      <rect
        :x="building.x" :y="groundTop - building.height + 20"
        :width="building.width" :height="building.height - 60"
        :fill="`url(#${building.windows})`"
      />
    </g>

    <rect :y="groundTop" width="1080" :height="1920 - groundTop" :fill="charcoal" stroke="#000" stroke-width="6" />
    <rect :y="groundTop" width="1080" :height="1920 - groundTop" fill="url(#map-dots)" />

    <rect :y="roadTop" width="1080" :height="roadHeight" :fill="sky" stroke="#000" stroke-width="6" />
    <line
      x1="0" :y1="roadTop + roadHeight / 2" x2="1080" :y2="roadTop + roadHeight / 2"
      stroke="#171e19" stroke-width="8" stroke-dasharray="60 50"
    />

    <g v-for="tree in trees" :key="`${tree.x}-${tree.y}`" :transform="`translate(${tree.x} ${tree.y}) scale(${tree.size})`">
      <rect x="-14" y="-20" width="28" height="90" :fill="charcoal" stroke="#000" stroke-width="6" />
      <circle :cx="shadow" :cy="-60 + shadow" r="62" fill="#000" />
      <circle cx="0" cy="-60" r="62" fill="#fff" stroke="#000" stroke-width="6" />
      <circle cx="-22" cy="-70" r="14" :fill="sky" stroke="#000" stroke-width="4" />
      <circle cx="24" cy="-48" r="10" :fill="sky" stroke="#000" stroke-width="4" />
    </g>
  </svg>
</template>
