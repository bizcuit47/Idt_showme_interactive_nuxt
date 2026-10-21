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
  padding: 1rem 2rem;
  border: var(--fw-border);
  border-radius: 0.75rem;
  background: #000;
  box-shadow: var(--fw-shadow-lg);
  color: #fff;
  font-family: var(--fw-font-heading);
  font-size: 1.125rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s var(--fw-push-ease);
}

.button-primary:hover:not(:disabled),
.button-primary:active:not(:disabled) {
  box-shadow: var(--fw-shadow-sm);
  transform: translate(4px, 4px);
}

.button-primary:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
