<template>
  <header class="app-header">
    <div class="app-logo">
      <img class="app-logo-image" src="/logo.png" alt="Interactive Studio" width="44" height="44">
      <span class="app-logo-text">FUTURE WALL</span>
    </div>
    <span class="neo-pill">Startup Season 6</span>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
  padding: 0 1.25rem;
  border-bottom: var(--fw-border);
  background: var(--fw-yellow);
}

.app-logo {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.app-logo-image {
  display: block;
  width: 2.75rem;
  height: 2.75rem;
  border: var(--fw-border);
  border-radius: 50%;
  object-fit: cover;
}

.app-logo-text {
  font-family: var(--fw-font-heading);
  font-size: 1.125rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}
</style>
