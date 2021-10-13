import { useCallback, useEffect, useMemo, useRef } from 'react';

import type { MutableRefObject, Ref } from 'react';

import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSource';
import { useLatest } from '../../hooks/useLatest';
import { getScrollbarWidth } from '../../utils/getScrollbarWidth';

import { useUnpinnedRendering } from './useUnpinnedRendering';

import type {
  InfiniteTableComputedValues,
  InfiniteTableImperativeApi,
  InfiniteTablePropColumnOrder,
  InfiniteTablePropColumnVisibility,
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
  getComputed: () => InfiniteTableComputedValues<T> | undefined;
};

import { shallowEqualObjects } from '../../../utils/shallowEqualObjects';
import { useInfiniteTable } from './useInfiniteTable';
import type { VirtualBrain } from '../../VirtualBrain';
import { GroupRowsState } from '../../DataSource';

type ListRenderingResult = {
  scrollbars: { vertical: boolean; horizontal: boolean };

  horizontalVirtualBrain: VirtualBrain;
  verticalVirtualBrain: VirtualBrain;
  applyScrollHorizontal: ({ scrollLeft }: { scrollLeft: number }) => void;
  applyScrollVertical: ({ scrollTop }: { scrollTop: number }) => void;
  pinnedStartList: JSX.Element | null;
  pinnedEndList: JSX.Element | null;
  pinnedStartScrollbarPlaceholder: JSX.Element | null;
  pinnedEndScrollbarPlaceholder: JSX.Element | null;
  centerList: JSX.Element | null;
  repaintId: number;
  reservedContentHeight: number;
};

export function useListRendering<T>(
  param: ListRenderingParam<T>,
): ListRenderingResult {
  const { computed, domRef, bodySize, columnShifts } = param;

  const { componentActions, componentState, getState } = useInfiniteTable<T>();

  const prevComputed = usePrevious(computed, null);

  const {
    computedPinnedStartColumns,
    computedPinnedEndColumns,
    computedPinnedStartColumnsWidth,
    computedPinnedEndColumnsWidth,
    computedPinnedStartWidth,
    computedPinnedEndWidth,
    computedUnpinnedColumns,
    computedUnpinnedColumnsWidth,
    computedPinnedStartOverflow,
    computedPinnedEndOverflow,
  } = computed;

  const { componentState: dataSourceState, getState: getDataSourceState } =
    useDataSourceContextValue<T>();

  const { dataArray } = dataSourceState;

  const getData = useLatest(dataArray);
  const {
    rowHeightComputed: rowHeight,
    pinnedStartMaxWidth,
    pinnedEndMaxWidth,
    pinnedStartScrollListener,
    pinnedEndScrollListener,
  } = componentState;
  const prevDataSourceTimestamp = usePrevious(dataSourceState.updatedAt);
  const repaintIdRef = useRef<number>(0);

  if (
    !shallowEqualObjects(prevComputed, computed) ||
    prevDataSourceTimestamp !== dataSourceState.updatedAt
  ) {
    repaintIdRef.current++;
  }
  const repaintId = repaintIdRef.current;

  const { horizontalVirtualBrain, verticalVirtualBrain } = useYourBrain({
    computedPinnedStartWidth: computed.computedPinnedStartWidth,
    computedPinnedEndWidth: computed.computedPinnedEndWidth,
    computedUnpinnedColumns: computed.computedUnpinnedColumns,
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

    const { onReady } = getState();

    if (onReady) {
      const imperativeApi: InfiniteTableImperativeApi<T> = {
        setColumnOrder: (columnOrder: InfiniteTablePropColumnOrder) => {
          componentActions.columnOrder = columnOrder;
        },
        setColumnVisibility: (
          columnVisibility: InfiniteTablePropColumnVisibility,
        ) => {
          componentActions.columnVisibility = columnVisibility;
        },
        setColumnAggregations: (
          columnAggregations: InfiniteTablePropColumnAggregations<T>,
        ) => (componentActions.columnAggregations = columnAggregations),
        getState,
        getDataSourceState,
      };

      onReady(imperativeApi);
    }
  }, [!!bodySize.height]);

  const { applyScrollHorizontal, applyScrollVertical } = useOnContainerScroll({
    verticalVirtualBrain,
    horizontalVirtualBrain,
    domRef: domRef as MutableRefObject<HTMLDivElement | null>,
  });

  const { componentActions: dataSourceActions } =
    useDataSourceContextValue<T>();

  const toggleGroupRow = useCallback((groupKeys: any[]) => {
    const newState = new GroupRowsState(getDataSourceState().groupRowsState);
    newState.toggleGroupRow(groupKeys);

    dataSourceActions.groupRowsState = newState;
  }, []);

  const pinnedRenderingParams = {
    bodySize,
    scrollbars,
    computedPinnedStartColumns,
    computedPinnedEndColumns,
    computedPinnedStartWidth,
    computedPinnedEndWidth,
    computedPinnedStartOverflow,
    computedPinnedEndOverflow,
    computedPinnedStartColumnsWidth,
    computedPinnedEndColumnsWidth,
    getData,
    getState,
    toggleGroupRow,
    pinnedStartMaxWidth,
    pinnedEndMaxWidth,
    repaintId,
    rowHeight,
    verticalVirtualBrain,
    pinnedStartScrollListener,
    pinnedEndScrollListener,
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
