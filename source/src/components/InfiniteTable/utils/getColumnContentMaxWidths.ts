import { getGlobal } from '../../../utils/getGlobal';
import { InfiniteTableHeaderCellClassName } from '../components/InfiniteTableHeader/headerClassName';
import {
  InfiniteTableCellClassName,
  InfiniteTableCellContentClassName,
} from '../components/InfiniteTableRow/InfiniteTableCellClassNames';
import { cssEllipsisClassName } from '../utilities.css';

const OFFSET = 10;

/**
 * Framework-neutral DOM measurement used by the autoSizeColumnsKey feature
 * (React: useAutoSizeColumns, Vue: InfiniteTableForVue). Clones each cell's
 * content node, measures its natural width and returns the max per column.
 */
export function getColumnContentMaxWidths(
  domRef: { current: HTMLElement | null },
  options: {
    includeHeader: boolean;
    columnsToSkip?: Set<string>;
    columnsToResize?: Set<string>;
  },
) {
  const { includeHeader, columnsToResize, columnsToSkip } = options;
  const query = `.${InfiniteTableCellClassName} > .${InfiniteTableCellContentClassName}`;

  const match = domRef.current?.querySelectorAll(query);

  const measuredMaxWidths: Record<string, number> = {};

  const computedPaddingsForColumns: Record<string, number> = {};

  if (match && match.length) {
    match.forEach((content) => {
      const cell = content.parentElement!;
      const isHeader = cell.matches(`.${InfiniteTableHeaderCellClassName}`);
      if (includeHeader === false && isHeader) {
        return;
      }

      const colId = cell.getAttribute('data-column-id') as string;

      const contentClone = content.cloneNode(true) as HTMLElement;
      contentClone.style.visibility = 'hidden';
      contentClone.style.pointerEvents = 'none';

      contentClone.classList.remove(...cssEllipsisClassName.split(' '));
      contentClone.style.position = 'absolute';
      contentClone.style.width = 'auto';

      cell.appendChild(contentClone);
      let measuredWidth = contentClone.offsetWidth;
      cell.removeChild(contentClone);

      if (!computedPaddingsForColumns[colId]) {
        const cellComputedStyle = getGlobal().getComputedStyle(cell);
        computedPaddingsForColumns[colId] =
          parseInt(cellComputedStyle.paddingLeft, 10) +
          parseInt(cellComputedStyle.paddingRight, 10) +
          parseInt(cellComputedStyle.borderLeftWidth, 10) +
          parseInt(cellComputedStyle.borderRightWidth, 10) +
          OFFSET;
      }

      measuredWidth += computedPaddingsForColumns[colId]!;

      if (isHeader) {
        let otherElementsLength = 0;
        cell.childNodes.forEach((child) => {
          // skip text/comment nodes - Vue renders text as real text nodes
          if (child !== content && child.nodeType === 1) {
            const el = child as HTMLElement;
            let elWidth = Math.max(
              el.offsetWidth,
              parseInt(el.style.width, 10),
            );
            if (isNaN(elWidth)) {
              elWidth = 0;
            }

            otherElementsLength += elWidth;

            if (elWidth > 0) {
              const style = getGlobal().getComputedStyle(el);
              otherElementsLength +=
                parseInt(style.marginLeft, 10) +
                parseInt(style.marginRight, 10);
            }
          }
        });
        measuredWidth += otherElementsLength;
      }

      if (columnsToSkip && columnsToSkip.has(colId)) {
        return;
      }
      if (columnsToResize && !columnsToResize.has(colId)) {
        return;
      }

      measuredMaxWidths[colId] = Math.max(
        measuredWidth,
        measuredMaxWidths[colId] || 0,
      );
    });
  }
  return measuredMaxWidths;
}
