import * as React from 'react';
import { useEffect, useState } from 'react';

import { appPathname, withBasePath } from './frameworkLinkShared';

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
 * The "back" link of the bottom right bar (PageDevChrome): to the folder of
 * the page. Hidden under automation (Playwright), so it never interferes
 * with the tests.
 */
export const BackLink: React.FC<{ embedded?: boolean }> = () => {
  const [parentHref, setParentHref] = useState<string | null>(null);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && (navigator as any).webdriver) {
      return;
    }
    // the parent folder in the app, with the /react base path of dev
    const parent = computeParentHref(appPathname());
    setParentHref(parent === null ? null : withBasePath(parent));
  }, []);

  if (!parentHref) {
    return null;
  }

  return (
    <a
      href={parentHref}
      data-testid="infinite-page-back-link"
      title={`Back to ${parentHref}`}
      aria-label={`Back to ${parentHref}`}
      className="ex-chrome-item ex-chrome-icon"
    >
      ←
    </a>
  );
};
