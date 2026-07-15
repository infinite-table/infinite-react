import { Icon, TableIconProps } from './Icon';
import * as React from 'react';
import { iconPaths } from './iconPaths';

export const NotEqualOperatorIcon = (
  props: Omit<TableIconProps, 'children'>,
) => {
  return (
    <Icon {...props}>
      <path d={iconPaths.neqOperator[0]} />
    </Icon>
  );
};
