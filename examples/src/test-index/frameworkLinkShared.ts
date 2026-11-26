// 5555 / 5556 / 5558, or other ports when those are taken by another checkout
// (scripts/dev-ports.cjs): passed in by next.config.js, vite.config.ts and
// the Angular app's env.generated.ts
export const REACT_EXAMPLES_PORT =
  Number(process.env.NEXT_PUBLIC_EXAMPLES_PORT) || 5555;
export const VUE_EXAMPLES_PORT =
  Number(process.env.NEXT_PUBLIC_EXAMPLES_VUE_PORT) || 5556;
export const ANGULAR_EXAMPLES_PORT =
  Number(process.env.NEXT_PUBLIC_EXAMPLES_ANGULAR_PORT) || 5558;

// the front of the dev servers (scripts/examples-dev-server.js)
export const EXAMPLES_DEV_PORT =
  Number(process.env.NEXT_PUBLIC_EXAMPLES_DEV_PORT) || 5550;

export type ExamplesFramework = 'react' | 'vue' | 'angular';

export const EXAMPLES_FRAMEWORKS: ExamplesFramework[] = [
  'react',
  'vue',
  'angular',
];

export const FRAMEWORK_LABELS: Record<ExamplesFramework, string> = {
  react: 'React',
  vue: 'Vue',
  angular: 'Angular',
};

export type FrameworkSiblingInfo = {
  hasReactPage?: boolean;
  hasVuePage?: boolean;
  hasAngularPage?: boolean;
};

/** whether the sidecar's `/check` answer says `framework` has this page */
export const hasFrameworkSibling = (
  info: FrameworkSiblingInfo | null | undefined,
  framework: ExamplesFramework,
): boolean => {
  switch (framework) {
    case 'react':
      return !!info?.hasReactPage;
    case 'vue':
      return !!info?.hasVuePage;
    case 'angular':
      return !!info?.hasAngularPage;
  }
};

/**
 * The base path of the app the page is in: `/react`, `/vue` or `/angular`
 * in dev (the dev servers serve under them, see
 * scripts/examples-dev-server.js), `` in the builds the tests run on in CI.
 * On the server (the React app's static HTML) it is the one next.config.js
 * passes in.
 */
export const currentBasePath = (): string => {
  if (typeof window === 'undefined') {
    return (
      (typeof process !== 'undefined' &&
        process.env.NEXT_PUBLIC_EXAMPLES_BASE_PATH) ||
      ''
    );
  }
  const first = window.location.pathname.split('/')[1];
  return (EXAMPLES_FRAMEWORKS as string[]).includes(first) ? `/${first}` : '';
};

/** `/tests/a/b` -> `/react/tests/a/b` in dev (a link inside the app) */
export const withBasePath = (href: string): string => {
  const base = currentBasePath();
  if (!base) return href;
  return href === '/' ? `${base}/` : `${base}${href}`;
};

/** the path of the page inside its app: `/react/tests/a/b` -> `/tests/a/b` */
export const appPathname = (pathname = window.location.pathname): string => {
  const base = currentBasePath();
  if (base && (pathname === base || pathname.startsWith(base + '/'))) {
    return pathname.slice(base.length) || '/';
  }
  return pathname;
};

const PORTS: Record<ExamplesFramework, number> = {
  react: REACT_EXAMPLES_PORT,
  vue: VUE_EXAMPLES_PORT,
  angular: ANGULAR_EXAMPLES_PORT,
};

export const buildFrameworkSiblingHref = (
  pathname: string,
  target: ExamplesFramework,
  hostname: string = typeof window !== 'undefined'
    ? window.location.hostname
    : 'localhost',
  protocol: string = typeof window !== 'undefined'
    ? window.location.protocol
    : 'http:',
): string => {
  // in dev: the other app's base path, on the front of the dev servers
  if (currentBasePath()) {
    return `${protocol}//${hostname}:${EXAMPLES_DEV_PORT}/${target}${pathname}`;
  }
  return `${protocol}//${hostname}:${PORTS[target]}${pathname}`;
};

export const isAutomationEnvironment = (): boolean =>
  typeof navigator !== 'undefined' && !!(navigator as any).webdriver;
