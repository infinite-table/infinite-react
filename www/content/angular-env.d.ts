// Ambient types for the Angular docs demos (tsconfig.angular.json).

// inlined by the demo build (docs-kit.config.mjs): `define`s for the demos,
// `bootstrapDefine`s for docs-kit.bootstrap.angular.ts
declare const process: {
  env: {
    NEXT_PUBLIC_BASE_URL: string;
    NEXT_PUBLIC_INFINITE_LICENSE_KEY?: string;
    /** the Tailwind setup of `*-tailwind` demos (docs-kit.bootstrap.angular.ts) */
    DOCS_TAILWIND_STYLE?: string;
  };
};

// CSS imported for its side effects (the home page demos in content/home:
// the library's themes, the site's and the hero's styles), bundled by the
// demo build
declare module '*.css';
