<script setup lang="ts">
import BackLink from './BackLink.vue';
import FrameworkLink from './FrameworkLink.vue';
import RunTestButton from './RunTestButton.vue';
</script>

<template>
  <div class="page-dev-chrome">
    <BackLink embedded />
    <RunTestButton embedded />
    <FrameworkLink current="vue" embedded />
  </div>
</template>

<style scoped>
.page-dev-chrome {
  position: fixed;
  bottom: 6px;
  right: 6px;
  z-index: 10000;
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  gap: 6px;
}
</style>
