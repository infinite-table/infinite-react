'use client';

import * as React from 'react';

import { type ColorMode, useSiteMode } from './demos/shared';

const readSiteMode = (): ColorMode =>
  document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';

/**
 * A home page demo of the Vue page (/vue): the Vue port of a LazyDemo
 * (content/home/vue-home-<name>.demo.vue). A Vue app, so it runs in its own
 * page, the one the docs-kit Vue build makes of the demo; this is its iframe.
 *
 * Like LazyDemo, it loads when it nears the viewport, in a placeholder of the
 * demo's size (home.css). The page posts the height of its card, and the
 * iframe takes it; with `fill`, the page fills the iframe instead (the pivot,
 * as tall as the code next to it). It opens in the site's light / dark mode
 * and is told when the mode changes.
 */
export function VueFrameDemo({
  name,
  src,
  title,
  fill = false,
}: {
  name: 'million' | 'themes' | 'pivot';
  /** The demo's page, from the Vue demo manifest. */
  src: string;
  title: string;
  fill?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  const [visible, setVisible] = React.useState(false);
  const [height, setHeight] = React.useState<number | null>(null);
  const mode = useSiteMode();
  // the mode at mount goes in the URL (the page paints in it from the start);
  // later changes are messages, so the demo isn't reloaded
  const [initialMode, setInitialMode] = React.useState<ColorMode | null>(null);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInitialMode(readSiteMode());
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (fill) return;
    const onMessage = (event: MessageEvent) => {
      if (
        event.source === frameRef.current?.contentWindow &&
        event.data?.type === 'home-demo-size' &&
        typeof event.data.height === 'number'
      ) {
        setHeight(event.data.height);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [fill]);

  React.useEffect(() => {
    frameRef.current?.contentWindow?.postMessage(
      { type: 'set-theme', theme: mode },
      window.location.origin,
    );
  }, [mode]);

  return (
    <div ref={ref} className={`home-demo home-demo--${name}`}>
      {visible && initialMode ? (
        <iframe
          ref={frameRef}
          className="home-demo__frame"
          src={`${src}?theme=${initialMode}`}
          title={title}
          allow="clipboard-write"
          style={fill || height == null ? undefined : { height }}
        />
      ) : (
        <div className="home-demo__placeholder" />
      )}
    </div>
  );
}
