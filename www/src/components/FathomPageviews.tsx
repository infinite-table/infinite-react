'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// the analytics types for window.fathom
import '@www/components/PricingPage/analytics';

/**
 * Sends a Fathom pageview for the first page and for every client-side
 * navigation. Fathom's automatic tracking only counts the landing page with
 * the App Router, so the script tag (id "fathom-script", in app/layout.tsx) has
 * data-auto="false" and this does it.
 */
export function FathomPageviews() {
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

  return null;
}
