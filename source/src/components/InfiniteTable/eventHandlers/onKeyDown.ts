import type { KeyboardEvent } from 'react';
import { handleKeyboardNavigation } from './keyboardNavigation';
import { InfiniteTableKeyboardEventHandlerContext } from './eventHandlerTypes';
import { handleKeyboardSelection } from './keyboardSelection';
import { cloneRowSelection } from '../api/getRowSelectionApi';
import { handleBrowserFocusChangeOnKeyboardNavigation } from './handleBrowserFocusChangeOnKeyboardNavigation';
import { eventMatchesKeyboardShortcut } from '../../utils/hotkey';
import { cloneTreeSelection } from '../../DataSource/TreeApi';
import { InfiniteTablePropOnKeyDownResult } from '../types/InfiniteTableProps';

export async function onKeyDown<T>(
  context: InfiniteTableKeyboardEventHandlerContext<T>,
  event: KeyboardEvent<Element>,
) {
  const keyboardHandlerContext: InfiniteTableKeyboardEventHandlerContext<T> = {
    ...context,
    cloneRowSelection: (rowSelection) => {
      return cloneRowSelection<T>(rowSelection, context.getDataSourceState);
    },
    cloneTreeSelection: (treeSelection) => {
      return cloneTreeSelection<T>(treeSelection, context.getDataSourceState);
    },
  };

  const { onKeyDown: onKeyDownProp } = context.getState();

  let keyDownResult: Required<InfiniteTablePropOnKeyDownResult> = {
    preventEdit: false,
    preventEditStop: false,
    preventDefaultForTabKeyWhenEditing: true,
    preventSelection: false,
    preventNavigation: false,
  };

  if (onKeyDownProp) {
    const result = onKeyDownProp(context, event);
    if (result && typeof result === 'object') {
      keyDownResult = { ...keyDownResult, ...result };
    }
  }

  if (
    !keyDownResult.preventSelection &&
    handleKeyboardSelection(keyboardHandlerContext, event)
  ) {
    event.preventDefault();
  }

  if (
    handleBrowserFocusChangeOnKeyboardNavigation(keyboardHandlerContext, event)
  ) {
    event.preventDefault();
  } else {
    if (
      !context.getState().focusedWithin &&
      !keyDownResult.preventNavigation &&
      handleKeyboardNavigation(keyboardHandlerContext, event)
    ) {
      event.preventDefault();
    }
  }

  if (
    !keyDownResult.preventEdit &&
    event.key === 'Enter' &&
    !context.api.isEditInProgress()
  ) {
    const { activeCellIndex } = context.getState();
    if (activeCellIndex) {
      const [rowIndex, colIndex] = activeCellIndex;
      const column = context.getComputed().computedVisibleColumns[colIndex];

      if (column.computedEditable) {
        context.api.startEdit({
          rowIndex,
          columnId: column.id,
        });
      }
    }
  }

  if (context.api.isEditInProgress()) {
    if (event.key === 'Escape' && !keyDownResult.preventEditStop) {
      context.api.stopEdit({ cancel: true });
    }
    if (
      event.key === 'Tab' &&
      keyDownResult.preventDefaultForTabKeyWhenEditing
    ) {
      event.preventDefault();
    }
  }

  const { keyboardShortcuts } = context.getState();

  if (keyboardShortcuts) {
    for await (const shortcut of keyboardShortcuts) {
      if (!eventMatchesKeyboardShortcut(event, shortcut.key)) {
        continue;
      }

      if (shortcut.when) {
        const result = await shortcut.when(context);
        if (!result) {
          continue;
        }
      }

      const maybeStopNext = await shortcut.handler(context, event);

      if (maybeStopNext && maybeStopNext.stopNext) {
        break;
      }
    }
  }
}
