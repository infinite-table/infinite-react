import * as React from 'react';

import { join } from '../../../../utils/join';
import { ThemeVars } from '../../theme.css';

import { HeaderMenuIconCls } from '../InfiniteTableHeader/header.css';
import { InfiniteTableIconClassName } from './InfiniteTableIconClassName';

type MenuIconProps = {
  lineWidth?: number;
  lineStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  className?: string;
  domProps?: React.HTMLAttributes<HTMLDivElement>;
  reserveSpaceWhenHidden?: boolean;
};

const defaultLineStyle: React.CSSProperties = {
  width: '100%',
  pointerEvents: 'none',
};

const lineClassName = `${InfiniteTableIconClassName}-menu`;

export function MenuIcon(props: MenuIconProps) {
  const { style, className, domProps, reserveSpaceWhenHidden } = props;

  const lineStyle = {
    ...defaultLineStyle,
    borderTop: `${ThemeVars.components.HeaderCell.menuIconLineWidth} solid currentColor`,
    ...props.lineStyle,
  };

  return (
    <div
      {...domProps}
      style={style}
      data-name="menu-icon"
      onPointerDown={(e) => e.stopPropagation()}
      className={join(
        className,
        HeaderMenuIconCls({
          reserveSpaceWhenHidden,
        }),
        InfiniteTableIconClassName,
        `${InfiniteTableIconClassName}-menu`,
      )}
    >
      <div className={lineClassName} style={lineStyle}></div>
      <div className={lineClassName} style={lineStyle}></div>
      <div className={lineClassName} style={lineStyle}></div>
    </div>
  );
}
