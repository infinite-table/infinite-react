import { Icon, TableIconProps } from './Icon';
import * as React from 'react';
import { iconPaths } from './iconPaths';

export const DoneIcon = (props: Omit<TableIconProps, 'children'>) => {
  return (
    <Icon {...props}>
      <path d={iconPaths.done[0]} />
    </Icon>
  );
};
