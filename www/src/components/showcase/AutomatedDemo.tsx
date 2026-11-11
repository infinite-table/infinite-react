'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { canRunScriptedShow } from './hooks';
import {
  createScriptedCursor,
  ScriptCancelled,
  sleep,
  waitFor,
  type ScriptedCursor,
} from './scripted';

export type AutomatedDemoStatus =
  /** Not animating: offscreen, before ready, or unsupported device. */
  | 'idle'
  /** The show is running (fake cursor visible). */
  | 'running'
  /** The user interacted — the demo is theirs until they hit replay. */
  | 'user';

export type ShowcaseScriptContext = {
  /** Wrapper element containing the live demo (and its in-demo portals). */
  root: HTMLElement;
  cursor: ScriptedCursor;
  signal: AbortSignal;
};

export type AutomatedDemoProps = {
  children: ReactNode;
  /** The product demo is mounted and can be driven. */
  ready: boolean;
  /** One full pass of the show. Must honour `signal` (use the toolkit helpers). */
  run: (context: ShowcaseScriptContext) => Promise<void>;
  /** Put the demo back to its initial state; called before every pass. */
  reset?: (context: ShowcaseScriptContext) => void | Promise<void>;
  /** Wait for this selector inside the root before the first pass. */
  waitForSelector?: string;
  /** Pause between passes, in ms. */
  loopPause?: number;
  /** No show below this viewport width (and never on touch / reduced motion). */
  minViewportWidth?: number;
  /** IntersectionObserver threshold for "in view". */
  threshold?: number;
  runningLabel?: ReactNode;
  userLabel?: ReactNode;
  className?: string;
  style?: CSSProperties;
  onStatusChange?: (status: AutomatedDemoStatus) => void;
};

/**
 * Wraps a live demo in an automated show: a scripted cursor drives the LIVE
 * component while it's in view, and the first real interaction (click /
 * wheel / touch / key) hands control to the user instantly, leaving the demo
 * where the script left it. A broken script ends quietly — it must never
 * break the page.
 */
export function AutomatedDemo({
  children,
  ready,
  run,
  reset,
  waitForSelector,
  loopPause = 2600,
  minViewportWidth = 768,
  threshold = 0.35,
  runningLabel = 'live demo — click anywhere to take over',
  userLabel = 'you’re in control — replay demo ↻',
  className,
  style,
  onStatusChange,
}: AutomatedDemoProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<ScriptedCursor | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const intersectingRef = useRef(false);
  const readyRef = useRef(ready);
  const statusRef = useRef<AutomatedDemoStatus>('idle');
  const [status, setStatusState] = useState<AutomatedDemoStatus>('idle');

  // latest callbacks without restarting the observers
  const runRef = useRef(run);
  const resetRef = useRef(reset);
  const onStatusChangeRef = useRef(onStatusChange);
  runRef.current = run;
  resetRef.current = reset;
  onStatusChangeRef.current = onStatusChange;

  const setStatus = useCallback((next: AutomatedDemoStatus) => {
    statusRef.current = next;
    setStatusState(next);
    onStatusChangeRef.current?.(next);
  }, []);

  const stop = useCallback(
    (next: AutomatedDemoStatus) => {
      abortRef.current?.abort();
      abortRef.current = null;
      cursorRef.current?.hide();
      setStatus(next);
    },
    [setStatus],
  );

  const tryStart = useCallback(() => {
    if (statusRef.current !== 'idle') return;
    if (!intersectingRef.current || !readyRef.current) return;
    if (document.visibilityState === 'hidden') return;
    const root = wrapperRef.current;
    const overlay = overlayRef.current;
    if (!root || !overlay) return;
    // the show is pointless (and annoying) on touch / small / reduced-motion
    if (!canRunScriptedShow(minViewportWidth)) return;

    if (!cursorRef.current) cursorRef.current = createScriptedCursor(overlay);
    const cursor = cursorRef.current;
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus('running');

    void (async () => {
      const { signal } = controller;
      const context: ShowcaseScriptContext = { root, cursor, signal };
      try {
        if (waitForSelector) {
          const found = await waitFor(
            () => root.querySelector(waitForSelector),
            signal,
            {
              timeout: 20000,
            },
          );
          if (!found) throw new ScriptCancelled();
        }
        for (;;) {
          await resetRef.current?.(context);
          await sleep(700, signal);
          await runRef.current(context);
          cursor.hide();
          await sleep(loopPause, signal);
        }
      } catch (error) {
        cursor.hide();
        if (!(error instanceof ScriptCancelled)) {
          // a broken show must never break the page — just end it quietly
          console.warn('[automated-demo]', error);
          if (statusRef.current === 'running') stop('user');
        }
      }
    })();
  }, [loopPause, minViewportWidth, setStatus, stop, waitForSelector]);

  useEffect(() => {
    readyRef.current = ready;
    if (ready) tryStart();
    else if (statusRef.current === 'running') stop('idle');
  }, [ready, tryStart, stop]);

  // start/pause with viewport visibility
  useEffect(() => {
    const root = wrapperRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries.some((entry) => entry.isIntersecting);
        intersectingRef.current = isIntersecting;
        if (isIntersecting) tryStart();
        else if (statusRef.current === 'running') stop('idle');
      },
      { threshold },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [threshold, tryStart, stop]);

  // a hidden tab is as good as off-screen
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        if (statusRef.current === 'running') stop('idle');
      } else {
        tryStart();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [tryStart, stop]);

  // first REAL interaction anywhere on the demo = takeover. The script's own
  // dispatched events are untrusted, which is how we tell them apart.
  useEffect(() => {
    const root = wrapperRef.current;
    if (!root) return;
    const onInteract = (event: Event) => {
      if (!event.isTrusted) return;
      if (statusRef.current === 'running') stop('user');
      // touched before the show got going: don't start it under the user
      else if (
        statusRef.current === 'idle' &&
        canRunScriptedShow(minViewportWidth)
      ) {
        stop('user');
      }
    };
    const events = ['pointerdown', 'wheel', 'touchstart', 'keydown'] as const;
    for (const type of events) {
      root.addEventListener(type, onInteract, { capture: true, passive: true });
    }
    return () => {
      for (const type of events)
        root.removeEventListener(type, onInteract, { capture: true });
    };
  }, [stop, minViewportWidth]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      cursorRef.current?.destroy();
      cursorRef.current = null;
    };
  }, []);

  const replay = useCallback(() => {
    if (statusRef.current === 'running') return;
    setStatus('idle');
    // let the status flip settle before the loop re-checks it
    requestAnimationFrame(() => tryStart());
  }, [setStatus, tryStart]);

  return (
    <div
      ref={wrapperRef}
      className={['showcase-demo', className].filter(Boolean).join(' ')}
      data-showcase-status={status}
      style={style}
    >
      {children}
      {/* cursor layer: above the demo AND its in-demo popups, but transparent to input */}
      <div ref={overlayRef} aria-hidden className="showcase-demo__overlay" />
      {status === 'running' ? (
        <div className="showcase-pill showcase-pill--running" role="status">
          <span className="showcase-pill__dot" />
          {runningLabel}
        </div>
      ) : null}
      {status === 'user' ? (
        <button
          type="button"
          onClick={replay}
          className="showcase-pill showcase-pill--user"
        >
          {userLabel}
        </button>
      ) : null}
    </div>
  );
}
