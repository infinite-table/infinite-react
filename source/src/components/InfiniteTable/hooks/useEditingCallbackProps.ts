import { useEffect } from 'react';

import { usePrevious } from '../../hooks/usePrevious';
import { getCellContext } from '../components/InfiniteTableRow/columnRendering';
import { InfiniteTableContextValue } from '../types';

import { useInfiniteTable } from './useInfiniteTable';

function useOnEditCancelled<T>() {
  const context = useInfiniteTable<T>();

  const { getState } = context;
  const { editingCell } = getState();

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
  const context: InfiniteTableContextValue<T> = useInfiniteTable<T>();

  const {
    getState,
    state: { editingCell },
  } = context;

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
  const context: InfiniteTableContextValue<T> = useInfiniteTable<T>();

  const {
    state: { editingCell },
  } = context;

  const active = editingCell?.active;
  const prevActive = usePrevious(active);

  useEffect(() => {
    if (!active && prevActive) {
      context.api.focus();
    }
  }, [active, prevActive]);
}

function useOnEditAccepted<T>() {
  const context: InfiniteTableContextValue<T> = useInfiniteTable<T>();

  const {
    state: { editingCell },
    getState,
  } = context;

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
  const context: InfiniteTableContextValue<T> = useInfiniteTable<T>();

  const {
    state: { editingCell },
    getState,
  } = context;

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
