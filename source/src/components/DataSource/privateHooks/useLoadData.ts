import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { dbg } from '../../../utils/debug';

import {
  ComponentStateGeneratedActions,
  useComponentState,
} from '../../hooks/useComponentState';
import { useEffectWithChanges } from '../../hooks/useEffectWithChanges';

import { Scrollbars } from '../../InfiniteTable';
import {
  DataSourceDataParams,
  DataSourceData,
  DataSourceState,
  DataSourceRemoteData,
  DataSourceLivePaginationCursorValue,
  DataSourceDataParamsChanges,
} from '../types';

const debug = dbg('DataSource:useLoadData');

function anonimizeValues(arg: Record<string, any>) {
  const result: Record<string, true> = {};

  for (var k in arg)
    if (arg.hasOwnProperty(k)) {
      result[k] = true;
    }

  return result;
}

export function buildDataSourceDataParams<T>(
  componentState: DataSourceState<T>,
  changes?: DataSourceDataParamsChanges<T>,
): DataSourceDataParams<T> {
  const sortInfo = componentState.multiSort
    ? componentState.sortInfo
    : componentState.sortInfo?.[0] ?? null;

  const dataSourceParams: DataSourceDataParams<T> = {
    originalDataArray: componentState.originalDataArray,
    sortInfo,
    groupBy: componentState.groupBy,
    pivotBy: componentState.pivotBy,
  };

  if (componentState.livePagination !== undefined) {
    dataSourceParams.livePaginationCursor = componentState.livePaginationCursor;
  }

  if (changes !== undefined) {
    dataSourceParams.changes = changes;
  }

  return dataSourceParams;
}

function notifyDataParamsChanged<T>(
  componentState: DataSourceState<T>,
  actions: ComponentStateGeneratedActions<DataSourceState<T>>,
  changes?: DataSourceDataParamsChanges<T>,
) {
  if (typeof componentState.data === 'function') {
    loadData(componentState.data, componentState, actions);
  }

  const dataParams = buildDataSourceDataParams(componentState, changes);

  componentState.onDataParamsChange?.(dataParams);
}

function loadData<T>(
  data: DataSourceData<T>,
  componentState: DataSourceState<T>,
  actions: ComponentStateGeneratedActions<DataSourceState<T>>,
) {
  const dataParams = buildDataSourceDataParams(componentState);

  if (typeof data === 'function') {
    data = data(dataParams);
  }

  const dataIsPromise =
    //@ts-ignore
    typeof data === 'object' && typeof data.then === 'function';

  if (dataIsPromise) {
    actions.loading = true;
  }
  Promise.resolve(data).then((dataParam) => {
    // dataParam can either be an array or an object with a `data` array property
    let dataArray: T[] = [] as T[];

    if (Array.isArray((dataParam as DataSourceRemoteData<T>).data)) {
      const remoteData = dataParam as DataSourceRemoteData<T>;
      dataArray = remoteData.data;

      if (remoteData.livePaginationCursor !== undefined) {
        actions.livePaginationCursor = remoteData.livePaginationCursor;
      }
    } else {
      dataArray = dataParam as T[];
    }

    actions.originalDataArray = dataArray;
    if (dataIsPromise) {
      actions.loading = false;
    }
  });
}

export function useLoadData<T>() {
  const {
    getComponentState,
    componentActions: actions,
    componentState: { data },
  } = useComponentState<DataSourceState<T>>();

  useLayoutEffect(() => {
    loadData(data, getComponentState(), actions);
  }, [data]);

  useLivePagination();
}

export function useLivePagination<T>() {
  const {
    getComponentState,
    componentActions: actions,
    componentState,
  } = useComponentState<DataSourceState<T>>();

  const {
    notifyScrollbarsChange,
    sortInfo,
    groupBy,
    pivotBy,
    livePaginationCursor,
    scrollBottomId,
  } = componentState;

  const [scrollbars, setScrollbars] = useState<Scrollbars>({
    vertical: false,
    horizontal: false,
  });

  const scrollbarsRef = useRef<Scrollbars>(scrollbars);

  useEffect(() => {
    notifyScrollbarsChange.onChange((scrollbars: Scrollbars | null) => {
      if (!scrollbars) {
        return;
      }

      scrollbarsRef.current = scrollbars;
      setScrollbars(scrollbars);
    });
    return () => notifyScrollbarsChange.destroy();
  }, [notifyScrollbarsChange]);

  const [cursorId, updateCursorId] = useState<
    | undefined
    | DataSourceLivePaginationCursorValue
    | DataSourceState<T>['scrollBottomId']
  >(undefined);

  useEffect(() => {
    // this is synced with - ref #lvpgn - search in codebase this ref to understand more
    const frameId = requestAnimationFrame(() => {
      if (!scrollbarsRef.current?.vertical) {
        updateCursorId(livePaginationCursor);
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [livePaginationCursor]);

  useEffect(() => {
    const { livePaginationCursor, livePagination } = getComponentState();
    if (!scrollbars.vertical && livePagination) {
      // it had vertical scroll but now it doesn't
      updateCursorId(livePaginationCursor);
    }
  }, [scrollbars.vertical]);

  useEffect(() => {
    updateCursorId(scrollBottomId);
  }, [scrollBottomId]);

  const depsObject = {
    sortInfo,
    groupBy,
    pivotBy,
    livePaginationCursor: cursorId,
  };

  useEffectWithChanges((changes, prevValues) => {
    if (cursorId === undefined) {
      // discard initial
      return;
    }

    debug(
      'onDataParamsChange triggered because the following values have changed',
      changes,
      'old values',
      prevValues,
    );

    notifyDataParamsChanged(
      getComponentState(),
      actions,
      anonimizeValues(changes),
    );
  }, depsObject);
}
