// 5555 / 5556, or other ports when those are taken by another checkout
// (scripts/dev-ports.cjs): passed in by next.config.js and vite.config.ts
export const REACT_EXAMPLES_PORT =
  Number(process.env.NEXT_PUBLIC_EXAMPLES_PORT) || 5555;
export const VUE_EXAMPLES_PORT =
  Number(process.env.NEXT_PUBLIC_EXAMPLES_VUE_PORT) || 5556;

export type ExamplesFramework = 'react' | 'vue';

export type FrameworkSiblingInfo = {
  hasReactPage?: boolean;
  hasVuePage?: boolean;
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
  const port =
    target === 'react' ? REACT_EXAMPLES_PORT : VUE_EXAMPLES_PORT;
  return `${protocol}//${hostname}:${port}${pathname}`;
};

export const isAutomationEnvironment = (): boolean =>
  typeof navigator !== 'undefined' && !!(navigator as any).webdriver;
