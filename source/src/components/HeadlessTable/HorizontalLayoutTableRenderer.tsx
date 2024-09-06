import { TableRenderRange } from '../InfiniteTable';
import { Renderable } from '../types/Renderable';
import { HorizontalLayoutMatrixBrain } from '../VirtualBrain/HorizontalLayoutMatrixBrain';
import {
  columnOffsetAtIndex,
  columnOffsetAtIndexWhileReordering,
  currentTransformY,
  ReactHeadlessTableRenderer,
  TableRenderCellFn,
  TableRenderDetailRowFn,
} from './ReactHeadlessTableRenderer';

export class HorizontalLayoutTableRenderer extends ReactHeadlessTableRenderer {
  protected brain: HorizontalLayoutMatrixBrain;
  constructor(brain: HorizontalLayoutMatrixBrain) {
    super(brain);
    this.brain = brain;
  }

  protected getCellRealCoordinates(rowIndex: number, colIndex: number) {
    return this.brain.getHorizontalLayoutPositionFromMatrixCoordinates({
      rowIndex,
      colIndex,
    });
  }

  renderRange(
    range: TableRenderRange,

    {
      renderCell,
      renderDetailRow,
      force,
      onRender,
    }: {
      force?: boolean;
      renderCell: TableRenderCellFn;
      renderDetailRow?: TableRenderDetailRowFn;
      onRender: (items: Renderable[]) => void;
    },
  ): Renderable[] {
    return super.renderRange(range, {
      renderCell,
      renderDetailRow,
      force,
      onRender,
    });
  }

  setTransform = (
    element: HTMLElement,
    rowIndex: number,
    colIndex: number,

    options: {
      x: number;
      y: number;
      scrollLeft?: boolean;
      scrollTop?: boolean;
    },
    zIndex: number | 'auto' | undefined | null,
  ) => {
    const horizontalLayoutCoords = this.getCellRealCoordinates(
      rowIndex,
      colIndex,
    );

    const { y } = options;
    const pageIndex = Math.floor(
      horizontalLayoutCoords.rowIndex / this.brain.rowsPerPage,
    );
    const pageOffset = pageIndex ? pageIndex * this.brain.pageWidth : 0;

    const columnOffsetX = `${columnOffsetAtIndex}-${horizontalLayoutCoords.colIndex}`;
    const columnOffsetXWhileReordering = `${columnOffsetAtIndexWhileReordering}-${horizontalLayoutCoords.colIndex}`;

    const currentTransformYValue = `${y}px`;

    //@ts-ignore
    if (element.__currentTransformY !== currentTransformYValue) {
      //@ts-ignore
      element.__currentTransformY = currentTransformYValue;
      element.style.setProperty(currentTransformY, currentTransformYValue);
    }

    const xOffset = `calc(var(${columnOffsetX}) + ${pageOffset}px)`;
    const transformX = `var(${columnOffsetXWhileReordering}, ${xOffset})`;
    const transformY = `var(${currentTransformY})`;

    const transformValue = `translate3d(${transformX}, ${transformY}, 0px)`;

    //@ts-ignore
    if (element.__transformValue !== transformValue) {
      //@ts-ignore
      element.__transformValue = transformValue;
      element.style.transform = transformValue;
    }
  };
}
