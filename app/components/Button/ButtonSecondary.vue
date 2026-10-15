<script setup lang="ts">
const { isDisabled = false } = defineProps<{
  isDisabled?: boolean
}>()
</script>

<template>
  <button class="button-secondary" type="button" :disabled="isDisabled">
    <slot />
  </button>
</template>

<style scoped>
.button-secondary {
  padding: 1rem;
  border: 0;
  border-radius: 1rem;
  background: rgb(255 255 255 / 0.12);
  box-shadow: inset 0 0 0 2px rgb(255 255 255 / 0.25);
  color: #fff;
  font: inherit;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.15s,
    opacity 0.15s;
}

.button-secondary:active {
  transform: scale(0.96);
}

.button-secondary:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
