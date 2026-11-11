import * as React from 'react';

import { join } from '../../../../utils/join';
import { IconCustomMaskCls } from './Icon.css';
import { CUSTOMIZABLE_ICONS, CustomizableIconName } from './customizableIcons';
import { InfiniteIconClassName } from './InfiniteIconClassName';

export type TableIconProps = {
  children: React.ReactNode;
  size?: number;
  style?: React.CSSProperties;
  className?: string;
  viewBox?: string;
  /**
   * When specified, the icon can be replaced via the corresponding
   * `--infinite-icon-*` CSS variable - see Icon.css.ts
   */
  icon?: CustomizableIconName;
};

export const Icon = (props: TableIconProps) => {
  const { icon, ...svgProps } = props;
  const size = props.size ?? `var(--infinite-icon-size)`;
  const style = {
    flex: 'none',
    width: size,
    height: size,
    fill: 'currentColor',
    ...props.style,
  };
  return (
    //@ts-ignore
    <svg
      viewBox="0 0 24 24"
      {...svgProps}
      className={
        icon
          ? join(
              props.className,
              IconCustomMaskCls[icon],
              InfiniteIconClassName,
              `${InfiniteIconClassName}-${CUSTOMIZABLE_ICONS[icon]}`,
            )
          : props.className
      }
      style={style}
    >
      {props.children}
    </svg>
  );
};
