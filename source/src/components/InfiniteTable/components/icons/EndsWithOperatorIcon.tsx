import { Icon, TableIconProps } from './Icon';
import * as React from 'react';
import { iconPaths } from './iconPaths';

export const EndsWithOperatorIcon = (
  props: Omit<TableIconProps, 'children'>,
) => {
  return (
    <Icon {...props} icon="filterOperatorEndsWith">
      <path d={iconPaths.endsWithOperator[0]} />
    </Icon>
  );
};
