import type { KeyboardEvent, MouseEvent } from 'react';
import { useCallback, useMemo, useEffect } from 'react';
import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSource';
import { CellPosition } from '../../types/CellPosition';
import { cloneRowSelection } from '../api/getSelectionApi';
import { useInfiniteTable } from '../hooks/useInfiniteTable';
import { InfiniteTableEventHandlerContext } from './eventHandlerTypes';
import { onCellClick } from './onCellClick';
import { onKeyDown } from './onKeyDown';

function useEventHandlersContext<T>() {
  const {
    getState,
    actions: actions,
    api,
    getComputed,
  } = useInfiniteTable<T>();
  const {
    getState: getDataSourceState,
    componentActions: dataSourceActions,
    api: dataSourceApi,
  } = useDataSourceContextValue<T>();

  const context = useMemo(() => {
    const context: InfiniteTableEventHandlerContext<T> = {
      getComputed,
      dataSourceApi,
      api,
      getState,
      actions,
      getDataSourceState,
      dataSourceActions,
      cloneRowSelection: (rowSelection) => {
        return cloneRowSelection<T>(rowSelection, getDataSourceState);
      },
    };
    return context;
  }, [
    getState,
    actions,
    getDataSourceState,
    dataSourceActions,
    api,
    dataSourceApi,
    getComputed,
  ]);

  return context;
}

function handleDOMEvents<T>() {
  const context = useEventHandlersContext<T>();

  useEffect(() => {
    const removeOnKeyDown = context.getState().keyDown.onChange((event) => {
      onKeyDown(context, event!);
    });

    function cellClickHandler(
      cellClickParam: (CellPosition & { event: MouseEvent<Element> }) | null,
    ) {
      if (!cellClickParam) {
        return;
      }
      const event = cellClickParam.event;

      onCellClick(
        {
          ...context,
          rowIndex: cellClickParam.rowIndex,
          colIndex: cellClickParam.colIndex,
        },
        { ...event, key: '' },
      );
    }
    const removeOnCellClick = context
      .getState()
      .cellClick.onChange(cellClickHandler);

    return () => {
      removeOnKeyDown();
      removeOnCellClick();
    };
  }, []);
}

function subscribeToDOMEvents<T>() {
  const { getState } = useInfiniteTable<T>();

  const onKeyDown = useCallback((event: KeyboardEvent<Element>) => {
    getState().keyDown(event);
  }, []);

  return { onKeyDown };
}

export function useDOMEventHandlers<T>() {
  handleDOMEvents<T>();
  return subscribeToDOMEvents<T>();
}
