import { CSSProperties, FocusEvent } from 'react';
import { InfiniteTableClassName } from '..';
import { join } from '../../../utils/join';
import { stripVar } from '../../../utils/stripVar';
import { getScrollbarWidth } from '../../utils/getScrollbarWidth';
import {
  InfiniteCls,
  InfiniteClsHasPinnedEnd,
  InfiniteClsHasPinnedStart,
  InfiniteClsRecipe,
} from '../InfiniteCls.css';
import { InternalVars } from '../internalVars.css';
import { InfiniteTableComputedColumn } from '../types';
import {
  getCSSVarNameForColOffset,
  getCSSVarNameForColWidth,
} from '../utils/infiniteDOMUtils';
import { rafFn } from '../utils/rafFn';
import { ThemeVars } from '../vars.css';
import { useInfiniteTable } from './useInfiniteTable';

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
const columnOffsetAtIndex = stripVar(InternalVars.columnOffsetAtIndex);
const columnZIndexAtIndex = stripVar(InternalVars.columnZIndexAtIndex);
const scrollLeftCSSVar = stripVar(InternalVars.scrollLeft);
// const columnReorderEffectDurationAtIndex = stripVar(
//   InternalVars.columnReorderEffectDurationAtIndex,
// );
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

export function useDOMProps<T>(
  initialDOMProps?: React.HTMLProps<HTMLDivElement>,
) {
  const scrollbarWidth = getScrollbarWidth();

  const { computed, state, actions, getState } = useInfiniteTable<T>();
  const {
    focused,
    focusedWithin,
    domRef,
    scrollerDOMRef,
    onBlurWithin,
    onFocusWithin,
    onSelfFocus,
    onSelfBlur,
    bodySize,
    activeCellIndex,
  } = state;
  const {
    computedPinnedStartColumnsWidth,
    computedPinnedEndColumnsWidth,
    computedPinnedStartColumns,
    computedPinnedEndColumns,
    computedVisibleColumns,
    computedUnpinnedColumnsWidth,
    scrollbars,
  } = computed;

  const prevPinnedEndCols: InfiniteTableComputedColumn<T>[] = [];
  const cssVars: CSSProperties = computedVisibleColumns.reduce(
    (vars: CSSProperties, col) => {
      const index = col.computedVisibleIndex;

      //@ts-ignore
      vars[`${columnWidthAtIndex}-${index}`] = col.computedWidth + 'px';

      //@ts-ignore
      vars[`${columnOffsetAtIndex}-${index}`] =
        col.computedPinned === 'start'
          ? `calc( ${col.computedOffset}px + var(${scrollLeftCSSVar}) )`
          : col.computedPinned === 'end'
          ? // see #startcoloffsets-pinnedend
            `calc( var(${pinnedEndOffsetCSSVar}) ${
              prevPinnedEndCols.length ? '+' : ''
            } ${prevPinnedEndCols
              .map(
                (c) => `var(${columnWidthAtIndex}-${c.computedVisibleIndex})`,
              )
              .join(' + ')} + var(${scrollLeftCSSVar}) )`
          : `${col.computedOffset}px`;

      const zIndexValue = getColumnZIndex(col, {
        pinnedStartColsCount: computedPinnedStartColumns.length,
        visibleColsCount: computedVisibleColumns.length,
      });

      //@ts-ignore
      vars[`${columnZIndexAtIndex}-${index}`] = `${zIndexValue}`;
      //@ts-ignore
      // vars[`${columnReorderEffectDurationAtIndex}-${index}`] = '0s';

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
    //@ts-ignore
    cssVars[
      publicRuntimeVars.browserScrollbarWidth.name
    ] = `${getScrollbarWidth()}px`;
  }

  //@ts-ignore
  cssVars[
    publicRuntimeVars.bodyWidth.name
  ] = `calc(${InternalVars.bodyWidth} - ${InternalVars.scrollbarWidthVertical})`;

  //@ts-ignore
  cssVars[publicRuntimeVars.totalVisibleColumnsWidthValue.name] = `${
    computedPinnedStartColumnsWidth +
    computedPinnedEndColumnsWidth +
    computedUnpinnedColumnsWidth
  }px`;

  //@ts-ignore
  cssVars[
    publicRuntimeVars.totalVisibleColumnsWidthVar.name
  ] = `calc(${computedVisibleColumns
    .map((_col, index) => {
      return `var(${columnWidthAtIndex}-${index})`;
    })
    .join(' + ')})`;

  //@ts-ignore
  cssVars[publicRuntimeVars.visibleColumnsCount.name] =
    computedVisibleColumns.length;

  if (activeCellIndex != null) {
    //@ts-ignore
    cssVars[activeCellColWidth] = `var(${getCSSVarNameForColWidth(
      activeCellIndex[1],
    )})`;
    const defaultActiveCellColOffset = `var(${getCSSVarNameForColOffset(
      activeCellIndex[1],
    )})`;
    if (state.brain.isHorizontalLayoutBrain) {
      const pageIndex = state.brain.getPageIndexForRow(activeCellIndex[0]);

      //@ts-ignore
      cssVars[activeCellColOffset] = pageIndex
        ? `calc( ${ThemeVars.runtime.totalVisibleColumnsWidthVar} * ${pageIndex} + ${defaultActiveCellColOffset})`
        : defaultActiveCellColOffset;
    } else {
      //@ts-ignore
      cssVars[activeCellColOffset] = defaultActiveCellColOffset;
    }
  }

  //@ts-ignore
  cssVars[computedVisibleColumnsCountCSSVar] = computedVisibleColumns.length;

  //@ts-ignore
  cssVars[scrollbarWidthHorizontal] = scrollbars.horizontal
    ? `${scrollbarWidth}px`
    : '0px';
  //@ts-ignore
  cssVars[scrollbarWidthVertical] = scrollbars.vertical
    ? `${scrollbarWidth}px`
    : '0px';
  //@ts-ignore
  cssVars[pinnedStartWidthCSSVar] =
    `calc( ` +
    computedPinnedStartColumns
      .map((c) => `var(${getCSSVarNameForColWidth(c.computedVisibleIndex)})`)
      .join(' + ') +
    ')';

  //@ts-ignore
  cssVars[pinnedEndWidthCSSVar] =
    `calc( ` +
    computedPinnedEndColumns
      .map((c) => `var(${getCSSVarNameForColWidth(c.computedVisibleIndex)})`)
      .join(' + ') +
    ')';
  //@ts-ignore
  cssVars[baseZIndexForCells] = computedVisibleColumns.length * 10;

  //@ts-ignore
  cssVars[
    pinnedEndOffsetCSSVar
  ] = `calc( var(${bodyWidthCSSVar}) - var(${pinnedEndWidthCSSVar}) - var(${scrollbarWidthVertical}) )`;

  //@ts-ignore
  cssVars[bodyWidthCSSVar] = `${bodySize.width}px`;

  //@ts-ignore
  cssVars[bodyHeightCSSVar] = `${bodySize.height}px`;

  const setFocused = rafFn((focused: boolean) => {
    actions.focused = focused;
  });
  const setFocusedWithin = rafFn((focused: boolean) => {
    actions.focusedWithin = focused;
  });

  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    initialDOMProps?.onFocus?.(event);

    if (
      event.target === domRef.current ||
      event.target === scrollerDOMRef.current
    ) {
      if (getState().focused) {
        return;
      }
      setFocused(true);
      onSelfFocus?.(event);

      if (focusedWithin) {
        setFocusedWithin(false);
        onBlurWithin?.(event);
      }
      return;
    }
    if (!focusedWithin) {
      setFocusedWithin(true);
      onFocusWithin?.(event);
    }
  };

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    initialDOMProps?.onBlur?.(event);

    if (
      event.target === domRef.current ||
      event.target === scrollerDOMRef.current
    ) {
      if (!getState().focused) {
        return;
      }
      setFocused(false);
      onSelfBlur?.(event);

      if (focusedWithin) {
        setFocusedWithin(false);
        onBlurWithin?.(event);
      }
      return;
    }
    const contained = domRef.current?.contains((event as any).relatedTarget);

    if (!contained) {
      setFocusedWithin(false);
      onBlurWithin?.(event);
    }
  };

  const domProps = {
    ...initialDOMProps,
    onFocus,
    onBlur,
  };

  const className = join(
    InfiniteTableClassName,
    InfiniteCls,

    domProps?.className,
    computedPinnedStartColumnsWidth
      ? `${InfiniteTableClassName}--has-pinned-start ${InfiniteClsHasPinnedStart}`
      : null,
    computedPinnedEndColumnsWidth
      ? `${InfiniteTableClassName}--has-pinned-end  ${InfiniteClsHasPinnedEnd}`
      : null,
    focused ? `${InfiniteTableClassName}--focused` : null,
    focusedWithin ? `${InfiniteTableClassName}--focused-within` : null,

    focused && state.focusedClassName ? state.focusedClassName : null,
    focusedWithin && state.focusedWithinClassName
      ? state.focusedWithinClassName
      : null,
    computed.computedPinnedStartOverflow
      ? `${InfiniteTableClassName}--has-pinned-start-overflow`
      : null,
    computed.computedPinnedEndOverflow
      ? `${InfiniteTableClassName}--has-pinned-end-overflow`
      : null,

    InfiniteClsRecipe({
      hasPinnedStart: !!computedPinnedStartColumnsWidth,
      hasPinnedEnd: !!computedPinnedEndColumnsWidth,
      // hasPinnedStartOverflow: !!computed.computedPinnedStartOverflow,
      // hasPinnedEndOverflow: !!computed.computedPinnedEndOverflow,
      focused,
      focusedWithin,
    }),
  );

  domProps.className = className;

  domProps.style = {
    ...initialDOMProps?.style,
    ...cssVars,
  };
  if (focused) {
    if (state.focusedStyle) {
      Object.assign(domProps.style, state.focusedStyle);
    }
  }
  if (focusedWithin) {
    if (state.focusedWithinStyle) {
      Object.assign(domProps.style, state.focusedWithinStyle);
    }
  }

  return domProps;
}
