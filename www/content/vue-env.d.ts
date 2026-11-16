// Ambient types for the Vue docs demos (tsconfig.vue.json).
declare module '@infinite-table/infinite-vue/index.css';
declare module '@infinite-table/infinite-vue/theme/*.css';

declare namespace NodeJS {
  interface ProcessEnv {
    // inlined by the demo build (docs-kit.config.mjs)
    NEXT_PUBLIC_BASE_URL: string;
  }
}
