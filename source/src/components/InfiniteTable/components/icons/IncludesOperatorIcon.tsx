import { Icon, TableIconProps } from './Icon';
import * as React from 'react';

export const IncludesOperatorIcon = (
  props: Omit<TableIconProps, 'children'>,
) => {
  return (
    <Icon {...props}>
      <path d="M11.14 4L6.43 16H8.36L9.32 13.43H14.67L15.64 16H17.57L12.86 4H11.14M12 6.29L14.03 11.71H9.96L12 6.29" />
      <path d="M4 18V15H2V20H22V18Z" />
      <path d="M20 14V18H2V20H22V14Z" />
    </Icon>
  );
};
