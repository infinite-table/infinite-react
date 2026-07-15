import { FocusEvent, useMemo } from 'react';
import { InfiniteTableClassName } from '..';
import { join } from '../../../utils/join';
import {
  InfiniteCls,
  InfiniteClsHasPinnedEnd,
  InfiniteClsHasPinnedStart,
  InfiniteClsRecipe,
} from '../InfiniteCls.css';
import { InfiniteTableComputedColumn } from '../types';
import { getInfiniteCSSVars } from '../utils/getInfiniteCSSVars';
import { rafFn } from '../utils/rafFn';
import { useInfiniteTableSelector } from './useInfiniteTableSelector';

export { getColumnZIndex } from '../utils/getInfiniteCSSVars';

export function useDOMProps<T>(
  initialDOMProps?: React.HTMLProps<HTMLDivElement>,
) {
  const {
    actions,
    getState,

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
    wrapRowsHorizontally,
    computedPinnedStartColumnsWidth,
    computedPinnedEndColumnsWidth,
    computedPinnedStartColumns,
    computedPinnedEndColumns,
    computedVisibleColumns,
    computedUnpinnedColumnsWidth,
    scrollbars,

    focusedClassName,
    focusedWithinClassName,
    computedPinnedStartOverflow,
    computedPinnedEndOverflow,

    focusedStyle,
    focusedWithinStyle,

    brain,
  } = useInfiniteTableSelector((ctx) => {
    const { state, computed } = ctx;
    return {
      brain: state.brain,
      actions: ctx.actions,
      getState: ctx.getState,
      focused: state.focused,
      focusedWithin: state.focusedWithin,
      domRef: state.domRef,
      scrollerDOMRef: state.scrollerDOMRef,
      onBlurWithin: state.onBlurWithin,
      onFocusWithin: state.onFocusWithin,
      onSelfFocus: state.onSelfFocus,
      onSelfBlur: state.onSelfBlur,
      bodySize: state.bodySize,
      activeCellIndex: state.activeCellIndex,
      wrapRowsHorizontally: state.wrapRowsHorizontally,

      computedPinnedStartColumnsWidth: computed.computedPinnedStartColumnsWidth,
      computedPinnedEndColumnsWidth: computed.computedPinnedEndColumnsWidth,

      computedPinnedStartColumns:
        computed.computedPinnedStartColumns as InfiniteTableComputedColumn<T>[],
      computedPinnedEndColumns:
        computed.computedPinnedEndColumns as InfiniteTableComputedColumn<T>[],

      computedVisibleColumns:
        computed.computedVisibleColumns as InfiniteTableComputedColumn<T>[],

      computedUnpinnedColumnsWidth: computed.computedUnpinnedColumnsWidth,

      scrollbars: computed.scrollbars,

      focusedClassName: ctx.state.focusedClassName,
      focusedWithinClassName: ctx.state.focusedWithinClassName,
      computedPinnedStartOverflow: computed.computedPinnedStartOverflow,
      computedPinnedEndOverflow: computed.computedPinnedEndOverflow,
      focusedStyle: ctx.state.focusedStyle,
      focusedWithinStyle: ctx.state.focusedWithinStyle,
    };
  });

  const cssVars = useMemo(
    () =>
      getInfiniteCSSVars({
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
      }),
    [
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
    ],
  );

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

    wrapRowsHorizontally
      ? `${InfiniteTableClassName}--horizontal-layout`
      : null,
    domProps?.className,
    computedPinnedStartColumnsWidth
      ? `${InfiniteTableClassName}--has-pinned-start ${InfiniteClsHasPinnedStart}`
      : null,
    computedPinnedEndColumnsWidth
      ? `${InfiniteTableClassName}--has-pinned-end  ${InfiniteClsHasPinnedEnd}`
      : null,
    focused ? `${InfiniteTableClassName}--focused` : null,
    focusedWithin ? `${InfiniteTableClassName}--focused-within` : null,

    focused && focusedClassName ? focusedClassName : null,
    focusedWithin && focusedWithinClassName ? focusedWithinClassName : null,
    computedPinnedStartOverflow
      ? `${InfiniteTableClassName}--has-pinned-start-overflow`
      : null,
    computedPinnedEndOverflow
      ? `${InfiniteTableClassName}--has-pinned-end-overflow`
      : null,

    InfiniteClsRecipe({
      horizontalLayout: !!wrapRowsHorizontally,
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
    if (focusedStyle) {
      Object.assign(domProps.style, focusedStyle);
    }
  }
  if (focusedWithin) {
    if (focusedWithinStyle) {
      Object.assign(domProps.style, focusedWithinStyle);
    }
  }

  return domProps;
}
