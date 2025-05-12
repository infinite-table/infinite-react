import cn from 'classnames';
import * as React from 'react';

export const IconArrow = React.memo<
  React.JSX.IntrinsicElements['svg'] & {
    displayDirection: 'left' | 'right' | 'up' | 'down';
  }
>(function IconArrow({ displayDirection, className, ...rest }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1.33em"
      height="1.33em"
      fill="currentColor"
      {...rest}
      className={cn(className, {
        'transform rotate-180': displayDirection === 'right',
      })}
    >
      <path fill="none" d="M0 0h24v24H0z" />
      <path d="M7.828 11H20v2H7.828l5.364 5.364-1.414 1.414L4 12l7.778-7.778 1.414 1.414z" />
    </svg>
  );
});

IconArrow.displayName = 'IconArrow';
