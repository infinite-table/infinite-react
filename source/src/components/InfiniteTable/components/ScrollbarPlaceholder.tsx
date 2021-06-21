import * as React from 'react';
import { getScrollbarWidth } from '../../utils/getScrollbarWidth';

function HorizontalScrollbarPlaceholderFn(props: {
  style: React.CSSProperties;
}) {
  const height = getScrollbarWidth();

  if (!height) {
    return null;
  }
  return (
    <div
      data-name="horizontal-scrollbar-placeholder"
      style={{
        position: 'absolute',
        overflow: 'visible',
        overflowX: 'scroll',
        height,
        bottom: 0,
        ...props.style,
      }}
    ></div>
  );
}

export const HorizontalScrollbarPlaceholder = React.memo(
  HorizontalScrollbarPlaceholderFn,
);

function VerticalScrollbarPlaceholderFn(props: { style: React.CSSProperties }) {
  const width = getScrollbarWidth();

  if (!width) {
    return null;
  }
  return (
    <div
      data-name="vertical-scrollbar-placeholder"
      style={{
        position: 'absolute',
        overflow: 'visible',
        overflowY: 'scroll',
        width,
        bottom: 0,
        ...props.style,
      }}
    ></div>
  );
}

export const VerticalScrollbarPlaceholder = React.memo(
  VerticalScrollbarPlaceholderFn,
);
