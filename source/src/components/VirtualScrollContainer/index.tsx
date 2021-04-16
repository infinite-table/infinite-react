import * as React from 'react';
import { CSSProperties, Ref, RefObject, useRef } from 'react';

import { ICSS } from '@use-infinite-table/icss/runtime';
import { useOnScroll } from '../hooks/useOnScroll';

import { getScrollableClassName, Scrollable } from './getScrollableClassName';
import { Renderable } from '../types/Renderable';

export type { Scrollable };

const rootClassName = 'AT-VirtualScrollContainer';
const defaultClasName = [
  ICSS.position.fixed,
  ICSS.height['100%'],
  ICSS.width['100%'],
  ICSS.left[0],
  ICSS.top[0],
].join(' ');

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
  (props: VirtualScrollContainerProps, ref?: Ref<HTMLDivElement>) => {
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
        className={[
          className,
          rootClassName,
          defaultClasName,
          getScrollableClassName(scrollable),
        ].join(' ')}
      >
        {children}
      </div>
    );
  },
);
