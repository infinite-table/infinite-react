import * as React from 'react';

import { TableIconProps, Icon } from './Icon';

export const ArrowUp = (props: Omit<TableIconProps, 'children'>) => {
  return (
    <Icon {...props}>
      <path
        fill="currentColor"
        d="M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z"
      />
    </Icon>
  );
};
