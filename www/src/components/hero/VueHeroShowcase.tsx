'use client';

import * as React from 'react';

import {
  LazyShowcase,
  type LazyShowcaseLoadedProps,
} from '@thedatagrid/docs-kit/showcase';
import { HeroPoster } from './HeroPoster';

import '@thedatagrid/docs-kit/showcase/styles.css';
import './hero-tokens.css';
import './hero-frame.css';

type ColorMode = 'light' | 'dark';

const siteMode = (): ColorMode =>
  document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';

type VueHeroFrameProps = LazyShowcaseLoadedProps & {
  /** The page of the Vue hero demo (content/home/vue-hero.demo.vue). */
  src: string;
};

/**
 * The Vue hero is a Vue app, so it runs in its own page: the one the docs-kit
 * Vue build makes of content/home/vue-hero.demo.vue. This is its iframe. It
 * opens in the site's light / dark mode and is told when the mode changes;
 * the hero posts `hero-live` once its first rows have painted.
 */
function VueHeroFrame({ src, onReady }: VueHeroFrameProps) {
  const frameRef = React.useRef<HTMLIFrameElement | null>(null);
  // the mode at mount goes in the URL (the page paints in it from the start);
  // later changes are messages, so the hero isn't reloaded
  const [initialMode] = React.useState(siteMode);

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.source === frameRef.current?.contentWindow &&
        event.data?.type === 'hero-live'
      ) {
        onReady?.();
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onReady]);

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      frameRef.current?.contentWindow?.postMessage(
        { type: 'set-theme', theme: siteMode() },
        window.location.origin,
      );
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <iframe
      ref={frameRef}
      className="hero-frame__iframe"
      src={`${src}?theme=${initialMode}`}
      title="Infinite Table for Vue: live trading blotter"
    />
  );
}

const loadVueHeroFrame = async () => ({ default: VueHeroFrame });

/**
 * The Vue hero as it goes on the Vue home page: the same frame and poster as
 * the React one (HeroShowcase), with the Vue demo's page loaded in an iframe
 * when the frame nears the viewport and the browser is idle.
 */
export function VueHeroShowcase({
  src,
  className,
}: {
  src: string;
  /** Extra frame classes, e.g. `hero-frame--page`. */
  className?: string;
}) {
  const props = React.useMemo(() => ({ src }), [src]);
  return (
    <LazyShowcase<{ src: string }>
      className={className ? `hero-frame ${className}` : 'hero-frame'}
      load={loadVueHeroFrame}
      props={props}
      poster={<HeroPoster />}
    />
  );
}
