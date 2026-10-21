<script setup lang="ts">
import { appDescription, appName } from '~/constants'

useHead({
  title: appName,
  htmlAttrs: { lang: 'th' },
  meta: [{ name: 'description', content: appDescription }],
})
</script>

<template>
  <VitePwaManifest />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
html,
body,
#__nuxt {
  min-height: 100%;
  margin: 0;
  padding: 0;
}
</style>
