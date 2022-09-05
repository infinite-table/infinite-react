import type { KeyboardEvent } from 'react';
import { handleKeyboardNavigation } from './keyboardNavigation';
import { InfiniteTableKeyboardEventHandlerContext } from './eventHandlerTypes';
import { handleKeyboardSelection } from './keyboardSelection';
import { cloneRowSelection } from '../api/getSelectionApi';

export function onKeyDown<T>(
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

  if (handleKeyboardNavigation(keyboardHandlerContext, event)) {
    event.preventDefault();
  }
}
