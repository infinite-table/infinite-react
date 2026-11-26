import * as React from 'react';
import { useEffect, useState } from 'react';

import {
  appPathname,
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

/**
 * Links to the same test page in the other framework apps (React, Vue,
 * Angular), one for each sibling `.page.tsx` / `.page.vue` /
 * `.page.angular.ts` that exists.
 */
export const FrameworkLink: React.FC<FrameworkLinkProps> = ({ current }) => {
  const [targets, setTargets] = useState<ExamplesFramework[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || isAutomationEnvironment()) {
      return;
    }

    // the page's path in its app (without the /react base path of dev)
    const pathname = appPathname();
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

  const pathname = appPathname();
  const links = targets.map((target) => (
    <a
      key={target}
      href={buildFrameworkSiblingHref(pathname, target)}
      data-testid="infinite-page-framework-link"
      title={`Open this page in the ${FRAMEWORK_LABELS[target]} examples app`}
      className="ex-chrome-item ex-chrome-link"
    >
      See {FRAMEWORK_LABELS[target]}
    </a>
  ));

  // items of the bar's own row (PageDevChrome)
  return <>{links}</>;
};
