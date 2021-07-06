import type { RefCallback } from 'react';
import type { Renderable } from '../types/Renderable';
import type { VirtualBrain } from '../VirtualBrain';

export type RenderItemParam = {
  domRef: RefCallback<HTMLElement>;
  itemIndex: number;
  itemSize: number;
};
export type RenderItem = (renderProps: RenderItemParam) => Renderable;

export type RawListProps = {
  debugChannel?: string;
  renderItem: RenderItem;
  brain: VirtualBrain;
  repaintId?: string | number;
};
