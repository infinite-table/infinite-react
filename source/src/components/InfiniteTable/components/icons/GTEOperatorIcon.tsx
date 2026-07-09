import { Icon, TableIconProps } from './Icon';
import * as React from 'react';
import { iconPaths } from './iconPaths';

export const GTEOperatorIcon = (props: Omit<TableIconProps, 'children'>) => {
  return (
    <Icon {...props}>
      <path d={iconPaths.gteOperator[0]} />
    </Icon>
  );
};
