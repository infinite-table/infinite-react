<script setup lang="ts">
import BackLink from './BackLink.vue';
import FrameworkLink from './FrameworkLink.vue';
import RunTestButton from './RunTestButton.vue';
import ThemeToggle from './ThemeToggle.vue';

// The bar at the bottom right of every page (index.global.css .ex-chrome),
// right to left: back, run the spec, the page in the other apps, the light /
// dark toggle. Empty (hidden) under automation.
</script>

<template>
  <div class="ex-chrome">
    <BackLink />
    <RunTestButton />
    <FrameworkLink current="vue" />
    <ThemeToggle />
  </div>
</template>
