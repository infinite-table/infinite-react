/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */

import cn from 'classnames';
import * as React from 'react';

export const IconReadMore = React.memo<React.JSX.IntrinsicElements['svg']>(
  function IconHint({ className }) {
    return (
      <svg
        className={cn('inline -mt-0.5', className)}
        height="24px"
        width="24px"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <g>
          <rect fill="none" height="24" width="24" />
        </g>
        <g>
          <g>
            <rect height="2" width="9" x="13" y="7" />
            <rect height="2" width="9" x="13" y="15" />
            <rect height="2" width="6" x="16" y="11" />
            <polygon points="13,12 8,7 8,11 2,11 2,13 8,13 8,17" />
          </g>
        </g>
      </svg>
    );
  },
);

IconReadMore.displayName = 'IconReadMore';
