import * as React from 'react';

export const IconCode = React.memo<React.JSX.IntrinsicElements['svg']>(
  function IconCode({ className }) {
    return (
      <svg
        className={className}
        fill="currentColor"
        height="20"
        width="20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M13.354 14.979 12.104 13.75 15.854 10 12.104 6.229 13.333 5 18.333 10ZM6.667 15 1.688 10 6.667 5.021 7.896 6.25 4.146 10 7.917 13.75Z" />
      </svg>
    );
  },
);

IconCode.displayName = 'IconCode';
