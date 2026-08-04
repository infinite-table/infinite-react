import * as React from 'react';

import { join } from '../../../../utils/join';
import { ThemeVars } from '../../vars.css';

import { HeaderMenuIconCls } from '../InfiniteTableHeader/header.css';
import { InfiniteIconClassName } from './InfiniteIconClassName';
import {
  MenuIconDataAttributes,
  MenuIconDataAttributesValues,
} from './menuIconAttributes';

export { MenuIconDataAttributes, MenuIconDataAttributesValues };

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

const lineClassName = `${InfiniteIconClassName}-menu`;

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
        InfiniteIconClassName,
        `${InfiniteIconClassName}-menu`,
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
