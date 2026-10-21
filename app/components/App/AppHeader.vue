<template>
  <header class="app-header">
    <div class="app-logo">
      <span class="app-logo-icon">
        <span i-carbon-flash />
      </span>
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

.app-logo-icon {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  background: #000;
  color: var(--fw-yellow);
  font-size: 1.25rem;
}

.app-logo-text {
  font-family: var(--fw-font-heading);
  font-size: 1.125rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}
</style>
