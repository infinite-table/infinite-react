import { Icon, TableIconProps } from './Icon';
import * as React from 'react';
import { iconPaths } from './iconPaths';

export const GTOperatorIcon = (props: Omit<TableIconProps, 'children'>) => {
  return (
    <Icon {...props} icon="filterOperatorGt">
      <path d={iconPaths.gtOperator[0]} />
    </Icon>
  );
};
