import { HorizontalLayoutMatrixBrain } from '../VirtualBrain/HorizontalLayoutMatrixBrain';
import {
  columnOffsetAtIndex,
  columnOffsetAtIndexWhileReordering,
  currentTransformY,
  ReactHeadlessTableRenderer,
  TableRenderCellFn,
} from './ReactHeadlessTableRenderer';

export class HorizontalLayoutTableRenderer extends ReactHeadlessTableRenderer {
  protected brain: HorizontalLayoutMatrixBrain;
  constructor(brain: HorizontalLayoutMatrixBrain) {
    super(brain);
    this.brain = brain;
  }

  protected old_renderCellAtElement(
    rowIndex: number,
    colIndex: number,
    elementIndex: number,
    renderCell: TableRenderCellFn,
  ) {
    if (this.destroyed) {
      return;
    }

    const covered = this.isCellCovered(rowIndex, colIndex);

    const height = this.brain.getRowHeight(rowIndex);
    const width = this.brain.getColWidth(colIndex);

    const rowspan = this.brain.getRowspan(rowIndex, colIndex);
    const colspan = this.brain.getColspan(rowIndex, colIndex);

    const heightWithRowspan =
      rowspan === 1
        ? height
        : this.brain.getRowHeightWithSpan(rowIndex, colIndex, rowspan);

    const widthWithColspan =
      colspan === 1
        ? width
        : this.brain.getColWidthWithSpan(rowIndex, colIndex, colspan);

    const { row: rowFixed, col: colFixed } = this.isCellFixed(
      rowIndex,
      colIndex,
    );

    const hidden = !!covered;

    const renderedNode = renderCell({
      rowIndex,
      colIndex: colIndex % this.brain.initialCols,
      height,
      width,
      rowspan,
      colspan,
      rowFixed,
      colFixed,
      hidden,
      heightWithRowspan,
      widthWithColspan,
      onMouseEnter: this.onMouseEnter.bind(null, rowIndex),
      onMouseLeave: this.onMouseLeave.bind(null, rowIndex),
      domRef: this.itemDOMRefs[elementIndex],
    });

    const itemUpdater = this.updaters[elementIndex];

    if (!itemUpdater) {
      this.error(
        `Cannot find item updater for item ${rowIndex},${colIndex} at this time... sorry.`,
      );
      return;
    }

    // console.log('render row', rowIndex);

    this.mappedCells.renderCellAtElement(
      rowIndex,
      colIndex,
      elementIndex,
      renderedNode,
    );

    if (__DEV__) {
      this.debug(
        `Render cell ${rowIndex},${colIndex} at element ${elementIndex}`,
      );
    }

    // console.log('update', rowIndex, colIndex, renderedNode);
    itemUpdater(renderedNode);

    this.updateElementPosition(elementIndex, { hidden, rowspan, colspan });
    return;
  }

  protected getCellRealCoordinates(rowIndex: number, colIndex: number) {
    const coords = this.brain.getHorizontalLayoutPositionFromMatrixCoordinates({
      rowIndex,
      colIndex,
    });
    // console.log([rowIndex, colIndex], ' -> ', [
    //   coords.rowIndex,
    //   coords.colIndex,
    // ]);
    return coords;
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
  setTransform_old = (
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
    console.log(horizontalLayoutCoords);
    colIndex = colIndex % this.brain.initialCols;
    const { y } = options;
    const pageIndex = Math.floor(rowIndex / this.brain.rowsPerPage);
    const pageOffset = pageIndex ? pageIndex * this.brain.pageWidth : 0;

    const columnOffsetX = `${columnOffsetAtIndex}-${colIndex}`;
    const columnOffsetXWhileReordering = `${columnOffsetAtIndexWhileReordering}-${colIndex}`;

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
