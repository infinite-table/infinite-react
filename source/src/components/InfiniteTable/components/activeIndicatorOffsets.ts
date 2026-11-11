import type { ScrollPosition } from '../../types/ScrollPosition';
import type { HorizontalLayoutMatrixBrain } from '../../VirtualBrain/HorizontalLayoutMatrixBrain';
import type { MatrixBrain } from '../../VirtualBrain/MatrixBrain';
import { InternalVarUtils } from '../utils/infiniteDOMUtils';
import { ThemeVars } from '../vars.css';

/**
 * DOM offsets for the active row / active cell indicators (React and Vue).
 *
 * Like cells, they are written relative to the brain's scroll origin, so the
 * values stay below what browsers can handle when the content is huge - see
 * VirtualBrain/largeContent.ts. The origin is 0 unless the content is huge,
 * so the values are the same as they've always been.
 */

/**
 * In horizontal layout, the x offset of the given page, relative to the page
 * at the scroll origin
 */
function getPageOffsetX(brain: MatrixBrain, pageIndex: number) {
  const relativePageIndex =
    pageIndex -
    (brain as HorizontalLayoutMatrixBrain).getScrollOriginPageIndex();

  return relativePageIndex
    ? `calc(${ThemeVars.runtime.totalVisibleColumnsWidthVar} * ${relativePageIndex})`
    : null;
}

export function getActiveRowIndicatorVars(
  brain: MatrixBrain,
  activeRowIndex: number,
) {
  let activeCellRowOffsetX = '0px';
  let rowIndex = activeRowIndex;

  if (brain.isHorizontalLayoutBrain && brain.rowsPerPage) {
    activeCellRowOffsetX =
      getPageOffsetX(brain, brain.getPageIndexForRow(rowIndex)) ?? '0px';
    rowIndex = rowIndex % brain.rowsPerPage;
  }
  const activeCellRowHeight = brain.getRowHeight(rowIndex);
  const activeCellRowOffset =
    brain.getItemOffsetFor(rowIndex, 'vertical') -
    brain.getScrollOrigin().scrollTop;

  return {
    activeCellRowHeight: `${activeCellRowHeight}px`,
    activeCellRowOffset: `${activeCellRowOffset}px`,
    activeCellRowOffsetX,
  };
}

/**
 * The active row indicator lives outside of the scroll layer, so it follows
 * the scroll position with these
 */
export function getActiveRowIndicatorScrollVars(
  brain: MatrixBrain,
  scrollPosition: ScrollPosition,
) {
  const { scrollTop, scrollLeft } = brain.getDOMScrollPosition(scrollPosition);

  return {
    scrollTopForActiveRow: `${-scrollTop}px`,
    scrollLeftForActiveRowWhenHorizontalLayout: brain.isHorizontalLayoutBrain
      ? `${-scrollLeft}px`
      : '0px',
  };
}

export function getActiveCellIndicatorVars(
  brain: MatrixBrain,
  activeCellIndex: [number, number],
  rowHeight: number | ((rowIndex: number) => number) | undefined,
) {
  let [rowIndex] = activeCellIndex;
  const colIndex = activeCellIndex[1];

  let activeCellColOffset: string | undefined;

  if (brain.isHorizontalLayoutBrain && brain.rowsPerPage) {
    // the table computes this var too (getInfiniteCSSVars), but with the
    // absolute page index - here it has to be relative to the origin page.
    // Set on the indicator node, it wins over the inherited one.
    const columnOffset = InternalVarUtils.columnOffsets.get(colIndex);
    const pageOffset = getPageOffsetX(
      brain,
      brain.getPageIndexForRow(rowIndex),
    );

    activeCellColOffset = pageOffset
      ? `calc( ${pageOffset} + ${columnOffset})`
      : columnOffset;

    rowIndex = rowIndex % brain.rowsPerPage;
  }

  const activeCellRowHeight: number =
    typeof rowHeight === 'function'
      ? rowHeight(rowIndex)
      : rowHeight ?? brain.getRowHeight(rowIndex);
  const activeCellRowOffset =
    brain.getItemOffsetFor(rowIndex, 'vertical') -
    brain.getScrollOrigin().scrollTop;

  const vars: {
    activeCellRowHeight: string;
    activeCellRowOffset: string;
    activeCellColOffset?: string;
  } = {
    activeCellRowHeight: `${activeCellRowHeight}px`,
    activeCellRowOffset: `${activeCellRowOffset}px`,
  };
  if (activeCellColOffset !== undefined) {
    vars.activeCellColOffset = activeCellColOffset;
  }
  return vars;
}
