'use client';

import * as React from 'react';

import { trackFathomEvent } from '@www/components/FathomTracking';

const PACKAGES = {
  react: '@infinite-table/infinite-react',
  vue: '@infinite-table/infinite-vue',
};

/** `$ npm i …` with a copy button. */
export function InstallCommand({
  framework = 'react',
}: {
  framework?: keyof typeof PACKAGES;
}) {
  const command = `npm i ${PACKAGES[framework]}`;
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
