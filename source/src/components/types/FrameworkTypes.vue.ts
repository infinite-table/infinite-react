/**
 * Vue flavour of FrameworkTypes.ts - see the comment there.
 *
 * The Vue build passes native DOM events to callbacks, renders vnodes and
 * takes Vue components as overrides.
 */
import type {
  Component,
  CSSProperties as VueCSSProperties,
  HTMLAttributes as VueHTMLAttributes,
  VNodeChild,
} from 'vue';

export type CSSProperties = VueCSSProperties;

/**
 * DOM props, as accepted by Vue's `h()`. `className` is accepted as an
 * alias of `class`, for parity with the React build.
 */
export type HTMLAttributes<_T = Element> = VueHTMLAttributes & {
  className?: string;
  [dataAttribute: `data-${string}`]: any;
};
export type HTMLProps<T = Element> = HTMLAttributes<T>;

export type ComponentType<_P = {}> = Component;

export type MutableRefObject<T> = { current: T };
export type RefObject<T> = { readonly current: T | null };
export type RefCallback<T> = (el: T | null) => void;

export type KeyboardEvent<_T = Element> = globalThis.KeyboardEvent;
export type MouseEvent<_T = Element> = globalThis.MouseEvent;
export type FocusEvent<_T = Element> = globalThis.FocusEvent;

/**
 * Anything the framework can render.
 */
export type Renderable = VNodeChild;

/**
 * A component passed as an override, eg in the `components` prop.
 */
export type ComponentOverride<P> =
  | Component
  | ((props: P, context: any) => VNodeChild);
