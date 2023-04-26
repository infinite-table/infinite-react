'use client';
import styles from './components.module.css';

import { H1 } from './MDX/Heading';

interface PageHeadingProps {
  title: string;
  status?: string;
  description?: string;
}

function PageHeading({ title, status, description }: PageHeadingProps) {
  return (
    <div className="max-w-7xl ml-0 2xl:mx-auto">
      <H1
        className={`inline-block mt-0 -mx-.5 ${styles.HighlightBrandToLightBackground}`}
      >
        {title}
        {status ? <em>—{status}</em> : ''}
      </H1>
      {description && (
        <p className="mt-4 mb-6  text-xl text-content-color leading-large">
          {description}
        </p>
      )}
    </div>
  );
}

export default PageHeading;
