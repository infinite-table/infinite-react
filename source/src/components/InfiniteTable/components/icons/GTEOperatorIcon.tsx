import { Icon, TableIconProps } from './Icon';
import * as React from 'react';

export const GTEOperatorIcon = (props: Omit<TableIconProps, 'children'>) => {
  return (
    <Icon {...props}>
      <path d="M6.5,2.27L20,10.14L6.5,18L5.5,16.27L16.03,10.14L5.5,4L6.5,2.27M20,20V22H5V20H20Z" />
    </Icon>
  );
};
