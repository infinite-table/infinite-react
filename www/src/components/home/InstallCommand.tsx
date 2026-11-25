'use client';

import * as React from 'react';

import { trackFathomEvent } from '@www/components/FathomTracking';
import {
  docsFrameworks,
  DOCS_FRAMEWORK_PACKAGE,
  type DocsFrameworkId,
} from '@www/utils/docsFrameworks';

/** `$ npm i …` with a copy button. */
export function InstallCommand({
  framework = docsFrameworks.default,
}: {
  framework?: DocsFrameworkId;
}) {
  const command = `npm i ${DOCS_FRAMEWORK_PACKAGE[framework]}`;
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <div className="home-install">
      <code className="home-install__cmd">{command}</code>
      <button
        type="button"
        aria-label="Copy the install command"
        onClick={() => {
          navigator.clipboard?.writeText(command).catch(() => {});
          trackFathomEvent(`Copy install: ${framework}`);
          setCopied(true);
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
