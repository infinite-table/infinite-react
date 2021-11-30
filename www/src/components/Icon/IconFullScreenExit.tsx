import * as React from 'react';
import cn from 'classnames';

export const IconFullScreenExit = React.memo<
  JSX.IntrinsicElements['svg']
>(function IconFullScreenExit({ className, ...rest }) {
  const classes = cn(className);
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={classes}
      {...rest}>
      <path
        d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"
        fill="currentColor"></path>
    </svg>
  );
});

IconFullScreenExit.displayName = 'IconFullScreenExit';
