import { Icon, TableIconProps } from './Icon';
import * as React from 'react';

export const EndsWithOperatorIcon = (
  props: Omit<TableIconProps, 'children'>,
) => {
  return (
    <Icon {...props}>
      <path d="M11.14 4L6.43 16H8.36L9.32 13.43H14.67L15.64 16H17.57L12.86 4M12 6.29L14.03 11.71H9.96M20 14V18H2V20H22V14Z" />
    </Icon>
  );
};
