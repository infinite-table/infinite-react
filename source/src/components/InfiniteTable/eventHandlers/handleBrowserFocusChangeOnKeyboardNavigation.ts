import type { KeyboardEvent } from 'react';
import { selectParent } from '../../../utils/selectParent';
import { InfiniteTableColumnCellClassName } from '../components/InfiniteTableRow/InfiniteTableColumnCellClassNames';

import {
  getFirstFocusableChildForNode,
  getFocusableChildrenForNode,
} from '../utils/getFocusableChildrenForNode';
import {
  getFollowingFocusableCell,
  isCellFocusable,
  tryScrollToCell,
} from '../utils/cellFocusUtils';

import { InfiniteTableKeyboardEventHandlerContext } from './eventHandlerTypes';

const CELL_SELECTOR = `.${InfiniteTableColumnCellClassName}`;

export function handleBrowserFocusChangeOnKeyboardNavigation<T>(
  context: InfiniteTableKeyboardEventHandlerContext<T>,
  event: KeyboardEvent<Element>,
): boolean {
  if (event.key !== 'Tab') {
    return false;
  }

  const direction = event.shiftKey ? -1 : 1;
  const target = event.target as HTMLElement;
  const scrollerDOMNode = context.getState().scrollerDOMRef.current;

  const scrollerFocused =
    document.activeElement === scrollerDOMNode || target === scrollerDOMNode;

  if (!scrollerDOMNode) {
    // something totally wrong, no scroller
    return false;
  }

  if (scrollerFocused && direction === -1) {
    // scroller focused and shift tabbing, so nothing to do
    // as the browser will handle that
    return false;
  }

  const cell = scrollerFocused ? null : selectParent(target, CELL_SELECTOR);

  let rowIndex: number | null = null;
  let colIndex: number | null = null;

  if (cell) {
    rowIndex = Number(cell.getAttribute('data-row-index'));
    colIndex = Number(cell.getAttribute('data-col-index'));
  } else if (scrollerFocused) {
    // scroller is focused and we're tabbing forward (not shift tabbing - we handled that above)
    const { activeCellIndex } = context.getState();
    // in this case, we try and focus either the active cell or the first cell of the grid
    [rowIndex, colIndex] = activeCellIndex || [0, 0];
  }

  if (rowIndex == null || colIndex == null) {
    return false;
  }
  if (isNaN(rowIndex) || isNaN(colIndex)) {
    return false;
  }

  const cellPos =
    scrollerFocused && isCellFocusable({ colIndex, rowIndex }, context)
      ? {
          rowIndex,
          colIndex,
        }
      : getFollowingFocusableCell(
          {
            rowIndex,
            colIndex,
          },
          direction,
          context,
        );

  if (!cellPos) {
    if (direction === -1) {
      // the first focusable cell was in focus, and now moving backwards
      // so the scroller should be focused
      scrollerDOMNode.focus();
    } else {
      // the last cell is already focused, so focus should be shifted to the next focusable element
      // so we have to focus what comes after the table
      // to know what's coming after the table, we use the focusDetectDOMRef element

      const nodes = getFocusableChildrenForNode(document.body);
      const focusDetectDOMNode = context.getState().focusDetectDOMRef.current;
      const index = nodes.findIndex((node) => node === focusDetectDOMNode);

      const nextNode = nodes[index + 1];

      nextNode?.focus();
    }

    return true;
  }

  tryScrollToCell([cellPos.rowIndex, cellPos.colIndex], context).then(() => {
    const cellNode = context.getState().getDOMNodeForCell(cellPos);

    if (!cellNode) {
      return;
    }

    const first = getFirstFocusableChildForNode(cellNode);

    first?.focus();
  });

  return true;
}
