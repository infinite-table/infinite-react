import * as React from 'react';
import { CSSProperties, Ref, RefObject, useRef } from 'react';

import { useOnScroll } from '../hooks/useOnScroll';

import { getScrollableClassName, Scrollable } from './getScrollableClassName';
import type { Renderable } from '../types/Renderable';
import {
  VirtualScrollContainerChildToScrollCls,
  VirtualScrollContainerCls,
} from './VirtualScrollContainer.css';
import { join } from '../../utils/join';

export type { Scrollable };

const rootClassName = 'InfiniteVirtualScrollContainer';

export interface VirtualScrollContainerProps {
  className?: string;
  style?: CSSProperties;
  children?: Renderable;

  scrollable?: Scrollable;
  tabIndex?: number;

  onContainerScroll?: (scrollPos: {
    scrollTop: number;
    scrollLeft: number;
  }) => void;
}
export { VirtualScrollContainerChildToScrollCls };

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
      tabIndex,
      style,
    } = props;

    const domRef = ref ?? useRef<HTMLDivElement | null>(null);

    useOnScroll(domRef as RefObject<HTMLDivElement>, onContainerScroll);

    //TODO: in __DEV__ mode, on useEffect, check if first child has VirtualScrollContainerChildToScrollCls cls

    return (
      <div
        ref={domRef}
        style={style}
        tabIndex={tabIndex}
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
