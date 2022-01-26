import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { LazyGroupDataItem } from '..';
import { DeepMap } from '../../../utils/DeepMap';
import { LAZY_ROOT_KEY_FOR_GROUPS } from '../../../utils/groupAndPivot';

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
  DataSourceDataParamsChanges,
} from '../types';

const SKIP_DATA_CHANGES_KEYS = {
  originalDataArray: true,
  changes: true,
};

export function buildDataSourceDataParams<T>(
  componentState: DataSourceState<T>,
  overrides?: Partial<DataSourceDataParams<T>>,
): DataSourceDataParams<T> {
  const sortInfo = componentState.multiSort
    ? componentState.sortInfo
    : componentState.sortInfo?.[0] ?? null;

  const dataSourceParams: DataSourceDataParams<T> = {
    originalDataArray: componentState.originalDataArray,
    sortInfo,
    groupBy: componentState.groupBy,
    pivotBy: componentState.pivotBy,
    aggregationReducers: componentState.aggregationReducers,
  };

  if (componentState.livePagination !== undefined) {
    dataSourceParams.livePaginationCursor = componentState.livePaginationCursor;
    dataSourceParams.cursorId = componentState.cursorId;
  }

  if (componentState.fullLazyLoad) {
    dataSourceParams.lazyLoadBatchSize = componentState.lazyLoadBatchSize;
    dataSourceParams.groupKeys = [];
  }

  if (overrides) {
    Object.assign(dataSourceParams, overrides);
  }

  const changes: DataSourceDataParamsChanges<T> = {};

  const oldDataSourceParams: Partial<DataSourceDataParams<T>> =
    componentState.dataParams || {};

  for (let k in dataSourceParams) {
    //@ts-ignore
    if (dataSourceParams.hasOwnProperty(k) && !SKIP_DATA_CHANGES_KEYS[k]) {
      const key = k as keyof DataSourceDataParams<T>;
      if (dataSourceParams[key] !== oldDataSourceParams[key]) {
        //@ts-ignore
        changes[key] = true;
      }
    }
  }

  dataSourceParams.changes = changes;

  return dataSourceParams;
}

export function loadData<T>(
  data: DataSourceData<T>,
  componentState: DataSourceState<T>,
  actions: ComponentStateGeneratedActions<DataSourceState<T>>,
  overrides?: Partial<DataSourceDataParams<T>>,
) {
  const dataParams = buildDataSourceDataParams(componentState, overrides);

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
    let skipAssign = false;

    if (Array.isArray((dataParam as DataSourceRemoteData<T>).data)) {
      const remoteData = dataParam as DataSourceRemoteData<T>;
      dataArray = remoteData.data;

      if (remoteData.livePaginationCursor !== undefined) {
        actions.livePaginationCursor = remoteData.livePaginationCursor;
      }
      if (remoteData.mappings) {
        actions.pivotMappings = remoteData.mappings;
      }

      if (componentState.fullLazyLoad && dataParams.groupKeys) {
        const lazyGroupData = DeepMap.clone(
          componentState.originalLazyGroupData,
        );
        const key = [LAZY_ROOT_KEY_FOR_GROUPS, ...dataParams.groupKeys];
        lazyGroupData.set(key, dataArray as any as LazyGroupDataItem<T>[]);
        skipAssign = true;
        actions.originalLazyGroupData = lazyGroupData;
      }
    } else {
      dataArray = dataParam as T[];
    }

    if (!skipAssign) {
      actions.originalDataArray = dataArray;
    }
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
    livePagination,
    livePaginationCursor,
    cursorId: stateCursorId,
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

  useEffect(() => {
    // this is synced with - ref #lvpgn - search in codebase this ref to understand more
    const frameId = requestAnimationFrame(() => {
      if (!scrollbarsRef.current?.vertical && livePaginationCursor) {
        actions.cursorId = livePaginationCursor;
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [livePaginationCursor]);

  useEffect(() => {
    const { livePaginationCursor, livePagination } = getComponentState();
    if (!scrollbars.vertical && livePagination) {
      // it had vertical scroll but now it doesn't

      // updateCursorId(livePaginationCursor);
      if (livePaginationCursor) {
        actions.cursorId = livePaginationCursor;
      }
    }
  }, [scrollbars.vertical]);

  // useEffect(() => {
  //   updateCursorId(stateCursorId);
  // }, [stateCursorId]);

  const depsObject = {
    sortInfo,
    groupBy,
    pivotBy,
    cursorId: livePagination ? stateCursorId : null,
  };

  const initialRef = useRef(true);

  // actions.livePaginationCursor = cursorId;

  // useEffect(() => {
  //   if (livePagination) {
  //     actions.livePaginationCursor = cursorId;
  //   }
  // }, [livePagination, livePagination ? cursorId : null]);

  useEffectWithChanges((_changes, _prevValues) => {
    const componentState = getComponentState();
    if (typeof componentState.data === 'function') {
      loadData(componentState.data, componentState, actions);
    }
    if (initialRef.current) {
      initialRef.current = false;
      actions.dataParams = buildDataSourceDataParams(componentState);
    }
  }, depsObject);
}
