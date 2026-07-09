<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

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
  return computeParentHref(route.path);
});
</script>

<template>
  <a
    v-if="parentHref"
    :href="parentHref"
    data-testid="infinite-page-back-link"
    :title="`Back to ${parentHref}`"
    class="back-link"
    :class="{ embedded: props.embedded }"
  >
    ←
  </a>
</template>

<style scoped>
.back-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 14px;
  line-height: 1;
  text-decoration: none;
  opacity: 0.4;
  transition: opacity 120ms ease-in-out;
}

.back-link:not(.embedded) {
  position: fixed;
  bottom: 6px;
  right: 6px;
  z-index: 10000;
}

.back-link:hover {
  opacity: 1;
}
</style>
