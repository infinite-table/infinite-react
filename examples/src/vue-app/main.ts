import { createApp, defineAsyncComponent, defineComponent, h } from 'vue';
import { createRouter, createWebHistory, RouterView } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

import '../index.global.css';

import '@infinite-table/infinite-vue/index.css';
import '../../../source/dist/theme/shadcn.css';
import '../../../source/dist/theme/ocean.css';
import '../../../source/dist/theme/minimalist.css';
import '../../../source/dist/theme/balsam.css';

import PageDevChrome from '../test-index/PageDevChrome.vue';
import TestPagesIndexRoute from '../test-index/TestPagesIndexRoute.vue';
import { testIndexRoutes } from 'virtual:test-index-routes';

// every .page.vue file is a route with the same URL the Next.js app gives
// its .page.tsx sibling - one Playwright spec runs against both apps
const pages = import.meta.glob('../pages/**/*.page.vue');

const demoRoutes: RouteRecordRaw[] = Object.entries(pages)
  .filter(([filePath]) => !filePath.endsWith('/index.page.vue'))
  .map(([filePath, loader]) => {
    const routePath = filePath
      .replace(/^\.\.\/pages/, '')
      .replace(/\.page\.vue$/, '')
      .replace(/\/index$/, '');

    return {
      path: routePath || '/',
      component: defineAsyncComponent(loader as any),
    };
  });

const indexRoutes: RouteRecordRaw[] = testIndexRoutes.map((routePath) => {
  const relativePath =
    routePath === '/'
      ? ''
      : routePath.replace(/^\//, '');

  return {
    path: routePath,
    component: TestPagesIndexRoute,
    meta: {
      indexRelativePath: relativePath,
    },
  };
});

// index routes win over demo routes when both exist at the same path
const routes: RouteRecordRaw[] = [...indexRoutes, ...demoRoutes];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const App = defineComponent({
  setup() {
    return () =>
      h('div', { class: 'vue-examples-app' }, [
        h(RouterView),
        h(PageDevChrome),
      ]);
  },
});

createApp(App).use(router).mount('#app');
