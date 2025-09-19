import { InternalVarUtils } from '../InfiniteTable/utils/infiniteDOMUtils';
import { ThemeVars } from '../InfiniteTable/vars.css';
import { HorizontalLayoutMatrixBrain } from '../VirtualBrain/HorizontalLayoutMatrixBrain';

import {
  columnOffsetAtIndexWhileReordering,
  currentTransformY,
  GridRenderer,
} from './ReactHeadlessTableRenderer';

export class HorizontalLayoutTableRenderer extends GridRenderer {
  protected brain: HorizontalLayoutMatrixBrain;
  constructor(brain: HorizontalLayoutMatrixBrain, debugId?: string) {
    super(brain, debugId);
    this.brain = brain;
  }

  protected getCellRealCoordinates(rowIndex: number, colIndex: number) {
    return this.brain.getHorizontalLayoutPositionFromMatrixCoordinates({
      rowIndex,
      colIndex,
    });
  }

  isCellRenderedAndMappedCorrectly(row: number, col: number) {
    const cell = this.cellManager.getCellAt([row, col]);
    const rendered = !!cell;

    if (!rendered) {
      return {
        rendered,
        mapped: false,
      };
    }

    const cellAdditionalInfo = cell!.getAdditionalInfo();

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
    const pageWidth = ThemeVars.runtime.totalVisibleColumnsWidthVar;
    const pageOffset = pageIndex ? `calc(${pageWidth} * ${pageIndex})` : '0px';

    const columnOffsetX = InternalVarUtils.columnOffsets.get(
      horizontalLayoutCoords.colIndex,
    );
    const columnOffsetXWhileReordering = `${columnOffsetAtIndexWhileReordering}-${horizontalLayoutCoords.colIndex}`;

    const currentTransformYValue = `${y}px`;

    //@ts-ignore
    if (element.__currentTransformY !== currentTransformYValue) {
      //@ts-ignore
      element.__currentTransformY = currentTransformYValue;
      element.style.setProperty(currentTransformY, currentTransformYValue);
    }

    const xOffset = `calc(var(${columnOffsetXWhileReordering}, ${columnOffsetX}) + ${pageOffset})`;
    // const transformX = `var(${columnOffsetXWhileReordering}, ${xOffset})`;
    // const transformXIncludeReordering = `calc(var(${columnOffsetXWhileReordering}, ${xOffset}) + var(${pageOffset}))`;
    const transformY = `var(${currentTransformY})`;

    const transformValue = `translate3d(${xOffset}, ${transformY}, 0px)`;

    //@ts-ignore
    if (element.__transformValue !== transformValue) {
      //@ts-ignore
      element.__transformValue = transformValue;
      element.style.transform = transformValue;
    }
  };
}
