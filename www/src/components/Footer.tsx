import * as React from 'react';

import {
  display,
  centeredFlexColumn,
  shadow,
  alignSelf,
} from '../styles/www-utils.css';

import { footer, width100 } from './components.css';
import { OverlineCls } from './Header.css';

export const Footer = (props: React.HTMLProps<HTMLDivElement>) => {
  return (
    <footer
      className={`${footer} ${alignSelf.flexEnd} w-full flex flex-col items-center ${shadow.lg} 'bg-black text-content-color ${OverlineCls} relative `}
    >
      Copyright © {new Date().getFullYear()} Infinite Table
      {props.children}
    </footer>
  );
};
