import Breadcrumbs from '@www/components/Breadcrumbs';
import Tag from '@www/components/Tag';
import * as React from 'react';
import { HighlightBrandToLightBackground } from './components.css';

import { RouteTag } from './Layout/useRouteMeta';
import { H1 } from './MDX/Heading';

interface PageHeadingProps {
  title: string;
  status?: string;
  description?: string;
  tags?: RouteTag[];
}

function PageHeading({
  title,
  status,
  description,
  tags = [],
}: PageHeadingProps) {
  return (
    <div className="px-4 sm:px-12 pt-7">
      <div className="max-w-7xl ml-0 2xl:mx-auto">
        {tags ? <Breadcrumbs /> : null}
        <H1
          className={`inline-block mt-0 -mx-.5 ${HighlightBrandToLightBackground}`}
        >
          {title}
          {status ? <em>—{status}</em> : ''}
        </H1>
        {description && (
          <p className="mt-4 mb-6  text-xl text-content-color leading-large">
            {description}
          </p>
        )}
        {tags?.length > 0 && (
          <div className="mt-4">
            {tags.map((tag) => (
              <Tag key={tag} variant={tag as RouteTag} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageHeading;
