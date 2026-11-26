<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { withBasePath } from './frameworkLinkShared';

const props = withDefaults(
  defineProps<{
    embedded?: boolean;
  }>(),
  { embedded: false },
);

const route = useRoute();

const computeParentHref = (pathname: string): string | null => {
  if (!pathname || pathname === '/') {
    return null;
  }
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) {
    return null;
  }
  parts.pop();
  return parts.length === 0 ? '/' : `/${parts.join('/')}`;
};

const parentHref = computed(() => {
  if (typeof navigator !== 'undefined' && (navigator as any).webdriver) {
    return null;
  }
  // the parent folder in the app (route.path), with the /vue base path of dev
  const parent = computeParentHref(route.path);
  return parent === null ? null : withBasePath(parent);
});
</script>

<template>
  <a
    v-if="parentHref"
    :href="parentHref"
    data-testid="infinite-page-back-link"
    :title="`Back to ${parentHref}`"
    :aria-label="`Back to ${parentHref}`"
    class="ex-chrome-item ex-chrome-icon"
  >
    ←
  </a>
</template>
