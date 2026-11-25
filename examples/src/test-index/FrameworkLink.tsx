import * as React from 'react';
import { useEffect, useState } from 'react';

import {
  buildFrameworkSiblingHref,
  EXAMPLES_FRAMEWORKS,
  type ExamplesFramework,
  FRAMEWORK_LABELS,
  hasFrameworkSibling,
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

const linkStyle: React.CSSProperties = {
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
};

/**
 * Links to the same test page in the other framework apps (React, Vue,
 * Angular), one for each sibling `.page.tsx` / `.page.vue` /
 * `.page.angular.ts` that exists.
 */
export const FrameworkLink: React.FC<FrameworkLinkProps> = ({
  current,
  embedded = false,
}) => {
  const [targets, setTargets] = useState<ExamplesFramework[]>([]);

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
        setTargets(
          EXAMPLES_FRAMEWORKS.filter(
            (framework) =>
              framework !== current && hasFrameworkSibling(data, framework),
          ),
        );
      })
      .catch(() => {});
  }, [current]);

  if (!targets.length) {
    return null;
  }

  const pathname = window.location.pathname;
  const links = targets.map((target) => (
    <a
      key={target}
      href={buildFrameworkSiblingHref(pathname, target)}
      data-testid="infinite-page-framework-link"
      title={`Open this page in the ${FRAMEWORK_LABELS[target]} examples app`}
      style={linkStyle}
      onMouseEnter={(event) => {
        event.currentTarget.style.opacity = '1';
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.opacity = '0.9';
      }}
    >
      See {FRAMEWORK_LABELS[target]}
    </a>
  ));

  if (embedded) {
    return <>{links}</>;
  }

  return (
    <span
      style={{
        position: 'fixed',
        bottom: 6,
        right: 132,
        zIndex: 10000,
        display: 'inline-flex',
        gap: 6,
      }}
    >
      {links}
    </span>
  );
};
