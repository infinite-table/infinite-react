'use client';

import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { whenIdle } from './hooks';

export type LazyShowcaseLoadedProps = {
  /** Call once the live demo has painted its real content. */
  onReady?: () => void;
};

export type LazyShowcaseProps<P extends object> = {
  /** Dynamic import of the live demo, e.g. `() => import('./HeroDemo')`. */
  load: () => Promise<{ default: ComponentType<P & LazyShowcaseLoadedProps> }>;
  props: P;
  /** Static first paint (an <img> screenshot, a skeleton…). Fades out once live. */
  poster: ReactNode;
  /**
   * Fixed height, so swapping poster → live never shifts layout. Omit it when
   * `className` sets a (responsive) height instead.
   */
  height?: number | string;
  /** Start loading this far before the container scrolls into view. */
  rootMargin?: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * Poster first, live demo later: the import starts when the container is
 * near the viewport AND the main thread is idle, and the live demo cross-fades
 * in over the poster once it reports `onReady`. Height is fixed up front, so
 * there is no layout shift.
 */
export function LazyShowcase<P extends object>({
  load,
  props,
  poster,
  height,
  rootMargin = '200px',
  className,
  style,
}: LazyShowcaseProps<P>) {
  const ref = useRef<HTMLDivElement | null>(null);
  const loadRef = useRef(load);
  loadRef.current = load;
  const [Live, setLive] = useState<ComponentType<
    P & LazyShowcaseLoadedProps
  > | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let cancelIdle: (() => void) | undefined;
    let disposed = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        cancelIdle = whenIdle(() => {
          loadRef
            .current()
            .then((mod) => {
              if (!disposed) setLive(() => mod.default);
            })
            .catch((error) => {
              console.warn(
                '[lazy-showcase] failed to load the live demo',
                error,
              );
              if (!disposed) setFailed(true);
            });
        });
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => {
      disposed = true;
      observer.disconnect();
      cancelIdle?.();
    };
  }, [rootMargin]);

  return (
    <div
      ref={ref}
      className={['showcase-lazy', className].filter(Boolean).join(' ')}
      style={{ height, ...style }}
      data-showcase-ready={ready ? 'true' : 'false'}
    >
      <div className="showcase-lazy__poster" aria-hidden={ready}>
        {poster}
      </div>
      {Live && !failed ? (
        <div className="showcase-lazy__live">
          <Live {...props} onReady={() => setReady(true)} />
        </div>
      ) : null}
    </div>
  );
}
