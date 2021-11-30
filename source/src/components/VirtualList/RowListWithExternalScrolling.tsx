import * as React from 'react';
import { useEffect, CSSProperties, useCallback, useRef } from 'react';

import { join } from '../../utils/join';
import { VirtualBrain } from '../VirtualBrain';

import type { RenderRow } from './types';
import type { ScrollPosition } from '../types/ScrollPosition';
import type { RenderItem, RenderItemParam } from '../RawList/types';
import { RawList } from '../RawList';
import { OnMountProps, useOnMount } from '../hooks/useOnMount';
import { VirtualListCls, VirtualListClsOrientation } from './VirtualList.css';
import {
  position,
  transform,
  willChange,
} from '../InfiniteTable/utilities.css';
import { InfiniteListRootClassName } from './InfiniteListRootClassName';

const rootClassName = InfiniteListRootClassName;
const defaultClasses = [
  willChange.transform,
  position.relative,
  transform.translateZero,
];

export type RowListWithExternalScrollingListProps = {
  brain: VirtualBrain;
  renderRow: RenderRow;

  repaintId?: number | string;
  updateScroll?: (node: HTMLElement, scrollPosition: ScrollPosition) => void;

  style?: CSSProperties;
  className?: string;
} & OnMountProps;

export const RowListWithExternalScrolling = (
  props: RowListWithExternalScrollingListProps,
) => {
  const {
    renderRow,
    repaintId,

    brain,
    updateScroll,

    style,
    className,

    onMount,
    onUnmount,
  } = props;

  const domRef = useRef<HTMLDivElement>(null);

  const renderItem = useCallback<RenderItem>(
    (renderProps: RenderItemParam) =>
      renderRow({
        domRef: renderProps.domRef,
        rowHeight: renderProps.itemSize,
        rowIndex: renderProps.itemIndex,
      }),
    [renderRow],
  );

  useOnMount(domRef, {
    onMount,
    onUnmount,
  });

  useEffect(() => {
    const onScroll = (scrollPosition: ScrollPosition) => {
      const node = domRef.current;

      if (node) {
        if (__DEV__) {
          const { renderStartIndex, renderEndIndex } = brain.getRenderRange();
          (node.dataset as any).renderStartIndex = renderStartIndex;
          (node.dataset as any).renderEndIndex = renderEndIndex;
          // (node.dataset as any).scrollLeft = scrollPosition.scrollLeft;
          // (node.dataset as any).scrollTop = scrollPosition.scrollTop;
        }

        if (updateScroll) {
          updateScroll(node, scrollPosition);
        } else {
          node.style.transform = `translate3d(${-scrollPosition.scrollLeft}px, ${-scrollPosition.scrollTop}px, 0px)`;
        }
      }
    };
    const removeOnScroll = brain.onScroll(onScroll);

    return () => {
      removeOnScroll();
    };
  }, [brain]);

  const domProps: React.HTMLProps<HTMLDivElement> = {
    ref: domRef,
    style,
    className: join(
      className,
      rootClassName,
      `${rootClassName}--vertical`,
      VirtualListCls,
      VirtualListClsOrientation.vertical,
      ...defaultClasses,
    ),
  };
  if (__DEV__) {
    (domProps as any)['data-cmp-name'] = 'RowListWithExternalScrolling';
  }

  return (
    <div {...domProps}>
      <RawList brain={brain} renderItem={renderItem} repaintId={repaintId} />
    </div>
  );
};
