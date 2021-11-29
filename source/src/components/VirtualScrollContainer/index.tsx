import * as React from 'react';
import { CSSProperties, Ref, RefObject, useRef } from 'react';

import { useOnScroll } from '../hooks/useOnScroll';

import { getScrollableClassName, Scrollable } from './getScrollableClassName';
import type { Renderable } from '../types/Renderable';
import { VirtualScrollContainerCls } from './VirtualScrollContainer.css';
import { join } from '../../utils/join';

export type { Scrollable };

const rootClassName = 'InfiniteVirtualScrollContainer';

export interface VirtualScrollContainerProps {
  className?: string;
  style?: CSSProperties;
  children?: Renderable;

  scrollable?: Scrollable;

  onContainerScroll?: (scrollPos: {
    scrollTop: number;
    scrollLeft: number;
  }) => void;
}

export const VirtualScrollContainer = React.forwardRef(
  function VirtualScrollContainer(
    props: VirtualScrollContainerProps,
    ref?: Ref<HTMLDivElement>,
  ) {
    const {
      children,
      scrollable = true,
      onContainerScroll,
      className,
      style,
    } = props;

    const domRef = ref ?? useRef<HTMLDivElement | null>(null);

    useOnScroll(domRef as RefObject<HTMLDivElement>, onContainerScroll);

    return (
      <div
        ref={domRef}
        style={style}
        className={join(
          className,
          rootClassName,
          VirtualScrollContainerCls,
          getScrollableClassName(scrollable),
        )}
      >
        {children}
      </div>
    );
  },
);
