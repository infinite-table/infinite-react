declare module 'virtual:test-index-routes' {
  export const testIndexRoutes: string[];
}

declare module 'vue-router' {
  interface RouteMeta {
    indexRelativePath?: string;
  }
}
