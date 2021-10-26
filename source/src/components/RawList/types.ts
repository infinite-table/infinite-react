import type { RefCallback } from 'react';
import type { Renderable } from '../types/Renderable';
import type { VirtualBrain } from '../VirtualBrain';

export type RenderItemParam = {
  domRef: RefCallback<HTMLElement>;
  itemIndex: number;
  itemSize: number;
  itemSizeWithSpan: number;
  itemSpan: number;
  spanParent: number;
  covered: boolean;
};
export type RenderItem = (renderProps: RenderItemParam) => Renderable;
export type RawListItemSpan = (itemSpanProps: { itemIndex: number }) => number;

export type RawListProps = {
  debugChannel?: string;
  renderItem: RenderItem;
  itemSpan?: RawListItemSpan;
  brain: VirtualBrain;
  repaintId?: string | number;
};
