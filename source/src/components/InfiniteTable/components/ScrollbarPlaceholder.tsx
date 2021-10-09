import * as React from 'react';
import { getScrollbarWidth } from '../../utils/getScrollbarWidth';

function HorizontalScrollbarPlaceholderFn(props: {
  style: React.CSSProperties;
}) {
  const scrollbarWidth = getScrollbarWidth();

  // we're on a system with no visible scrollbar, so no need to render anything
  if (!scrollbarWidth) {
    return null;
  }
  return (
    <div
      data-name="horizontal-scrollbar-placeholder"
      style={{
        position: 'absolute',
        overflow: 'visible',
        overflowX: 'scroll',
        // height: scrollbarWidth,// not needed, as browser makes the element have the needed width
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
  const scrollbarWidth = getScrollbarWidth();

  // we're on a system with no visible scrollbar, so no need to render anything
  if (!scrollbarWidth) {
    return null;
  }
  return (
    <div
      data-name="vertical-scrollbar-placeholder"
      style={{
        position: 'absolute',
        overflow: 'visible',
        overflowY: 'scroll',
        bottom: 0,
        // width: scrollbarWidth, // not needed, as browser makes the element have the needed width
        ...props.style,
      }}
    ></div>
  );
}

export const VerticalScrollbarPlaceholder = React.memo(
  VerticalScrollbarPlaceholderFn,
);
