import { Icon, TableIconProps } from './Icon';
import * as React from 'react';

export const DoneIcon = (props: Omit<TableIconProps, 'children'>) => {
  return (
    <Icon {...props}>
      <path d="m9.55 19-6.725-6.725L5.25 9.85l4.3 4.325 9.225-9.225 2.425 2.4Z" />
    </Icon>
  );
};
