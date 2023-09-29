import type { KeyboardEvent, MouseEvent } from 'react';
import { useCallback, useMemo, useEffect } from 'react';
import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSource';
import { CellPositionByIndex } from '../../types/CellPositionByIndex';
import { getColumnApiForColumn } from '../api/getColumnApi';
import { cloneRowSelection } from '../api/getRowSelectionApi';
import { useInfiniteTable } from '../hooks/useInfiniteTable';
import { InfiniteTableEventHandlerContext } from './eventHandlerTypes';
import { onCellClick } from './onCellClick';
import { onCellMouseDown } from './onCellMouseDown';
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
      cellClickParam:
        | (CellPositionByIndex & { event: MouseEvent<Element> })
        | null,
    ) {
      if (!cellClickParam) {
        return;
      }
      const event = cellClickParam.event;

      const column =
        context.getComputed().computedVisibleColumns[cellClickParam.colIndex];
      const columnApi = getColumnApiForColumn(column.id, context)!;

      onCellClick(
        {
          ...context,
          rowIndex: cellClickParam.rowIndex,
          colIndex: cellClickParam.colIndex,
          column,
          columnApi,
        },
        { ...event, key: '' },
      );
    }
    const removeOnCellClick = context
      .getState()
      .cellClick.onChange(cellClickHandler);

    function cellMouseDownHandler(
      param: (CellPositionByIndex & { event: MouseEvent<Element> }) | null,
    ) {
      if (!param) {
        return;
      }

      const { event, rowIndex, colIndex } = param;

      const column = context.getComputed().computedVisibleColumns[colIndex];
      const columnApi = getColumnApiForColumn(column.id, context)!;

      onCellMouseDown(
        { ...context, rowIndex, colIndex, column, columnApi },
        event,
      );
    }

    const removeOnCellMouseDown = context
      .getState()
      .cellMouseDown.onChange(cellMouseDownHandler);

    return () => {
      removeOnKeyDown();
      removeOnCellClick();
      removeOnCellMouseDown();
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
