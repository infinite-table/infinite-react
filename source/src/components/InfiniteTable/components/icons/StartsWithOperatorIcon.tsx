import { Icon, TableIconProps } from './Icon';
import * as React from 'react';
import { iconPaths } from './iconPaths';

export const StartsWithOperatorIcon = (
  props: Omit<TableIconProps, 'children'>,
) => {
  return (
    <Icon {...props}>
      <path d={iconPaths.startsWithOperator[0]} />
    </Icon>
  );
};
