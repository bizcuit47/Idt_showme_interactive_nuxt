<script setup lang="ts">
const { type = 'button', isDisabled = false } = defineProps<{
  type?: 'button' | 'submit'
  isDisabled?: boolean
}>()
</script>

<template>
  <button class="button-primary" :type="type" :disabled="isDisabled">
    <slot />
  </button>
</template>

<style scoped>
.button-primary {
  padding: 1rem;
  border: 0;
  border-radius: 1rem;
  background: #ffd166;
  color: #12132b;
  font: inherit;
  font-size: 1.125rem;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.15s,
    opacity 0.15s;
}

.button-primary:active {
  transform: scale(0.96);
}

.button-primary:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
