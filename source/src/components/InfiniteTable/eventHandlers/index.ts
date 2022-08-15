import type { KeyboardEvent, MouseEvent } from 'react';
import { useCallback, useMemo, useEffect } from 'react';
import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSource';
import { CellPosition } from '../../types/CellPosition';
import { useInfiniteTable } from '../hooks/useInfiniteTable';
import { InfiniteTableEventHandlerContext } from './eventHandlerTypes';
import { onCellClick } from './onCellClick';
import { onKeyDown } from './onKeyDown';

function useEventHandlersContext<T>() {
  const {
    getState,
    componentActions: actions,
    imperativeApi,
    getComputed,
  } = useInfiniteTable<T>();
  const { getState: getDataSourceState, componentActions: dataSourceActions } =
    useDataSourceContextValue<T>();

  const context = useMemo(() => {
    const context: InfiniteTableEventHandlerContext<T> = {
      getComputed,
      api: imperativeApi,
      getState,
      actions,
      getDataSourceState,
      dataSourceActions,
    };
    return context;
  }, [getState, actions, getDataSourceState, dataSourceActions]);

  return context;
}

function handleDOMEvents<T>() {
  const context = useEventHandlersContext<T>();

  useEffect(() => {
    const removeOnKeyDown = context.getState().keyDown.onChange((event) => {
      onKeyDown(
        {
          ...context,
          key: event!.key,
          metaKey: event!.metaKey,
          ctrlKey: event!.ctrlKey,
          shiftKey: event!.shiftKey,
          preventDefault: () => event!.preventDefault(),
        },
        event!,
      );
    });

    function cellClickHandler(
      cellClickParam: (CellPosition & { event: MouseEvent<Element> }) | null,
    ) {
      if (!cellClickParam) {
        return;
      }
      const event = cellClickParam.event;
      const virtualEvent = {
        metaKey: event.metaKey,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        key: '',
        preventDefault: () => event.preventDefault(),
      };

      onCellClick(
        {
          ...context,
          rowIndex: cellClickParam.rowIndex,
          colIndex: cellClickParam.colIndex,
          ...virtualEvent,
        },
        virtualEvent,
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
