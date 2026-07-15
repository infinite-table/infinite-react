import { Icon, TableIconProps } from './Icon';
import * as React from 'react';
import { iconPaths } from './iconPaths';

export const IncludesOperatorIcon = (
  props: Omit<TableIconProps, 'children'>,
) => {
  return (
    <Icon {...props}>
      {iconPaths.includesOperator.map((d) => (
        <path key={d} d={d} />
      ))}
    </Icon>
  );
};
