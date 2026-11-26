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
  <!-- items of the bar's own row (PageDevChrome) -->
  <template v-if="links.length">
    <a
      v-for="link in links"
      :key="link.target"
      :href="link.href"
      data-testid="infinite-page-framework-link"
      :title="`Open this page in the ${FRAMEWORK_LABELS[link.target]} examples app`"
      class="ex-chrome-item ex-chrome-link"
    >
      See {{ FRAMEWORK_LABELS[link.target] }}
    </a>
  </template>
</template>
