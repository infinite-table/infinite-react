import { createThemeContract } from '@vanilla-extract/css';
export const InternalVars = createThemeContract({
  currentColumnTransformX: null,
  y: null,

  currentFlashingBackground: null,
  currentFlashingDuration: null,

  activeCellRowOffset: null,
  activeCellRowOffsetX: null,
  activeCellRowHeight: null,

  activeCellOffsetX: null,
  activeCellOffsetY: null,

  scrollTopForActiveRow: null,
  scrollLeftForActiveRowWhenHorizontalLayout: null,
  // this will be set to `${columnWidthAtIndex}-${the index of the column on which the active cell is}`
  activeCellColWidth: null,

  // this will be set to `${columnOffsetAtIndex}-${the index of the column on which the active cell is}`
  activeCellColOffset: null,

  columnReorderEffectDurationAtIndex: null,
  columnWidthAtIndex: null,
  columnOffsetAtIndex: null,
  columnOffsetAtIndexWhileReordering: null,
  columnZIndexAtIndex: null,

  pinnedStartWidth: null,
  pinnedEndWidth: null,

  pinnedEndOffset: null,

  computedVisibleColumnsCount: null,

  baseZIndexForCells: null,

  bodyWidth: null,
  bodyHeight: null,

  scrollbarWidthHorizontal: null,
  scrollbarWidthVertical: null,

  scrollLeft: null,
  scrollTop: null,

  virtualScrollLeftOffset: null,
  virtualScrollTopOffset: null,
});
