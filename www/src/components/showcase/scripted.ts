/**
 * Tiny automation toolkit for a "scripted demo you can take over": a fake SVG
 * cursor tweened over a LIVE component, with real state changes applied at
 * each "click". Everything is cancellable through one AbortSignal, so a single
 * real user interaction stops the show instantly and leaves the component
 * exactly where the script brought it.
 *
 * Product-agnostic on purpose: no imports from any grid or app code.
 */

/** Thrown by every helper when the script is aborted; callers swallow it. */
export class ScriptCancelled extends Error {
  constructor() {
    super('script cancelled');
    this.name = 'ScriptCancelled';
  }
}

export function assertActive(signal: AbortSignal) {
  if (signal.aborted) throw new ScriptCancelled();
}

export function sleep(ms: number, signal: AbortSignal): Promise<void> {
  assertActive(signal);
  return new Promise((resolve, reject) => {
    const id = window.setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      window.clearTimeout(id);
      reject(new ScriptCancelled());
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

/** Poll until `get` returns a truthy value; null when it times out. */
export async function waitFor<T>(
  get: () => T | null | undefined | false,
  signal: AbortSignal,
  {
    timeout = 12000,
    interval = 120,
  }: { timeout?: number; interval?: number } = {},
): Promise<T | null> {
  const deadline = Date.now() + timeout;
  for (;;) {
    assertActive(signal);
    const value = get();
    if (value) return value;
    if (Date.now() > deadline) return null;
    await sleep(interval, signal);
  }
}

export type Point = { x: number; y: number };

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Run `onFrame(easedT)` on every animation frame for `duration` ms. */
export function tween(
  onFrame: (t: number) => void,
  duration: number,
  signal: AbortSignal,
  ease: (t: number) => number = easeInOutCubic,
): Promise<void> {
  assertActive(signal);
  return new Promise((resolve, reject) => {
    const start = performance.now();
    let raf = 0;
    const onAbort = () => {
      cancelAnimationFrame(raf);
      reject(new ScriptCancelled());
    };
    signal.addEventListener('abort', onAbort, { once: true });
    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      try {
        onFrame(ease(t));
      } catch (error) {
        signal.removeEventListener('abort', onAbort);
        reject(error);
        return;
      }
      if (t >= 1) {
        signal.removeEventListener('abort', onAbort);
        resolve();
      } else {
        raf = requestAnimationFrame(frame);
      }
    };
    raf = requestAnimationFrame(frame);
  });
}

/**
 * Inertial "fling": starts at `velocity` (px per ms) and decays exponentially,
 * like a trackpad swipe released at speed. `apply` receives the delta for the
 * frame and returns false to stop early (for example when an edge is hit).
 * Resolves with the total distance travelled.
 */
export function fling(
  apply: (delta: number) => boolean | void,
  {
    velocity,
    /** Fraction of velocity kept per 16.7ms frame. 0.95 ≈ a long glide. */
    friction = 0.955,
    minVelocity = 0.02,
    maxDuration = 4000,
  }: {
    velocity: number;
    friction?: number;
    minVelocity?: number;
    maxDuration?: number;
  },
  signal: AbortSignal,
): Promise<number> {
  assertActive(signal);
  return new Promise((resolve, reject) => {
    let v = velocity;
    let last = performance.now();
    const start = last;
    let travelled = 0;
    let raf = 0;
    const onAbort = () => {
      cancelAnimationFrame(raf);
      reject(new ScriptCancelled());
    };
    signal.addEventListener('abort', onAbort, { once: true });
    const done = () => {
      signal.removeEventListener('abort', onAbort);
      resolve(travelled);
    };
    const frame = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      const delta = v * dt;
      travelled += delta;
      let keepGoing: boolean | void = true;
      try {
        keepGoing = apply(delta);
      } catch (error) {
        signal.removeEventListener('abort', onAbort);
        reject(error);
        return;
      }
      v *= Math.pow(friction, dt / 16.67);
      if (
        keepGoing === false ||
        Math.abs(v) < minVelocity ||
        now - start > maxDuration
      ) {
        done();
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  });
}

const SYNTHETIC_POINTER_ID = 999;

function safeDispatch(el: EventTarget, event: Event) {
  try {
    el.dispatchEvent(event);
  } catch {
    // a hostile handler must not kill the script
  }
}

function mouseInit(
  clientX: number,
  clientY: number,
  extra: MouseEventInit = {},
) {
  return {
    bubbles: true,
    cancelable: true,
    composed: true,
    view: window,
    clientX,
    clientY,
    ...extra,
  } satisfies MouseEventInit;
}

function pointerEvent(
  type: string,
  clientX: number,
  clientY: number,
  extra: PointerEventInit = {},
) {
  return new PointerEvent(type, {
    ...mouseInit(clientX, clientY),
    pointerId: SYNTHETIC_POINTER_ID,
    pointerType: 'mouse',
    isPrimary: true,
    ...extra,
  });
}

/**
 * Dispatch a full pointer+mouse sequence so whatever the target listens to
 * (pointerdown, mousedown, click…) fires. Coordinates are real client-space
 * coords, so `elementFromPoint`-style logic in handlers also works.
 *
 * Note: synthetic events have `isTrusted === false`; the takeover logic in
 * AutomatedDemo relies on that to tell the script apart from the user.
 */
export function dispatchClickSequence(
  el: HTMLElement,
  clientX: number,
  clientY: number,
) {
  safeDispatch(el, pointerEvent('pointerover', clientX, clientY));
  safeDispatch(
    el,
    pointerEvent('pointerenter', clientX, clientY, { bubbles: false }),
  );
  safeDispatch(el, new MouseEvent('mouseover', mouseInit(clientX, clientY)));
  safeDispatch(
    el,
    pointerEvent('pointerdown', clientX, clientY, { button: 0, buttons: 1 }),
  );
  safeDispatch(
    el,
    new MouseEvent(
      'mousedown',
      mouseInit(clientX, clientY, { button: 0, buttons: 1 }),
    ),
  );
  safeDispatch(
    el,
    pointerEvent('pointerup', clientX, clientY, { button: 0, buttons: 0 }),
  );
  safeDispatch(
    el,
    new MouseEvent('mouseup', mouseInit(clientX, clientY, { button: 0 })),
  );
  safeDispatch(
    el,
    new MouseEvent(
      'click',
      mouseInit(clientX, clientY, { button: 0, detail: 1 }),
    ),
  );
}

/** Fire hover events (pointerover/enter, mouseover/enter/move) on `el`. */
export function dispatchHover(
  el: HTMLElement,
  clientX: number,
  clientY: number,
) {
  safeDispatch(el, pointerEvent('pointerover', clientX, clientY));
  safeDispatch(
    el,
    pointerEvent('pointerenter', clientX, clientY, { bubbles: false }),
  );
  safeDispatch(el, new MouseEvent('mouseover', mouseInit(clientX, clientY)));
  safeDispatch(
    el,
    new MouseEvent(
      'mouseenter',
      mouseInit(clientX, clientY, { bubbles: false }),
    ),
  );
  safeDispatch(el, pointerEvent('pointermove', clientX, clientY));
  safeDispatch(el, new MouseEvent('mousemove', mouseInit(clientX, clientY)));
}

/**
 * Synthetic pointer ids are unknown to the browser, so `setPointerCapture`
 * throws for them. While a scripted drag runs, shadow it on the element
 * instance (and restore it afterwards).
 */
function shimPointerCapture(el: HTMLElement) {
  const own = Object.prototype.hasOwnProperty.call(el, 'setPointerCapture');
  const previous = own ? el.setPointerCapture : undefined;
  const previousRelease = Object.prototype.hasOwnProperty.call(
    el,
    'releasePointerCapture',
  )
    ? el.releasePointerCapture
    : undefined;
  el.setPointerCapture = () => {};
  el.releasePointerCapture = () => {};
  return () => {
    if (previous) el.setPointerCapture = previous;
    else delete (el as Partial<HTMLElement>).setPointerCapture;
    if (previousRelease) el.releasePointerCapture = previousRelease;
    else delete (el as Partial<HTMLElement>).releasePointerCapture;
  };
}

/** Distance-based duration: constant perceived speed, clamped to sane bounds. */
function moveDuration(from: Point, to: Point, speed = 1) {
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  return Math.min(1100, Math.max(260, distance / 0.9)) / speed;
}

const CURSOR_HTML = `
  <span class="showcase-cursor__ring"></span>
  <svg class="showcase-cursor__arrow" width="26" height="30" viewBox="0 0 26 30" aria-hidden="true">
    <path d="M2 1 L2 24 L8.4 18.6 L12.2 27.6 L16.6 25.7 L12.8 16.9 L20.5 16.6 Z"
      fill="#14161c" stroke="#fff" stroke-width="1.6" stroke-linejoin="round" />
  </svg>
  <span class="showcase-cursor__label"></span>
`;

export type ScriptedCursor = ReturnType<typeof createScriptedCursor>;

/**
 * The fake mouse: a cursor element inside a pointer-events-none overlay that
 * covers the demo. Positions are in overlay-local coordinates; the arrow tip
 * is the hotspot.
 */
export function createScriptedCursor(overlay: HTMLElement) {
  const el = document.createElement('div');
  el.className = 'showcase-cursor';
  el.innerHTML = CURSOR_HTML;
  overlay.appendChild(el);
  const label = el.querySelector<HTMLElement>('.showcase-cursor__label')!;

  let pos: Point = {
    x: overlay.clientWidth * 0.5,
    y: overlay.clientHeight * 0.65,
  };
  const render = () => {
    el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
  };
  render();

  const toLocal = (clientX: number, clientY: number): Point => {
    const rect = overlay.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  };
  const toClient = (p: Point): Point => {
    const rect = overlay.getBoundingClientRect();
    return { x: p.x + rect.left, y: p.y + rect.top };
  };
  const centerOf = (
    target: HTMLElement,
    offset: Partial<Point> = {},
  ): Point => {
    const rect = target.getBoundingClientRect();
    return toLocal(
      rect.left + rect.width / 2 + (offset.x ?? 0),
      rect.top + rect.height / 2 + (offset.y ?? 0),
    );
  };

  const cursor = {
    element: el,
    show() {
      el.classList.add('is-visible');
    },
    hide() {
      el.classList.remove('is-visible', 'is-pressed', 'is-clicking');
      cursor.setLabel(null);
    },
    /** A small caption next to the cursor ("⇢ swipe", "1M rows"…); null hides it. */
    setLabel(text: string | null) {
      label.textContent = text ?? '';
      el.classList.toggle('has-label', !!text);
    },
    /** Current hotspot position in client coordinates (for event dispatch). */
    clientPoint(): Point {
      return toClient(pos);
    },
    localPoint(): Point {
      return { ...pos };
    },

    async moveTo(
      target: Point,
      signal: AbortSignal,
      { speed = 1 }: { speed?: number } = {},
    ) {
      el.classList.add('is-visible');
      const from = { ...pos };
      await tween(
        (t) => {
          pos = {
            x: from.x + (target.x - from.x) * t,
            y: from.y + (target.y - from.y) * t,
          };
          render();
        },
        moveDuration(from, target, speed),
        signal,
      );
    },

    /**
     * Move to an element's center (plus optional offset from center).
     * Recomputes the rect at call time, so virtualized cells are fine as long
     * as they exist when the move starts.
     */
    async moveToElement(
      target: HTMLElement,
      signal: AbortSignal,
      offset: Partial<Point> = {},
      options?: { speed?: number },
    ) {
      await cursor.moveTo(centerOf(target, offset), signal, options);
    },

    /** Move onto `target` and fire hover events on it (opens hover menus). */
    async hover(
      target: HTMLElement,
      signal: AbortSignal,
      offset: Partial<Point> = {},
    ) {
      await cursor.moveToElement(target, signal, offset);
      const client = toClient(pos);
      dispatchHover(target, client.x, client.y);
    },

    /**
     * Play the click ripple; optionally dispatch a real event sequence on
     * `target` at the current cursor position. Resolves after the press —
     * the ripple keeps expanding while the script moves on.
     */
    async click(signal: AbortSignal, target?: HTMLElement | null) {
      el.classList.remove('is-clicking');
      // reflow so re-adding the class restarts the ripple animation
      void el.offsetWidth;
      el.classList.add('is-clicking');
      await sleep(130, signal);
      let restore: (() => void) | undefined;
      if (target) {
        const client = toClient(pos);
        restore = shimPointerCapture(target);
        dispatchClickSequence(target, client.x, client.y);
      }
      try {
        await sleep(200, signal);
      } finally {
        // handlers often finish in a rAF that may still call setPointerCapture
        restore?.();
        el.classList.remove('is-clicking');
      }
    },

    /**
     * Press on `source`, drag to `to` (overlay-local) dispatching pointermove
     * along the way, release. Events go to `source` (handlers that track a
     * drag usually listen on the pressed element with pointer capture).
     */
    async drag(
      source: HTMLElement,
      to: Point,
      signal: AbortSignal,
      {
        duration = 900,
        steps = 36,
      }: { duration?: number; steps?: number } = {},
    ) {
      await cursor.moveToElement(source, signal);
      const restore = shimPointerCapture(source);
      try {
        const start = toClient(pos);
        el.classList.add('is-pressed');
        safeDispatch(
          source,
          pointerEvent('pointerdown', start.x, start.y, {
            button: 0,
            buttons: 1,
          }),
        );
        safeDispatch(
          source,
          new MouseEvent(
            'mousedown',
            mouseInit(start.x, start.y, { button: 0, buttons: 1 }),
          ),
        );
        await sleep(160, signal);
        const from = { ...pos };
        let lastStep = -1;
        await tween(
          (t) => {
            pos = {
              x: from.x + (to.x - from.x) * t,
              y: from.y + (to.y - from.y) * t,
            };
            render();
            const step = Math.floor(t * steps);
            if (step !== lastStep) {
              lastStep = step;
              const client = toClient(pos);
              safeDispatch(
                source,
                pointerEvent('pointermove', client.x, client.y, { buttons: 1 }),
              );
            }
          },
          duration,
          signal,
        );
        await sleep(140, signal);
        const end = toClient(pos);
        safeDispatch(
          source,
          pointerEvent('pointerup', end.x, end.y, { button: 0, buttons: 0 }),
        );
        safeDispatch(
          source,
          new MouseEvent('mouseup', mouseInit(end.x, end.y, { button: 0 })),
        );
        el.classList.remove('is-pressed');
        // handlers commonly finish the drop in a rAF
        await sleep(120, signal);
      } finally {
        el.classList.remove('is-pressed');
        restore();
      }
    },

    /** Convert an element's center to overlay-local coordinates. */
    centerOf,

    destroy() {
      el.remove();
    },
  };

  return cursor;
}
