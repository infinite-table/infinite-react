import type { KeyboardEvent } from 'react';
import { handleKeyboardNavigation } from './keyboardNavigation';
import { InfiniteTableKeyboardEventHandlerContext } from './eventHandlerTypes';
import { handleKeyboardSelection } from './keyboardSelection';
import { cloneRowSelection } from '../api/getRowSelectionApi';
import { handleBrowserFocusChangeOnKeyboardNavigation } from './handleBrowserFocusChangeOnKeyboardNavigation';
import { eventMatchesKeyboardShortcut } from '../../utils/hotkey';

export async function onKeyDown<T>(
  context: InfiniteTableKeyboardEventHandlerContext<T>,
  event: KeyboardEvent<Element>,
) {
  const keyboardHandlerContext: InfiniteTableKeyboardEventHandlerContext<T> = {
    ...context,
    cloneRowSelection: (rowSelection) => {
      return cloneRowSelection<T>(rowSelection, context.getDataSourceState);
    },
  };

  if (handleKeyboardSelection(keyboardHandlerContext, event)) {
    event.preventDefault();
  }

  if (
    handleBrowserFocusChangeOnKeyboardNavigation(keyboardHandlerContext, event)
  ) {
    event.preventDefault();
  } else {
    if (
      !context.getState().focusedWithin &&
      handleKeyboardNavigation(keyboardHandlerContext, event)
    ) {
      event.preventDefault();
    }
  }

  if (event.key === 'Enter' && !context.api.isEditInProgress()) {
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
    if (event.key === 'Escape') {
      context.api.stopEdit({ cancel: true });
    }
    if (event.key === 'Tab') {
      event.preventDefault();
    }
  }

  context.getState().onKeyDown?.(context, event);

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
