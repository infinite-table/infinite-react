import { useEffect } from 'react';

import { usePrevious } from '../../hooks/usePrevious';
import { InfiniteTableState } from '../types';
import {
  getEditingCellContext,
  warnEditedRowGone,
} from '../utils/getEditingCellContext';

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
      const { onEditCancelled } = getState();
      const editingCell = getState().editingCell!;

      if (!onEditCancelled) {
        return;
      }

      const cellContext = getEditingCellContext(context, editingCell);
      if (!cellContext) {
        warnEditedRowGone('onEditCancelled', editingCell);
        return;
      }

      onEditCancelled({
        ...cellContext,
        initialValue: editingCell.initialValue,
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
      const { onEditRejected } = getState();
      const editingCell = getState().editingCell!;

      if (!onEditRejected) {
        return;
      }

      const cellContext = getEditingCellContext(context, editingCell);
      if (!cellContext) {
        warnEditedRowGone('onEditRejected', editingCell);
        return;
      }

      onEditRejected({
        ...cellContext,
        value: editingCell.value,
        error: rejected,
        initialValue: editingCell.initialValue,
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
      const { onEditAccepted } = getState();
      const editingCell = getState().editingCell!;
      const { value, initialValue } = editingCell;

      if (onEditAccepted) {
        const cellContext = getEditingCellContext(context, editingCell);
        if (cellContext) {
          onEditAccepted({ ...cellContext, value, initialValue });
        } else {
          warnEditedRowGone('onEditAccepted', editingCell);
        }
      }

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

      const callbackName =
        persisted instanceof Error
          ? 'onEditPersistError'
          : 'onEditPersistSuccess';
      if (!getState()[callbackName]) {
        return;
      }

      const cellContext = getEditingCellContext(context, editingCell);
      if (!cellContext) {
        warnEditedRowGone(callbackName, editingCell);
        return;
      }

      const params = {
        ...cellContext,
        value: editingCell.value,
        initialValue: editingCell.initialValue,
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
