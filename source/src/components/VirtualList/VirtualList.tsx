import * as React from 'react';
import { HTMLProps, useRef, useEffect, useState } from 'react';

import type { VirtualListProps } from './types';

import { join } from '../../utils/join';
import { SpacePlaceholder } from './SpacePlaceholder';
import { VirtualScrollContainer } from '../VirtualScrollContainer';
import { useRerender } from '../hooks/useRerender';

import { dbg } from '../../utils/debug';
import { RawList } from '../RawList';
import type { ScrollPosition } from '../types/ScrollPosition';
import {
  scrollTransformTargetCls,
  VirtualListCls,
  VirtualListClsOrientation,
} from './VirtualList.css';

const UPDATE_SCROLL = (node: HTMLElement, scrollPosition: ScrollPosition) => {
  node.style.transform = `translate3d(${-scrollPosition.scrollLeft}px, ${-scrollPosition.scrollTop}px, 0px)`;
};

const debug = dbg('VirtuaList');

const rootClassName = 'InfiniteList';

export const VirtualList = (
  props: VirtualListProps & HTMLProps<HTMLDivElement>,
) => {
  const {
    scrollable,
    outerChildren,
    itemCrossAxisSize,
    brain: virtualBrain,

    mainAxisSize,

    sizeRef,

    count,
    mainAxis,
    itemMainAxisSize,
    renderItem,
    repaintId,
    onContainerScroll,
    children,
    ...restDOMProps
  } = props;

  const domRef = useRef<HTMLDivElement>(null);

  const [, rerender] = useRerender();
  const [totalSize, setTotalSize] = useState(0);

  const renderCountRef = useRef<number>(0);

  useEffect(() => {
    const removeOnRenderCount = virtualBrain.onRenderCountChange(
      (renderCount) => {
        renderCountRef.current = renderCount;
        if (__DEV__) {
          debug.extend(mainAxis)(`Render count change ${renderCount}`);
        }
        rerender();
      },
    );

    setTotalSize(virtualBrain.getTotalSize());

    const removeOnTotalSizeChange = virtualBrain.onTotalSizeChange(
      (totalSize) => {
        requestAnimationFrame(() => {
          setTotalSize(totalSize);
        });
      },
    );

    return () => {
      removeOnRenderCount();
      removeOnTotalSizeChange();
    };
  }, [virtualBrain]);

  useEffect(() => {
    const onScroll = (scrollPosition: ScrollPosition) => {
      UPDATE_SCROLL(domRef.current!, scrollPosition);
    };

    const removeOnScroll = virtualBrain.onScroll(onScroll);

    return removeOnScroll;
  }, [virtualBrain]);

  const width = mainAxis === 'horizontal' ? totalSize : itemCrossAxisSize ?? 0;
  const height = mainAxis === 'vertical' ? totalSize : itemCrossAxisSize ?? 0;

  const domProps = {
    ...restDOMProps,
    className: join(
      props.className,

      rootClassName,
      `${rootClassName}--${mainAxis}`,

      VirtualListCls,
      VirtualListClsOrientation[mainAxis],
    ),
  };
  if (__DEV__) {
    (domProps as any)['data-cmp-name'] = `VirtualList`;
  }

  return (
    <>
      <div {...domProps}>
        <VirtualScrollContainer
          scrollable={scrollable}
          onContainerScroll={onContainerScroll}
        >
          <div
            ref={domRef}
            className={scrollTransformTargetCls}
            data-name="scroll-transform-target"
          >
            <RawList
              brain={virtualBrain}
              renderItem={renderItem}
              repaintId={repaintId}
              debugChannel={'VirtualList'}
            />
          </div>
          {children}
          <SpacePlaceholder count={count} width={width} height={height} />
        </VirtualScrollContainer>

        {outerChildren}
      </div>
    </>
  );
};
