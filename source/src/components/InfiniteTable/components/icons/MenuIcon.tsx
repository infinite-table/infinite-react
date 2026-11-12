import * as React from 'react';

import { join } from '../../../../utils/join';
import { ThemeVars } from '../../vars.css';

import { HeaderMenuIconCls } from '../InfiniteTableHeader/header.css';
import { InfiniteIconClassName } from './InfiniteIconClassName';
import { MenuIconLineCls, MenuIconWithDefaultLinesCls } from './MenuIcon.css';
import {
  MenuIconDataAttributes,
  MenuIconDataAttributesValues,
} from './menuIconAttributes';

export { MenuIconDataAttributes, MenuIconDataAttributesValues };

import type { MenuIconProps } from './MenuIconTypes';

export type { MenuIconProps };

const defaultLineStyle: React.CSSProperties = {
  width: '100%',
  pointerEvents: 'none',
};

const lineClassName = join(`${InfiniteIconClassName}-menu`, MenuIconLineCls);

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
        children == null ? MenuIconWithDefaultLinesCls : '',
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
