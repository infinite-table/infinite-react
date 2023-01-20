import { Icon, TableIconProps } from './Icon';
import * as React from 'react';

export const NotEqualOperatorIcon = (
  props: Omit<TableIconProps, 'children'>,
) => {
  return (
    <Icon {...props}>
      <path d="M21,10H9V8H21V10M21,16H9V14H21V16M4,5H6V16H4V5M6,18V20H4V18H6Z" />
    </Icon>
  );
};
