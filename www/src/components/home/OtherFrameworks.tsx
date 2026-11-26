import Link from 'next/link';
import * as React from 'react';

import {
  DOCS_FRAMEWORK_IDS,
  docsFramework,
  type DocsFrameworkId,
} from '@www/utils/docsFrameworksRegistry';

import { FrameworkLogo } from './FrameworkLogo';

/**
 * Under the hero of a home page, a key for each of the other frameworks
 * (www/frameworks.json): "Also for  [● Vue →]  [● Angular →]".
 */
export function OtherFrameworks(props: { current: DocsFrameworkId }) {
  return (
    <nav className="home-frameworks" aria-label="Other frameworks">
      <span className="home-label">Also for</span>
      {DOCS_FRAMEWORK_IDS.filter((id) => id !== props.current).map((id) => {
        const { label, home } = docsFramework(id);
        return (
          <Link
            key={id}
            className={`home-framework home-framework--${id}`}
            href={home}
          >
            <FrameworkLogo framework={id} />
            {label} <span aria-hidden="true">→</span>
          </Link>
        );
      })}
    </nav>
  );
}
