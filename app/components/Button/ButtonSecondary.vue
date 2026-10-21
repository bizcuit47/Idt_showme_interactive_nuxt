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
  padding: 1rem 2rem;
  border: var(--fw-border);
  border-radius: 0.75rem;
  background: #fff;
  box-shadow: var(--fw-shadow-sm);
  color: #000;
  font-family: var(--fw-font-heading);
  font-size: 1.125rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s var(--fw-push-ease);
}

.button-secondary:hover:not(:disabled),
.button-secondary:active:not(:disabled) {
  box-shadow: 0 0 0 0 #000;
  transform: translate(4px, 4px);
}

.button-secondary:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
