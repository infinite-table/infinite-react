import type { ElementRefCallback, GridMouseEvent } from '../types/DOMTypes';
import type { Renderable } from '../types/Renderable';
import type { FixedPosition } from '../VirtualBrain/MatrixBrain';

export type TableRenderCellFnParam = {
  domRef: ElementRefCallback;
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
  onMouseEnter: (event: GridMouseEvent) => void;
  onMouseLeave: (event: GridMouseEvent) => void;
};

export type TableRenderDetailRowFnParam = {
  domRef: ElementRefCallback;
  rowIndex: number;
  hidden: boolean;
  height: number;
  rowFixed: FixedPosition;
  onMouseEnter: (event: GridMouseEvent) => void;
  onMouseLeave: (event: GridMouseEvent) => void;
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
