import type { RefCallback } from 'react';
import type { Renderable } from '../types/Renderable';
import type { VoidFn } from '../types/VoidFn';
import type { VirtualBrain } from '../VirtualBrain';

export type RenderItemParam = {
  domRef: RefCallback<HTMLElement>;
  itemIndex: number;
  itemSize: number;
};
export type RenderItem = (renderProps: RenderItemParam) => Renderable;

export type UpdaterChangeFn = (node: Renderable) => void;

export interface UpdaterFn {
  (node: Renderable, callback?: VoidFn): void;
  get: () => Renderable;
  destroy: VoidFn;
  onChange: (fn: UpdaterChangeFn) => VoidFn;
}

export type RawListProps = {
  debugChannel?: string;
  renderItem: RenderItem;
  brain: VirtualBrain;
  repaintId?: string | number;
};
