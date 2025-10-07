import * as React from 'react';

import { IconCode } from './IconCode';
import { IconPreview } from './IconPreview';

export const IconCodeAndPreview = React.memo<
  React.JSX.IntrinsicElements['svg']
>(function IconCodeAndPreview({}) {
  return (
    <div className="flex flex-row items-center">
      <IconCode /> <div className="inline-block px-1">+</div>
      <IconPreview />
    </div>
  );
});

IconCodeAndPreview.displayName = 'IconCodeAndPreview';
