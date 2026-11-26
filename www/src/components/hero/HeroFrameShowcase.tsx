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

type HeroFrameProps = {
  /** The page of the hero demo (content/home/vue-hero.demo.vue, angular-hero.demo.angular.ts). */
  src: string;
  /** The iframe's title. */
  title: string;
};

/**
 * The Vue and Angular heroes are apps of frameworks the site doesn't bundle,
 * so each runs in its own page: the one the docs-kit build of its framework
 * makes of content/home/<framework>-hero.demo.*. This is its iframe. It opens
 * in the site's light / dark mode and is told when the mode changes; the hero
 * posts `hero-live` once its first rows have painted.
 */
function HeroFrame({
  src,
  title,
  onReady,
}: LazyShowcaseLoadedProps & HeroFrameProps) {
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
      title={title}
    />
  );
}

const loadHeroFrame = async () => ({ default: HeroFrame });

/**
 * The hero of the Vue or the Angular home page: the same frame and poster as
 * the React one (HeroShowcase), with the hero demo's page loaded in an iframe
 * when the frame nears the viewport and the browser is idle.
 */
export function HeroFrameShowcase({
  src,
  title,
  className,
}: HeroFrameProps & {
  /** Extra frame classes, e.g. `hero-frame--page`. */
  className?: string;
}) {
  const props = React.useMemo(() => ({ src, title }), [src, title]);
  return (
    <LazyShowcase<HeroFrameProps>
      className={className ? `hero-frame ${className}` : 'hero-frame'}
      load={loadHeroFrame}
      props={props}
      poster={<HeroPoster />}
    />
  );
}
