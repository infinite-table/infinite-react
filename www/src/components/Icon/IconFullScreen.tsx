import cn from 'classnames';
import * as React from 'react';

export const IconFullScreen = React.memo<React.JSX.IntrinsicElements['svg']>(
  function IconFullScreen({ className, ...rest }) {
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
          d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
          fill="currentColor"
        ></path>
      </svg>
    );
  },
);

IconFullScreen.displayName = 'IconFullScreen';
