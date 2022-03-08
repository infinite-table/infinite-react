import * as React from 'react';
import { useEffect, useState } from 'react';
import { join } from '../../../../utils/join';

type SortIconProps = {
  direction: 1 | -1 | 0;
  size?: number;
  lineWidth?: number;
  lineStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  className?: string;
  index?: number;
};

const defaultLineStyle: React.CSSProperties = {
  marginTop: 2,
  marginBottom: 2,
  transition: `width 0.25s, opacity 0.25s`,
};

export const InfiniteTableIconClassName = 'InfiniteTableIcon';

export function SortIcon(props: SortIconProps) {
  const [rendered, setRendered] = useState(true);
  const [opacity, setOpacity] = useState(0);

  const { direction, lineWidth = 1, style, className, index } = props;

  const showIndex = index != null && index > 0;

  const size = props.size ?? 16;

  const part = Math.floor(size / 4);

  const sizes = direction
    ? [size - 3 * part, size - 2 * part, size - part]
    : [0, 0, 0];

  if (direction === -1) {
    sizes.reverse();
  }

  const lineStyle = {
    ...defaultLineStyle,
    borderTop: `${lineWidth}px solid currentColor`,
    ...props.lineStyle,
    opacity,
  };

  useEffect(() => {
    const newOpacity = direction != 0 ? 1 : 0;

    if (!rendered && newOpacity) {
      setRendered(true);
    }
    if (newOpacity !== opacity) {
      requestAnimationFrame(() => {
        setOpacity(newOpacity);
      });
    }
  }, [direction, rendered]);

  const onTransitionEnd = () => {
    const hidden = opacity === 0 && direction === 0;
    const newRendered = !hidden;
    if (newRendered !== rendered) {
      setRendered(newRendered);
    }
  };

  if (!rendered) {
    return null;
  }

  const indexStyle: React.CSSProperties = {
    position: 'absolute',
    transition: 'top 0.2s',
    top: 0,
    right: 2,
  };

  if (direction === -1) {
    indexStyle.top = '100%';
  }

  return (
    <div
      style={{ ...style, width: size }}
      className={join(
        className,
        InfiniteTableIconClassName,
        `${InfiniteTableIconClassName}-sort`,
      )}
    >
      {showIndex ? (
        <div data-name="index" style={indexStyle}>
          {index}
        </div>
      ) : null}
      <div
        style={{ width: sizes[0], ...lineStyle }}
        onTransitionEnd={onTransitionEnd}
      ></div>
      <div style={{ width: sizes[1], ...lineStyle }}></div>
      <div style={{ width: sizes[2], ...lineStyle }}></div>
    </div>
  );
}
