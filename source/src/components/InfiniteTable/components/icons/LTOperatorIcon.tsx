import { Icon, TableIconProps } from './Icon';
import * as React from 'react';

export const LTOperatorIcon = (props: Omit<TableIconProps, 'children'>) => {
  return (
    <Icon {...props}>
      <path d="M18.5,4.14L19.5,5.86L8.97,12L19.5,18.14L18.5,19.86L5,12L18.5,4.14Z" />
    </Icon>
  );
};
