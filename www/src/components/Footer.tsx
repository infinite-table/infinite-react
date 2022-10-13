import * as React from 'react';

import {
  display,
  centeredFlexColumn,
  shadow,
  alignSelf,
} from '../styles/utils.css';

import { footer, width100 } from './components.css';

export const Footer = (props: React.HTMLProps<HTMLDivElement>) => {
  return (
    <footer
      className={`${footer} ${alignSelf.flexEnd} ${width100} ${display.flex} ${centeredFlexColumn} ${shadow.lg} 'bg-wash dark:bg-wash-dark text-primary dark:text-primary-dark`}
    >
      Copyright © {new Date().getFullYear()} Infinite Table
      {props.children}
    </footer>
  );
};
