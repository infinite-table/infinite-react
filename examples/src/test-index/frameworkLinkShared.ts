// 5555 / 5556 / 5558, or other ports when those are taken by another checkout
// (scripts/dev-ports.cjs): passed in by next.config.js, vite.config.ts and
// the Angular app's env.generated.ts
export const REACT_EXAMPLES_PORT =
  Number(process.env.NEXT_PUBLIC_EXAMPLES_PORT) || 5555;
export const VUE_EXAMPLES_PORT =
  Number(process.env.NEXT_PUBLIC_EXAMPLES_VUE_PORT) || 5556;
export const ANGULAR_EXAMPLES_PORT =
  Number(process.env.NEXT_PUBLIC_EXAMPLES_ANGULAR_PORT) || 5558;

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
  return `${protocol}//${hostname}:${PORTS[target]}${pathname}`;
};

export const isAutomationEnvironment = (): boolean =>
  typeof navigator !== 'undefined' && !!(navigator as any).webdriver;
