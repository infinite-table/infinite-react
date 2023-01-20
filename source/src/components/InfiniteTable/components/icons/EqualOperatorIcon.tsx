import { Icon, TableIconProps } from './Icon';
import * as React from 'react';

export const EqualOperatorIcon = (props: Omit<TableIconProps, 'children'>) => {
  return (
    <Icon {...props}>
      <path d="M19,10H5V8H19V10M19,16H5V14H19V16Z" />
    </Icon>
  );
};
