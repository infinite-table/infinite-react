import { Icon, TableIconProps } from './Icon';
import * as React from 'react';
import { iconPaths } from './iconPaths';

export const LTEOperatorIcon = (props: Omit<TableIconProps, 'children'>) => {
  return (
    <Icon {...props} icon="filterOperatorLte">
      <path d={iconPaths.lteOperator[0]} />
    </Icon>
  );
};
