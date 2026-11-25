'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// the analytics types for window.fathom
import '@www/components/PricingPage/analytics';
import { docsFrameworks } from '@www/utils/docsFrameworks';

export function trackFathomEvent(name: string) {
  window.fathom?.trackEvent?.(name);
}

/**
 * The Fathom event for a click on this link, if it's one we follow:
 * GitHub (per repository), npm, and the "Get started" docs page.
 */
function eventForLink(link: HTMLAnchorElement): string | null {
  let url: URL;
  try {
    url = new URL(link.href, window.location.href);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, '');
  if (host === 'github.com') {
    const repo = url.pathname.split('/').filter(Boolean).slice(0, 2).join('/');
    return repo ? `GitHub: ${repo}` : 'GitHub';
  }
  if (host === 'npmjs.com') {
    return 'npm';
  }
  if (
    url.origin === window.location.origin &&
    // of any framework: /docs/learn/getting-started, /vue/docs/...
    docsFrameworks.neutralPath(url.pathname) === '/docs/learn/getting-started'
  ) {
    return 'Get started';
  }
  return null;
}

/**
 * Sends a Fathom pageview for the first page and for every client-side
 * navigation. Fathom's automatic tracking only counts the landing page with
 * the App Router, so the script tag (id "fathom-script", in app/layout.tsx) has
 * data-auto="false" and this does it. Also sends an event for clicks on the
 * links eventForLink follows.
 */
export function FathomTracking() {
  const pathname = usePathname();

  useEffect(() => {
    const track = () => window.fathom?.trackPageview?.();

    if (window.fathom) {
      track();
      return;
    }
    // the script is deferred, so on the first page it may not have run yet
    const script = document.getElementById('fathom-script');
    script?.addEventListener('load', track, { once: true });
    return () => script?.removeEventListener('load', track);
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.type === 'auxclick' && event.button !== 1) {
        return;
      }
      const link = (event.target as Element | null)?.closest?.('a[href]');
      const name = link ? eventForLink(link as HTMLAnchorElement) : null;
      if (name) {
        trackFathomEvent(name);
      }
    };
    document.addEventListener('click', onClick, true);
    // a middle click opens the link in a new tab
    document.addEventListener('auxclick', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('auxclick', onClick, true);
    };
  }, []);

  return null;
}
