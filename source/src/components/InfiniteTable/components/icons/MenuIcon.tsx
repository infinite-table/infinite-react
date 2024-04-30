import * as React from 'react';
import { keyMirror } from '../../../../utils/keyMirror';

import { join } from '../../../../utils/join';
import { ThemeVars } from '../../vars.css';

import { HeaderMenuIconCls } from '../InfiniteTableHeader/header.css';
import { InfiniteTableIconClassName } from './InfiniteTableIconClassName';

export type MenuIconProps = {
  lineWidth?: number;
  lineStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  className?: string;
  domProps?: React.HTMLAttributes<HTMLDivElement>;
  reserveSpaceWhenHidden?: boolean;
  menuVisible?: boolean;
  children?: React.ReactNode;
};

const defaultLineStyle: React.CSSProperties = {
  width: '100%',
  pointerEvents: 'none',
};

const lineClassName = `${InfiniteTableIconClassName}-menu`;

export const MenuIconDataAttributes = keyMirror({
  'data-name': '',
});

export const MenuIconDataAttributesValues: {
  [K in keyof typeof MenuIconDataAttributes]: string;
} = {
  [MenuIconDataAttributes['data-name']]: 'menu-icon',
};

export function MenuIcon(props: MenuIconProps) {
  const {
    style,
    className,
    domProps,
    reserveSpaceWhenHidden,
    menuVisible,
    children,
  } = props;

  const lineStyle = {
    ...defaultLineStyle,
    borderTop: `${ThemeVars.components.HeaderCell.menuIconLineWidth} solid currentColor`,
    ...props.lineStyle,
  };

  return (
    <div
      {...domProps}
      style={style}
      {...MenuIconDataAttributesValues}
      onPointerDown={(e) => e.stopPropagation()}
      className={join(
        className,
        HeaderMenuIconCls({
          menuVisible,
          reserveSpaceWhenHidden,
        }),
        InfiniteTableIconClassName,
        `${InfiniteTableIconClassName}-menu`,
      )}
    >
      {children ?? (
        <>
          <div className={lineClassName} style={lineStyle}></div>
          <div className={lineClassName} style={lineStyle}></div>
          <div className={lineClassName} style={lineStyle}></div>
        </>
      )}
    </div>
  );
}
