import type { CSSProperties, MutableRefObject, RefCallback } from 'react';

import type { Renderable } from '../types/Renderable';

import type { Scrollable } from '../VirtualScrollContainer';
import type { VirtualBrain } from '../VirtualBrain';

import type { RenderItem } from '../RawList/types';

export type OnContainerScrollFn = (scrollInfo: {
  scrollLeft: number;
  scrollTop: number;
}) => void;

interface BaseVirtualListProps {
  brain: VirtualBrain;
  count: number;
  sizeRef?: MutableRefObject<HTMLElement | null>;

  scrollable?: Scrollable;
  outerChildren?: Renderable;
  onContainerScroll?: OnContainerScrollFn;

  children?: Renderable;
  repaintId?: number | string;
}

export interface VirtualListProps extends BaseVirtualListProps {
  mainAxis: 'vertical' | 'horizontal';
  renderItem: RenderItem;
  itemMainAxisSize: number | ((itemIndex: number) => number);

  mainAxisSize?: number;
  itemCrossAxisSize?: number;
}

export type RowHeight = number | ((rowIndex: number) => number);

export interface VirtualRowListProps extends BaseVirtualListProps {
  renderRow: RenderRow;
  rowHeight: RowHeight;
  rowWidth?: number;
}

export type RenderRowParam = {
  domRef: RefCallback<HTMLElement>;
  rowIndex: number;
  rowHeight: number;
};
export type RenderColumnParam = {
  domRef: RefCallback<HTMLElement>;
  columnIndex: number;
  columnWidth: number;
};
export type RenderRow = (renderProps: RenderRowParam) => Renderable;
export type RenderColumn = (renderProps: RenderColumnParam) => Renderable;
