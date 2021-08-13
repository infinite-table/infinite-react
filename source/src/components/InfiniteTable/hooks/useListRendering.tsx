import { useEffect, useMemo, useRef } from 'react';

import type { MutableRefObject, Ref } from 'react';

import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSource';
import { useLatest } from '../../hooks/useLatest';
import { getScrollbarWidth } from '../../utils/getScrollbarWidth';

import { useUnpinnedRendering } from './useUnpinnedRendering';
import { InfiniteTableActions } from '../state/getReducerActions';

import type {
  InfiniteTableComputedValues,
  InfiniteTableImperativeApi,
  InfiniteTablePropColumnOrder,
  InfiniteTablePropColumnVisibility,
  InfiniteTableOwnProps,
} from '../types';
import type { Size } from '../../types/Size';

import { useOnContainerScroll } from './useOnContainerScroll';
import {
  usePinnedEndRendering,
  usePinnedStartRendering,
} from './usePinnedRendering';
import { useYourBrain } from './useYourBrain';
import { useRerender } from '../../hooks/useRerender';
import { InfiniteTablePropColumnAggregations } from '../types/InfiniteTableProps';
import { usePrevious } from '../../hooks/usePrevious';

type ListRenderingParam<T> = {
  computed: InfiniteTableComputedValues<T>;
  domRef: Ref<HTMLElement>;

  bodySize: Size;
  columnShifts: number[] | null;
  getProps: () => InfiniteTableOwnProps<T>;
  getActions: () => InfiniteTableActions<T>;
  getComputed: () => InfiniteTableComputedValues<T> | undefined;
};

import { shallowEqualObjects } from '../../../utils/shallowEqualObjects';

export function useListRendering<T>(param: ListRenderingParam<T>) {
  const { computed, domRef, bodySize, columnShifts, getActions, getProps } =
    param;

  const prevComputed = usePrevious(computed, null);

  const {
    computedPinnedStartColumns,
    computedPinnedEndColumns,
    computedPinnedStartColumnsWidth,
    computedPinnedEndColumnsWidth,
    computedUnpinnedColumns,
    computedUnpinnedColumnsWidth,
  } = computed;

  const { componentState: dataSourceState } = useDataSourceContextValue<T>();

  const { dataArray } = dataSourceState;

  const getData = useLatest(dataArray);
  const { rowHeight } = getProps();
  const repaintIdRef = useRef<number>(0);

  // IT's very important to only increment the repaint id when computed changes
  //
  // THUS, the computed will generally not contain any properties directly from props
  // but things in computed should generally come from `useProperty` hook
  if (!shallowEqualObjects(prevComputed, computed)) {
    repaintIdRef.current++;
  }
  const repaintId = repaintIdRef.current;

  const { horizontalVirtualBrain, verticalVirtualBrain } = useYourBrain({
    computedUnpinnedColumns: computed.computedUnpinnedColumns,
    computedPinnedStartColumnsWidth: computed.computedPinnedStartColumnsWidth,
    computedPinnedEndColumnsWidth: computed.computedPinnedEndColumnsWidth,
    rowHeight,
    dataArray,
    bodySize,
  });

  const hasHorizontalScrollbar =
    computedUnpinnedColumnsWidth >
    bodySize.width -
      computedPinnedStartColumnsWidth -
      computedPinnedEndColumnsWidth;

  const reservedContentHeight =
    verticalVirtualBrain.getTotalSize() +
    (hasHorizontalScrollbar ? getScrollbarWidth() : 0);

  const hasVerticalScrollbar = bodySize.height < reservedContentHeight;

  const scrollbars = useMemo(
    () => ({
      vertical: hasVerticalScrollbar,
      horizontal: hasHorizontalScrollbar,
    }),
    [hasVerticalScrollbar, hasHorizontalScrollbar],
  );

  useEffect(() => {
    if (!bodySize.height) {
      return;
    }

    const props = getProps();

    if (props.onReady) {
      const imperativeApi: InfiniteTableImperativeApi<T> = {
        setColumnOrder: (columnOrder: InfiniteTablePropColumnOrder) =>
          getActions().setColumnOrder(columnOrder),
        setColumnVisibility: (
          columnVisibility: InfiniteTablePropColumnVisibility,
        ) => getActions().setColumnVisibility(columnVisibility),
        setColumnAggregations: (
          columnAggregations: InfiniteTablePropColumnAggregations<T>,
        ) => getActions().setColumnAggregations(columnAggregations),
      };

      props.onReady(imperativeApi);
    }
  }, [!!bodySize.height]);

  const { applyScrollHorizontal, applyScrollVertical } = useOnContainerScroll({
    verticalVirtualBrain,
    horizontalVirtualBrain,
    domRef: domRef as MutableRefObject<HTMLDivElement | null>,
  });

  const pinnedRenderingParams = {
    bodySize,
    scrollbars,
    computedPinnedStartColumns,
    computedPinnedEndColumns,
    computedPinnedStartColumnsWidth,
    computedPinnedEndColumnsWidth,
    getData,
    getProps,
    repaintId,
    rowHeight,
    verticalVirtualBrain,
  };

  const centerRenderingParams = {
    ...pinnedRenderingParams,
    columnShifts,
    applyScrollHorizontal,
    horizontalVirtualBrain,
    computedUnpinnedColumnsWidth,
    computedUnpinnedColumns,
  };

  const [, rerender] = useRerender();
  useEffect(() => {
    rerender();
  }, [dataSourceState]);

  const { pinnedStartList, pinnedStartScrollbarPlaceholder } =
    usePinnedStartRendering<T>(pinnedRenderingParams);

  const { pinnedEndList, pinnedEndScrollbarPlaceholder } =
    usePinnedEndRendering<T>(pinnedRenderingParams);

  const centerList = useUnpinnedRendering(centerRenderingParams);

  return {
    scrollbars,

    horizontalVirtualBrain,
    verticalVirtualBrain,
    applyScrollHorizontal,
    applyScrollVertical,
    pinnedStartList,
    pinnedEndList,
    pinnedStartScrollbarPlaceholder,
    pinnedEndScrollbarPlaceholder,
    centerList,
    repaintId,
    reservedContentHeight,
  };
}
