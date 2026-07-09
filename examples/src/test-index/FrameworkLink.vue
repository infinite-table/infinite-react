<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import {
  buildFrameworkSiblingHref,
  type ExamplesFramework,
  isAutomationEnvironment,
} from './frameworkLinkShared';
import { testRunnerBaseUrl } from './testRunnerShared';

const props = withDefaults(
  defineProps<{
    current: ExamplesFramework;
    embedded?: boolean;
  }>(),
  { embedded: false },
);

const route = useRoute();
const href = ref<string | null>(null);

const target = computed<ExamplesFramework>(() =>
  props.current === 'react' ? 'vue' : 'react',
);
const label = computed(() =>
  target.value === 'vue' ? 'See Vue' : 'See React',
);

const loadSibling = async (pathname: string) => {
  href.value = null;
  if (!pathname || isAutomationEnvironment()) {
    return;
  }

  try {
    const response = await fetch(
      `${testRunnerBaseUrl()}/check?pathname=${encodeURIComponent(pathname)}`,
    );
    const data = await response.json();
    const hasSibling =
      target.value === 'vue' ? !!data?.hasVuePage : !!data?.hasReactPage;
    if (hasSibling) {
      href.value = buildFrameworkSiblingHref(pathname, target.value);
    }
  } catch {
    // sidecar unavailable (production build, etc.)
  }
};

watch(
  () => route.path,
  (pathname) => {
    void loadSibling(pathname);
  },
  { immediate: true },
);
</script>

<template>
  <a
    v-if="href"
    :href="href"
    data-testid="infinite-page-framework-link"
    :title="`Open this page in the ${target === 'vue' ? 'Vue' : 'React'} examples app`"
    class="framework-link"
    :class="{ embedded }"
  >
    {{ label }}
  </a>
</template>

<style scoped>
.framework-link {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  font-size: 12px;
  line-height: 1.2;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  text-decoration: none;
  opacity: 0.9;
  font-family: inherit;
  white-space: nowrap;
}

.framework-link:not(.embedded) {
  position: fixed;
  bottom: 6px;
  right: 132px;
  z-index: 10000;
}

.framework-link:hover {
  opacity: 1;
}
</style>
