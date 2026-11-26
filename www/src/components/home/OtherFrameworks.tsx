import Link from 'next/link';
import * as React from 'react';

import {
  DOCS_FRAMEWORK_IDS,
  docsFramework,
  type DocsFrameworkId,
} from '@www/utils/docsFrameworksRegistry';

/**
 * Under the hero of a home page, a line for each of the other frameworks
 * (www/frameworks.json): "Using Vue? Infinite Table for Vue →".
 */
export function OtherFrameworks(props: { current: DocsFrameworkId }) {
  return (
    <div className="home-hero__others">
      {DOCS_FRAMEWORK_IDS.filter((id) => id !== props.current).map((id) => {
        const { label, home } = docsFramework(id);
        return (
          <p key={id}>
            {`Using ${label}? `}
            <Link href={home}>{`Infinite Table for ${label} →`}</Link>
          </p>
        );
      })}
    </div>
  );
}
