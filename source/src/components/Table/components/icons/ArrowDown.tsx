import * as React from 'react';

import { TableIconProps, Icon } from './Icon';

export const ArrowDown = (props: Omit<TableIconProps, 'children'>) => {
  return (
    <Icon {...props}>
      <path
        fill="currentColor"
        d="M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z"
      />
    </Icon>
  );
};
