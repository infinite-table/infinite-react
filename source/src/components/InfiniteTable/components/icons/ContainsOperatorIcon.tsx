import { Icon, TableIconProps } from './Icon';
import * as React from 'react';

export const ContainsOperatorIcon = (
  props: Omit<TableIconProps, 'children'>,
) => {
  return (
    <Icon {...props}>
      <path d="M5,4V7H10.5V19H13.5V7H19V4H5Z" />
    </Icon>
  );
};
