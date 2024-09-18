import { HorizontalLayoutMatrixBrain } from '../VirtualBrain/HorizontalLayoutMatrixBrain';
import {
  columnOffsetAtIndex,
  columnOffsetAtIndexWhileReordering,
  currentTransformY,
  ReactHeadlessTableRenderer,
} from './ReactHeadlessTableRenderer';

export class HorizontalLayoutTableRenderer extends ReactHeadlessTableRenderer {
  protected brain: HorizontalLayoutMatrixBrain;
  constructor(brain: HorizontalLayoutMatrixBrain, debugId?: string) {
    super(brain, debugId);
    this.brain = brain;
  }

  protected getCellRealCoordinates(rowIndex: number, colIndex: number) {
    // return {
    //   rowIndex,
    //   colIndex,
    // };
    return this.brain.getHorizontalLayoutPositionFromMatrixCoordinates({
      rowIndex,
      colIndex,
    });
  }

  isCellRenderedAndMappedCorrectly(row: number, col: number) {
    const rendered = this.mappedCells.isCellRendered(row, col);

    if (!rendered) {
      return {
        rendered,
        mapped: false,
      };
    }

    const cellAdditionalInfo = this.mappedCells.getCellAdditionalInfo(row, col);

    if (!cellAdditionalInfo) {
      return {
        rendered,
        mapped: false,
      };
    }

    const info = this.getCellRealCoordinates(row, col);

    const mapped =
      info.colIndex === cellAdditionalInfo!.renderColIndex &&
      info.rowIndex === cellAdditionalInfo!.renderRowIndex;

    return {
      rendered,
      mapped,
    };
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
    _zIndex: number | 'auto' | undefined | null,
  ) => {
    const horizontalLayoutCoords = this.getCellRealCoordinates(
      rowIndex,
      colIndex,
    );

    const { y } = options;
    const pageIndex = Math.floor(
      horizontalLayoutCoords.rowIndex / this.brain.rowsPerPage,
    );
    const pageWidth = `${this.brain.pageWidth}px`;
    const pageOffset = pageIndex ? `calc(${pageIndex} * ${pageWidth})` : '0px';

    const columnOffsetX = `${columnOffsetAtIndex}-${horizontalLayoutCoords.colIndex}`;
    const columnOffsetXWhileReordering = `${columnOffsetAtIndexWhileReordering}-${horizontalLayoutCoords.colIndex}`;

    const currentTransformYValue = `${y}px`;

    //@ts-ignore
    if (element.__currentTransformY !== currentTransformYValue) {
      //@ts-ignore
      element.__currentTransformY = currentTransformYValue;
      element.style.setProperty(currentTransformY, currentTransformYValue);
    }

    const xOffset = `calc(var(${columnOffsetX}) + ${pageOffset})`;
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
