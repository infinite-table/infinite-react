/**
 * Angular flavour of FrameworkTypes.ts - see the comment there.
 *
 * The Angular build passes native DOM events to callbacks. Anything that
 * React renders as JSX can be, in Angular, a primitive, a `TemplateRef`, a
 * template or component descriptor (`renderTemplate()` / `renderComponent()`)
 * or an array of those.
 */
import type { Injector, TemplateRef, Type } from '@angular/core';

type CSSStringProperties = {
  [K in keyof CSSStyleDeclaration as CSSStyleDeclaration[K] extends string
    ? K extends `${number}`
      ? never
      : K
    : never]?: string | number | null;
};

/**
 * Inline styles: camelCase property names (numbers get `px`, as in React)
 * and CSS custom properties.
 */
export type CSSProperties = CSSStringProperties & {
  [customProperty: `--${string}`]: string | number | undefined | null;
};

/**
 * DOM props, applied to an element by the grid (`domProps` and friends).
 * `className` is accepted as an alias of `class`, for parity with the React
 * build. Listeners are `on` + the event name (`onClick`, `onKeyDown`) and
 * receive native DOM events.
 */
export type HTMLAttributes<_T = Element> = {
  class?: string;
  className?: string;
  style?: CSSProperties;
  id?: string;
  title?: string;
  role?: string;
  tabIndex?: number;
  [dataAttribute: `data-${string}`]: any;
  [ariaAttribute: `aria-${string}`]: any;
  [attributeOrListener: string]: any;
};
export type HTMLProps<T = Element> = HTMLAttributes<T>;

export type MutableRefObject<T> = { current: T };
export type RefObject<T> = { readonly current: T | null };
export type RefCallback<T> = (el: T | null) => void;

export type KeyboardEvent<_T = Element> = globalThis.KeyboardEvent;
export type MouseEvent<_T = Element> = globalThis.MouseEvent;
export type FocusEvent<_T = Element> = globalThis.FocusEvent;

/**
 * A template rendered with an explicit context (see `renderTemplate()`).
 */
export interface TemplateRenderable<C = any> {
  readonly kind: 'template';
  readonly template: TemplateRef<C>;
  readonly context?: C;
  readonly injector?: Injector;
}

/**
 * A component rendered with inputs and output listeners (see
 * `renderComponent()`).
 */
export interface ComponentRenderable<C = any> {
  readonly kind: 'component';
  readonly component: Type<C>;
  readonly inputs?: Record<string, unknown>;
  readonly outputs?: Record<string, (value: any) => void>;
  readonly injector?: Injector;
}

/**
 * Anything the framework can render.
 *
 * A bare component class is not a Renderable: shared code tells a render
 * function from a value with `typeof x === 'function'`, and a class is a
 * function. Use `renderComponent(Cmp)`.
 */
export type Renderable =
  | string
  | number
  | boolean
  | null
  | undefined
  | TemplateRef<any>
  | TemplateRenderable
  | ComponentRenderable
  | readonly Renderable[];

/**
 * A component (or a template) passed as an override, eg in the `components`
 * prop. A template gets the props as its context.
 */
export type ComponentType<P = {}> = Type<unknown> | TemplateRef<P>;

export type ComponentOverride<P> = ComponentType<P>;
