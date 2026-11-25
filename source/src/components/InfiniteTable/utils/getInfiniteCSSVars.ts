/**
 * Framework-neutral computation of the CSS variables the Infinite Table
 * root element must define (column widths/offsets/z-indexes, body size,
 * scrollbar + pinned measurements). Extracted from useDOMProps so the React
 * hook and the Vue root component produce identical vars.
 */
import type { CSSProperties } from '../../types/FrameworkTypes';

import { stripVar } from '../../../utils/stripVar';
import { getScrollbarWidth } from '../../utils/getScrollbarWidth';
import type { MatrixBrain } from '../../VirtualBrain/MatrixBrain';
import { InternalVars } from '../internalVars.css';
import { InfiniteTableComputedColumn } from '../types';
import { InternalVarUtils } from './infiniteDOMUtils';
import { ThemeVars } from '../vars.css';

const publicRuntimeVars: Record<
  keyof typeof ThemeVars.runtime,
  {
    name: string;
    value: string;
  }
> = {
  bodyWidth: { name: stripVar(ThemeVars.runtime.bodyWidth), value: '' },
  totalVisibleColumnsWidthValue: {
    name: stripVar(ThemeVars.runtime.totalVisibleColumnsWidthValue),
    value: '',
  },
  totalVisibleColumnsWidthVar: {
    name: stripVar(ThemeVars.runtime.totalVisibleColumnsWidthVar),
    value: '',
  },
  visibleColumnsCount: {
    name: stripVar(ThemeVars.runtime.visibleColumnsCount),
    value: '',
  },
  browserScrollbarWidth: {
    name: stripVar(ThemeVars.runtime.browserScrollbarWidth),
    value: '',
  },
};

const scrollbarWidthHorizontal = stripVar(
  InternalVars.scrollbarWidthHorizontal,
);
const scrollbarWidthVertical = stripVar(InternalVars.scrollbarWidthVertical);

const columnWidthAtIndex = stripVar(InternalVars.columnWidthAtIndex);
const columnZIndexAtIndex = stripVar(InternalVars.columnZIndexAtIndex);
const scrollLeftCSSVar = stripVar(InternalVars.scrollLeft);
const activeCellColWidth = stripVar(InternalVars.activeCellColWidth);
const activeCellColOffset = stripVar(InternalVars.activeCellColOffset);
const baseZIndexForCells = stripVar(InternalVars.baseZIndexForCells);

const pinnedStartWidthCSSVar = stripVar(InternalVars.pinnedStartWidth);

const bodyWidthCSSVar = stripVar(InternalVars.bodyWidth);
const bodyHeightCSSVar = stripVar(InternalVars.bodyHeight);
const pinnedEndOffsetCSSVar = stripVar(InternalVars.pinnedEndOffset);

const pinnedEndWidthCSSVar = stripVar(InternalVars.pinnedEndWidth);

const computedVisibleColumnsCountCSSVar = stripVar(
  InternalVars.computedVisibleColumnsCount,
);

export function getColumnZIndex<T>(
  col: InfiniteTableComputedColumn<T>,
  params: { pinnedStartColsCount: number; visibleColsCount: number },
) {
  let computedZIndex: number | 'auto' = 'auto';

  const index = col.computedVisibleIndex;

  if (col.computedPinned) {
    if (col.computedPinned === 'start') {
      computedZIndex =
        params.pinnedStartColsCount - col.computedVisibleIndexInCategory;
    } else if (col.computedPinned === 'end') {
      computedZIndex =
        params.visibleColsCount + col.computedVisibleIndexInCategory;
    }
  } else {
    computedZIndex = -index * 10;
  }

  const zIndexValue =
    typeof computedZIndex === 'number'
      ? `calc( var(${baseZIndexForCells}) ` +
        (computedZIndex < 0 ? '-' : '+') +
        ` ${Math.abs(computedZIndex)} )`
      : 'auto';

  return zIndexValue;
}

export type GetInfiniteCSSVarsParam<T> = {
  computedVisibleColumns: InfiniteTableComputedColumn<T>[];
  computedPinnedStartColumns: InfiniteTableComputedColumn<T>[];
  computedPinnedEndColumns: InfiniteTableComputedColumn<T>[];
  computedPinnedStartColumnsWidth: number;
  computedPinnedEndColumnsWidth: number;
  computedUnpinnedColumnsWidth: number;
  bodySize: { width: number; height: number };
  activeCellIndex: [number, number] | null | undefined;
  brain: MatrixBrain;
  scrollbars: { vertical: boolean; horizontal: boolean };
};

export function getInfiniteCSSVars<T>(
  param: GetInfiniteCSSVarsParam<T>,
): CSSProperties {
  const {
    computedVisibleColumns,
    computedPinnedStartColumns,
    computedPinnedEndColumns,
    computedPinnedStartColumnsWidth,
    computedPinnedEndColumnsWidth,
    computedUnpinnedColumnsWidth,
    bodySize,
    activeCellIndex,
    brain,
    scrollbars,
  } = param;

  const scrollbarWidth = getScrollbarWidth();

  const prevPinnedEndCols: InfiniteTableComputedColumn<T>[] = [];
  const cssVars: CSSProperties = computedVisibleColumns.reduce(
    (vars: CSSProperties, col) => {
      const index = col.computedVisibleIndex;

      //@ts-ignore
      vars[InternalVarUtils.columnWidths.varName.get(index)] =
        col.computedWidth + 'px';

      //@ts-ignore
      vars[InternalVarUtils.columnOffsets.varName.get(index)] =
        col.computedPinned === 'start'
          ? `calc( ${col.computedOffset}px + var(${scrollLeftCSSVar}) )`
          : col.computedPinned === 'end'
          ? // see #startcoloffsets-pinnedend
            `calc( var(${pinnedEndOffsetCSSVar}) ${
              prevPinnedEndCols.length ? '+' : ''
            } ${prevPinnedEndCols
              .map((c) =>
                InternalVarUtils.columnWidths.get(c.computedVisibleIndex),
              )
              .join(' + ')} + var(${scrollLeftCSSVar}) )`
          : `${col.computedOffset}px`;

      const zIndexValue = getColumnZIndex(col, {
        pinnedStartColsCount: computedPinnedStartColumns.length,
        visibleColsCount: computedVisibleColumns.length,
      });

      //@ts-ignore
      vars[`${columnZIndexAtIndex}-${index}`] = `${zIndexValue}`;

      if (col.computedPinned === 'end') {
        prevPinnedEndCols.push(col);
      }
      return vars;
    },
    {},
  );

  // we need this if here - if it's not here, for whatever reason,
  // the scrollbarWidth is not updated correctly on re-renders (as it comes 0 initially when server-side rendered in nextjs for example)
  if (bodySize.width) {
    (cssVars as Record<string, unknown>)[
      publicRuntimeVars.browserScrollbarWidth.name
    ] = `${getScrollbarWidth()}px`;
  }

  (cssVars as Record<string, unknown>)[
    publicRuntimeVars.bodyWidth.name
  ] = `calc(${InternalVars.bodyWidth} - ${InternalVars.scrollbarWidthVertical})`;

  (cssVars as Record<string, unknown>)[publicRuntimeVars.totalVisibleColumnsWidthValue.name] = `${
    computedPinnedStartColumnsWidth +
    computedPinnedEndColumnsWidth +
    computedUnpinnedColumnsWidth
  }px`;

  (cssVars as Record<string, unknown>)[
    publicRuntimeVars.totalVisibleColumnsWidthVar.name
  ] = `calc(${computedVisibleColumns
    .map((_col, index) => {
      return `var(${columnWidthAtIndex}-${index})`;
    })
    .join(' + ')})`;

  (cssVars as Record<string, unknown>)[publicRuntimeVars.visibleColumnsCount.name] =
    computedVisibleColumns.length;

  if (activeCellIndex != null) {
    (cssVars as Record<string, unknown>)[activeCellColWidth] = InternalVarUtils.columnWidths.get(
      activeCellIndex[1],
    );
    const defaultActiveCellColOffset = InternalVarUtils.columnOffsets.get(
      activeCellIndex[1],
    );
    if (brain.isHorizontalLayoutBrain) {
      const pageIndex = brain.getPageIndexForRow(activeCellIndex[0]);

      //@ts-ignore
      cssVars[activeCellColOffset] = pageIndex
        ? `calc( ${ThemeVars.runtime.totalVisibleColumnsWidthVar} * ${pageIndex} + ${defaultActiveCellColOffset})`
        : defaultActiveCellColOffset;
    } else {
      //@ts-ignore
      cssVars[activeCellColOffset] = defaultActiveCellColOffset;
    }
  }

  (cssVars as Record<string, unknown>)[computedVisibleColumnsCountCSSVar] = computedVisibleColumns.length;

  (cssVars as Record<string, unknown>)[scrollbarWidthHorizontal] = scrollbars.horizontal
    ? `${scrollbarWidth}px`
    : '0px';
  (cssVars as Record<string, unknown>)[scrollbarWidthVertical] = scrollbars.vertical
    ? `${scrollbarWidth}px`
    : '0px';
  (cssVars as Record<string, unknown>)[pinnedStartWidthCSSVar] =
    `calc( ` +
    computedPinnedStartColumns
      .map((c) => InternalVarUtils.columnWidths.get(c.computedVisibleIndex))
      .join(' + ') +
    ')';

  (cssVars as Record<string, unknown>)[pinnedEndWidthCSSVar] =
    `calc( ` +
    computedPinnedEndColumns
      .map((c) => InternalVarUtils.columnWidths.get(c.computedVisibleIndex))
      .join(' + ') +
    ')';
  (cssVars as Record<string, unknown>)[baseZIndexForCells] = computedVisibleColumns.length * 10;

  (cssVars as Record<string, unknown>)[
    pinnedEndOffsetCSSVar
  ] = `calc( var(${bodyWidthCSSVar}) - var(${pinnedEndWidthCSSVar}) - var(${scrollbarWidthVertical}) )`;

  (cssVars as Record<string, unknown>)[bodyWidthCSSVar] = `${bodySize.width}px`;

  (cssVars as Record<string, unknown>)[bodyHeightCSSVar] = `${bodySize.height}px`;

  return cssVars;
}
