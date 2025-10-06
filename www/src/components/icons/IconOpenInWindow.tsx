import cn from 'classnames';
import * as React from 'react';

export const IconOpenInWindow = React.memo<JSX.IntrinsicElements['svg']>(
  function IconOpenInWindow({ className, ...rest }) {
    const classes = cn(className);
    return (
      <svg
        width="1em"
        height="1em"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={classes}
        {...rest}
      >
        <path
          d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"
          fill="currentColor"
        ></path>
      </svg>
    );
  },
);

IconOpenInWindow.displayName = 'IconOpenInWindow';
