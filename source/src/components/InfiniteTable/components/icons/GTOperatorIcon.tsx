import { Icon, TableIconProps } from './Icon';
import * as React from 'react';

export const GTOperatorIcon = (props: Omit<TableIconProps, 'children'>) => {
  return (
    <Icon {...props}>
      <path d="M5.5,4.14L4.5,5.86L15,12L4.5,18.14L5.5,19.86L19,12L5.5,4.14Z" />
    </Icon>
  );
};
