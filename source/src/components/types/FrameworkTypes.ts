/**
 * The UI-framework types that the shared type declarations are written
 * against: nodes, components, inline styles, DOM props, events and refs.
 *
 * This is the React flavour. Each framework build resolves this module to
 * its own sibling (FrameworkTypes.vue.ts, ...) via `moduleSuffixes` (see
 * tsconfig.vue.json) and the esbuild framework-resolve-plugin, so the public
 * types of a build only ever mention that build's framework.
 *
 * Shared code must import these from here - never from 'react' directly and
 * never through the global `React` namespace.
 */
import type * as React from 'react';

export type {
  CSSProperties,
  HTMLProps,
  HTMLAttributes,
  ComponentType,
  MutableRefObject,
  RefObject,
  RefCallback,
  KeyboardEvent,
  MouseEvent,
  FocusEvent,
} from 'react';

/**
 * Anything the framework can render.
 */
export type Renderable = React.ReactNode | React.JSX.Element;

/**
 * A component passed as an override, eg in the `components` prop.
 */
export type ComponentOverride<P> = (props: P) => React.JSX.Element | null;
