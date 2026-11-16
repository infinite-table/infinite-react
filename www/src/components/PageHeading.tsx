'use client';
import { H1 } from './MDX/Heading';

interface PageHeadingProps {
  title: string;
  status?: string;
  description?: string;
  since?: string;
}

function PageHeading({ title, status, description, since }: PageHeadingProps) {
  return (
    <div className="docs-title">
      <H1 className="docs-title__h1">
        {title}
        {status ? <em>—{status}</em> : ''}
      </H1>

      {since && <span className="docs-since">Since version {since}</span>}

      {description && <p className="docs-title__lead">{description}</p>}
    </div>
  );
}

export default PageHeading;
