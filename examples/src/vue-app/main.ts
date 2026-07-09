import { createApp, defineAsyncComponent, defineComponent, h } from 'vue';
import { createRouter, createWebHistory, RouterView } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

import '../index.global.css';

import '@infinite-table/infinite-vue/index.css';
import '../../../source/dist/theme/shadcn.css';
import '../../../source/dist/theme/ocean.css';
import '../../../source/dist/theme/minimalist.css';
import '../../../source/dist/theme/balsam.css';

// every .page.vue file is a route with the same URL the Next.js app gives
// its .page.tsx sibling - one Playwright spec runs against both apps
const pages = import.meta.glob('../pages/**/*.page.vue');

const routes: RouteRecordRaw[] = Object.entries(pages).map(
  ([filePath, loader]) => {
    const routePath = filePath
      .replace(/^\.\.\/pages/, '')
      .replace(/\.page\.vue$/, '')
      // /index routes are also reachable at the folder path
      .replace(/\/index$/, '');

    return {
      path: routePath || '/',
      component: defineAsyncComponent(loader as any),
    };
  },
);

routes.push({
  path: '/',
  component: defineComponent({
    setup() {
      const pagePaths = routes
        .map((route) => route.path)
        .filter((path) => path !== '/')
        .sort();

      return () =>
        h('div', { style: { color: 'white', padding: '20px' } }, [
          h('h1', 'Infinite Table - Vue examples'),
          h(
            'ul',
            pagePaths.map((path) =>
              h('li', [h('a', { href: path, style: { color: '#8cf' } }, path)]),
            ),
          ),
        ]);
    },
  }),
});

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const App = defineComponent({
  setup() {
    return () => h(RouterView);
  },
});

createApp(App).use(router).mount('#app');
