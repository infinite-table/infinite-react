import * as React from 'react';
import { useEffect, useState } from 'react';

import {
  buildFrameworkSiblingHref,
  type ExamplesFramework,
  isAutomationEnvironment,
} from './frameworkLinkShared';

const TEST_RUNNER_PORT =
  (typeof process !== 'undefined' &&
    (process.env as any).NEXT_PUBLIC_TEST_RUNNER_PORT) ||
  5599;

const testRunnerBaseUrl = () =>
  `${window.location.protocol}//${window.location.hostname}:${TEST_RUNNER_PORT}`;

type FrameworkLinkProps = {
  current: ExamplesFramework;
  embedded?: boolean;
};

/**
 * Link to the same test page in the other framework app (React ↔ Vue),
 * shown only when a sibling `.page.tsx` / `.page.vue` exists.
 */
export const FrameworkLink: React.FC<FrameworkLinkProps> = ({
  current,
  embedded = false,
}) => {
  const [href, setHref] = useState<string | null>(null);
  const target = current === 'react' ? 'vue' : 'react';
  const label = target === 'vue' ? 'See Vue' : 'See React';

  useEffect(() => {
    if (typeof window === 'undefined' || isAutomationEnvironment()) {
      return;
    }

    const pathname = window.location.pathname;
    fetch(
      `${testRunnerBaseUrl()}/check?pathname=${encodeURIComponent(pathname)}`,
    )
      .then((response) => response.json())
      .then((data) => {
        const hasSibling =
          target === 'vue' ? !!data?.hasVuePage : !!data?.hasReactPage;
        if (hasSibling) {
          setHref(buildFrameworkSiblingHref(pathname, target));
        }
      })
      .catch(() => {});
  }, [target]);

  if (!href) {
    return null;
  }

  return (
    <a
      href={href}
      data-testid="infinite-page-framework-link"
      title={`Open this page in the ${target === 'vue' ? 'Vue' : 'React'} examples app`}
      style={{
        ...(embedded
          ? {}
          : {
              position: 'fixed',
              bottom: 6,
              right: 132,
              zIndex: 10000,
            }),
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        fontSize: 12,
        lineHeight: 1.2,
        borderRadius: 4,
        border: '1px solid rgba(0, 0, 0, 0.2)',
        background: 'rgba(0, 0, 0, 0.55)',
        color: '#fff',
        textDecoration: 'none',
        opacity: 0.9,
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.opacity = '1';
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.opacity = '0.9';
      }}
    >
      {label}
    </a>
  );
};
