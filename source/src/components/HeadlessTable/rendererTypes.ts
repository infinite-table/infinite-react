import type { RefCallback } from 'react';

import type { Renderable } from '../types/Renderable';
import type { FixedPosition } from '../VirtualBrain/MatrixBrain';

export type TableRenderCellFnParam = {
  domRef: RefCallback<HTMLElement>;
  rowIndex: number;
  colIndex: number;
  rowspan: number;
  colspan: number;
  hidden: boolean;
  width: number;
  height: number;
  widthWithColspan: number;
  heightWithRowspan: number;
  rowFixed: FixedPosition;
  colFixed: FixedPosition;
  onMouseEnter: VoidFunction;
  onMouseLeave: VoidFunction;
};

export type TableRenderDetailRowFnParam = {
  domRef: RefCallback<HTMLElement>;
  rowIndex: number;
  hidden: boolean;
  height: number;
  rowFixed: FixedPosition;
  onMouseEnter: VoidFunction;
  onMouseLeave: VoidFunction;
};
export type TableRenderCellFn = (param: TableRenderCellFnParam) => Renderable;
export type TableRenderDetailRowFn = (
  param: TableRenderDetailRowFnParam,
) => Renderable;

export type RenderableWithPosition = {
  renderable: Renderable;
  position: 'start' | 'end' | null;
};

export type RenderRangeOptions = {
  force?: boolean;
  renderCell: TableRenderCellFn;
  renderDetailRow?: TableRenderDetailRowFn;
  onRender: (items: Renderable[]) => void;
};

export type HorizontalLayoutColVisibilityOptions = {
  horizontalLayoutPageIndex?: number;
};
