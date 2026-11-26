<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import {
  buildFrameworkSiblingHref,
  EXAMPLES_FRAMEWORKS,
  type ExamplesFramework,
  FRAMEWORK_LABELS,
  hasFrameworkSibling,
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

// one link per other framework app (React, Vue, Angular) that has this page
const links = ref<{ target: ExamplesFramework; href: string }[]>([]);

const loadSiblings = async (pathname: string) => {
  links.value = [];
  if (!pathname || isAutomationEnvironment()) {
    return;
  }

  try {
    const response = await fetch(
      `${testRunnerBaseUrl()}/check?pathname=${encodeURIComponent(pathname)}`,
    );
    const data = await response.json();
    links.value = EXAMPLES_FRAMEWORKS.filter(
      (framework) =>
        framework !== props.current && hasFrameworkSibling(data, framework),
    ).map((target) => ({
      target,
      href: buildFrameworkSiblingHref(pathname, target),
    }));
  } catch {
    // sidecar unavailable (production build, etc.)
  }
};

watch(
  () => route.path,
  (pathname) => {
    void loadSiblings(pathname);
  },
  { immediate: true },
);
</script>

<template>
  <span v-if="links.length" class="framework-links" :class="{ embedded }">
    <a
      v-for="link in links"
      :key="link.target"
      :href="link.href"
      data-testid="infinite-page-framework-link"
      :title="`Open this page in the ${FRAMEWORK_LABELS[link.target]} examples app`"
      class="framework-link"
    >
      See {{ FRAMEWORK_LABELS[link.target] }}
    </a>
  </span>
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

.framework-links {
  display: inline-flex;
  gap: 6px;
}

.framework-links:not(.embedded) {
  position: fixed;
  bottom: 6px;
  right: 132px;
  z-index: 10000;
}

/* embedded: the links are items of the dev chrome's own row */
.framework-links.embedded {
  display: contents;
}

.framework-link:hover {
  opacity: 1;
}
</style>
