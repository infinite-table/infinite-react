import { useEffect } from 'react';

import { usePrevious } from '../../hooks/usePrevious';
import { getCellContext } from '../components/InfiniteTableRow/columnRendering';
import { InfiniteTableState } from '../types';

import {
  useInfiniteTableSelector,
  useInfiniteTableStableContext,
} from './useInfiniteTableSelector';
import { InfiniteTableStableContextValue } from '../types/InfiniteTableContextValue';

function useOnEditCancelled<T>() {
  const context = useInfiniteTableStableContext<T>();

  const { getState, editingCell } = useInfiniteTableSelector((ctx) => {
    return {
      getState: ctx.getState as () => InfiniteTableState<T>,
      editingCell: ctx.state.editingCell,
    };
  });

  const cancelled =
    editingCell && !editingCell.active ? editingCell.cancelled : undefined;

  useEffect(() => {
    if (cancelled) {
      const { rowIndex, columnId, initialValue } = getState().editingCell!;
      const { onEditCancelled } = getState();

      onEditCancelled?.({
        ...getCellContext({
          rowIndex,
          columnId,
          ...context,
        }),
        initialValue,
      });
    }
  }, [cancelled]);
}

function useOnEditRejected<T>() {
  const context: InfiniteTableStableContextValue<T> =
    useInfiniteTableStableContext<T>();

  const { getState, editingCell } = useInfiniteTableSelector((ctx) => {
    return {
      getState: ctx.getState as () => InfiniteTableState<T>,
      editingCell: ctx.state.editingCell,
    };
  });

  const rejected =
    editingCell && !editingCell.active && editingCell.accepted instanceof Error
      ? editingCell.accepted
      : undefined;

  useEffect(() => {
    if (rejected) {
      const { rowIndex, columnId, value, initialValue } =
        getState().editingCell!;
      const { onEditRejected } = getState();

      onEditRejected?.({
        ...getCellContext({
          rowIndex,
          columnId,
          ...context,
        }),
        value,
        error: rejected,
        initialValue,
      });
    }
  }, [rejected]);
}

function useFocusOnEditStop<T>() {
  const context: InfiniteTableStableContextValue<T> =
    useInfiniteTableStableContext<T>();

  const { editingCell } = useInfiniteTableSelector((ctx) => {
    return {
      editingCell: ctx.state.editingCell,
    };
  });

  const active = editingCell?.active;
  const prevActive = usePrevious(active);

  useEffect(() => {
    if (!active && prevActive) {
      context.api.focus();
    }
  }, [active, prevActive]);
}

function useOnEditAccepted<T>() {
  const context: InfiniteTableStableContextValue<T> =
    useInfiniteTableStableContext<T>();

  const { editingCell, getState } = useInfiniteTableSelector((ctx) => {
    return {
      editingCell: ctx.state.editingCell,
      getState: ctx.getState as () => InfiniteTableState<T>,
    };
  });

  const accepted =
    editingCell &&
    !editingCell.active &&
    !editingCell.cancelled &&
    editingCell.accepted === true;

  useEffect(() => {
    if (accepted) {
      const { editingCell } = getState();

      const { value, rowIndex, columnId, initialValue } = editingCell!;
      const editParams = {
        ...getCellContext<T>({
          rowIndex,
          columnId,
          ...context,
        }),
        value,
        initialValue,
      };
      getState().onEditAccepted?.(editParams);

      context.api.persistEdit({ value });
    }
  }, [accepted]);
}

function useOnEditPersisted<T>() {
  const context: InfiniteTableStableContextValue<T> =
    useInfiniteTableStableContext<T>();

  const { editingCell, getState } = useInfiniteTableSelector((ctx) => {
    return {
      editingCell: ctx.state.editingCell,
      getState: ctx.getState as () => InfiniteTableState<T>,
    };
  });

  const persisted = editingCell ? editingCell.persisted : undefined;

  useEffect(() => {
    if (persisted) {
      const { editingCell, onEditPersistError, onEditPersistSuccess } =
        getState();
      if (!editingCell) {
        return;
      }

      const { rowIndex, columnId, value, initialValue } = editingCell;

      const params = {
        ...getCellContext<T>({
          rowIndex,
          columnId,
          ...context,
        }),
        value,
        initialValue,
      };
      if (persisted instanceof Error) {
        onEditPersistError?.({ ...params, error: persisted });
      } else {
        onEditPersistSuccess?.(params);
      }
    }
  }, [persisted]);
}

export function useEditingCallbackProps<T>() {
  useOnEditCancelled<T>();
  useOnEditRejected<T>();

  useOnEditAccepted<T>();
  useOnEditPersisted<T>();

  useFocusOnEditStop<T>();
}
