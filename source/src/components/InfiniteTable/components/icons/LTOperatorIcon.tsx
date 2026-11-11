import { Icon, TableIconProps } from './Icon';
import * as React from 'react';
import { iconPaths } from './iconPaths';

export const LTOperatorIcon = (props: Omit<TableIconProps, 'children'>) => {
  return (
    <Icon {...props} icon="filterOperatorLt">
      <path d={iconPaths.ltOperator[0]} />
    </Icon>
  );
};
