import Link from 'next/link';

import {
  docsFrameworks,
  DOCS_FRAMEWORK_HOME,
  type DocsFrameworkId,
} from '@www/utils/docsFrameworks';

/**
 * Under the hero text of a framework's home page: Infinite Table also exists
 * for the other framework, with a link to its home page (`/` or `/vue`).
 */
export function OtherFrameworkNote(props: {
  /** The framework the note points to. */
  framework: DocsFrameworkId;
  className?: string;
}) {
  const label = docsFrameworks.label(props.framework);
  return (
    <p className={`text-xl text-content-color ${props.className ?? ''}`}>
      A{' '}
      <Link
        href={DOCS_FRAMEWORK_HOME[props.framework]}
        className="text-glow font-bold underline underline-offset-4 hover:opacity-80"
      >
        {label}
      </Link>{' '}
      version is also available &rarr;
    </p>
  );
}
