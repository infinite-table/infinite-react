import * as React from 'react';
import { useEffect, useState } from 'react';

const computeParentHref = (pathname: string): string | null => {
  if (!pathname || pathname === '/') {
    return null;
  }
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) {
    return null;
  }
  parts.pop();
  return parts.length === 0 ? '/' : `/${parts.join('/')}`;
};

/**
 * Tiny floating "back" link rendered on every test page (except the root).
 *
 * It infers the parent folder from `window.location.pathname`, so it works
 * for any test page without per-page setup. It is hidden in automated
 * environments (e.g. Playwright) so it never interferes with tests, and is
 * positioned in the bottom-right corner with a low z-index footprint.
 */
export const BackLink: React.FC = () => {
  const [parentHref, setParentHref] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (typeof navigator !== 'undefined' && (navigator as any).webdriver) {
      // running under automation (Playwright, Selenium, ...) — stay invisible
      return;
    }
    setParentHref(computeParentHref(window.location.pathname));
  }, []);

  if (!parentHref) {
    return null;
  }

  return (
    <a
      href={parentHref}
      data-testid="infinite-page-back-link"
      title={`Back to ${parentHref}`}
      style={{
        position: 'fixed',
        bottom: 6,
        right: 6,
        zIndex: 10000,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
        borderRadius: 12,
        background: 'rgba(0, 0, 0, 0.55)',
        color: '#fff',
        fontSize: 14,
        lineHeight: 1,
        textDecoration: 'none',
        opacity: 0.4,
        transition: 'opacity 120ms ease-in-out',
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.opacity = '1';
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.opacity = '0.4';
      }}
    >
      ←
    </a>
  );
};
