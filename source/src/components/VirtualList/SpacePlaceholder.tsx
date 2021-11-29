import * as React from 'react';

interface SpacePlaceholderProps {
  width: number;
  height: number;
  count?: number;
}

function SpacePlaceholderFn(props: SpacePlaceholderProps) {
  const { height, width, count } = props;

  const style: React.CSSProperties = {
    height,
    width,
    zIndex: -1,
    opacity: 0,
    pointerEvents: 'none',
  };

  return (
    <div
      data-count={count}
      data-placeholder-width={__DEV__ ? width : undefined}
      data-placeholder-height={__DEV__ ? height : undefined}
      data-name="SpacePlaceholder"
      style={style}
    />
  );
}

export const SpacePlaceholder = React.memo(SpacePlaceholderFn);
