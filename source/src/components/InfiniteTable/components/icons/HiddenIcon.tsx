import { Icon, TableIconProps } from './Icon';
import * as React from 'react';
import { iconPaths } from './iconPaths';

export const HiddenIcon = (props: Omit<TableIconProps, 'children'>) => {
  return (
    <Icon {...props} viewBox="0 -960 960 960">
      <path d={iconPaths.hidden[0]} />
    </Icon>
  );
};
