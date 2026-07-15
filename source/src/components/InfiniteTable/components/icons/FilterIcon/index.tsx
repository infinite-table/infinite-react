import * as React from 'react';
import { useEffect, useLayoutEffect, useState } from 'react';

import { join } from '../../../../../utils/join';
import { HeaderFilterIconIndexCls } from '../../InfiniteTableHeader/header.css';
import { InfiniteIconClassName } from '../InfiniteIconClassName';
import { FilterIconCls } from './FilterIcon.css';
import { defaultLineStyle } from './shared';
import type { FilterIconProps } from './shared';

export function FilterIcon(props: FilterIconProps<React.CSSProperties>) {
  const [rendered, setRendered] = useState(true);
  const [opacity, setOpacity] = useState(0);

  const { lineWidth = 1, style, className, index } = props;

  const showIndex = index != null && index > 0;

  const size = props.size ?? 16;
  const part = Math.floor(size / 4);
  const sizes = [size - 1 * part, size - 2 * part, size - 3 * part];

  const lineStyle = {
    ...(defaultLineStyle as React.CSSProperties),
    borderTop: `${lineWidth}px solid currentColor`,
    ...props.lineStyle,
    opacity,
  };

  useEffect(() => {
    if (!rendered) {
      return;
    }
    const rafId = requestAnimationFrame(() => {
      setOpacity(1);
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [rendered]);

  useLayoutEffect(() => {
    setRendered(true);
  }, []);

  if (!rendered) {
    return null;
  }

  const indexStyle: React.CSSProperties = {};

  return (
    <div
      data-name="filter-icon"
      style={{ ...style, width: size }}
      className={join(
        className,
        InfiniteIconClassName,
        FilterIconCls,
        `${InfiniteIconClassName}-filter`,
      )}
    >
      {showIndex ? (
        <div
          data-name="index"
          style={indexStyle}
          className={HeaderFilterIconIndexCls}
        >
          {index}
        </div>
      ) : null}
      <div style={{ width: sizes[0], ...lineStyle }}></div>
      <div style={{ width: sizes[1], ...lineStyle }}></div>
      <div style={{ width: sizes[2], ...lineStyle }}></div>
    </div>
  );
}
