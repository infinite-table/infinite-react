/**
 * Framework-neutral DOM-related types shared across framework builds.
 * They are intentionally minimal structural types so that both React
 * synthetic events/refs and native DOM events (Vue, etc.) satisfy them.
 */

/**
 * Neutral element ref callback — React's RefCallback and any framework's
 * mount/unmount element callback are assignable to this shape.
 */
export type ElementRefCallback = (el: HTMLElement | null) => void;

/**
 * Neutral mouse event contract for grid cell/row hover handling.
 * Only the members the shared rendering logic actually reads.
 * React.MouseEvent<HTMLElement> and native MouseEvent (with an HTMLElement
 * currentTarget) both satisfy it.
 */
export type GridMouseEvent = {
  currentTarget: EventTarget & HTMLElement;
};

/**
 * Neutral mutable ref holder — replaces React.RefObject/MutableRefObject
 * in shared (framework-free) state types.
 */
export type MutableRef<T> = { current: T };
