import { createThemeContract, globalStyle } from '@vanilla-extract/css';

export const InternalVars = createThemeContract({
  currentColumnTransformX: null,
  y: null,

  activeCellRowOffset: null,
  activeCellRowHeight: null,

  activeCellOffsetX: null,
  activeCellOffsetY: null,

  scrollTopForActiveRow: null,
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
});

import { LightVars as LightTheme } from './vars-default-light.css';
import { DarkVars as DarkTheme } from './vars-default-dark.css';

globalStyle(':root', {
  //@ts-ignore
  vars: LightTheme,
  '@media': {
    '(prefers-color-scheme: dark)': {
      vars: DarkTheme,
    },
  },
});

globalStyle(
  '.light, .infinite-light, .infinite-theme-mode--light, .light:root, .infinite-light:root, .infinite-theme-mode--light:root',
  {
    //@ts-ignore
    vars: LightTheme,
  },
);
globalStyle('.dark, .infinite-dark, .infinite-theme-mode--dark', {
  vars: DarkTheme,
});

import './theme-minimalist.css';
