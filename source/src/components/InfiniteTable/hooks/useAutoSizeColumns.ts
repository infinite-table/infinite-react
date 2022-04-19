import {
  MutableRefObject,
  RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';
import { getGlobal } from '../../../utils/getGlobal';
import { useComponentState } from '../../hooks/useComponentState';
import { useLatest } from '../../hooks/useLatest';
import { InfiniteTableHeaderCellClassName } from '../components/InfiniteTableHeader/InfiniteTableHeaderCell';
import {
  InfiniteTableCellClassName,
  InfiniteTableCellContentClassName,
} from '../components/InfiniteTableRow/InfiniteTableCell';
import { InfiniteTablePropColumnSizing, InfiniteTableState } from '../types';
import { cssEllipsisClassName } from '../utilities.css';

const OFFSET = 10;

function getColumnContentMaxWidths(
  domRef: RefObject<HTMLElement>,
  options: {
    includeHeader: boolean;
    columnsToSkip?: Set<string>;
    columnsToResize?: Set<string>;
  },
) {
  const { includeHeader, columnsToResize, columnsToSkip } = options;
  const query = `.${InfiniteTableCellClassName} > .${InfiniteTableCellContentClassName}`;

  let match = domRef.current?.querySelectorAll(query);

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
          if (child !== content) {
            const el = child as HTMLElement;
            otherElementsLength += Math.max(
              el.offsetWidth,
              parseInt(el.style.width, 10),
            );
            const style = getGlobal().getComputedStyle(el);
            otherElementsLength +=
              parseInt(style.marginLeft, 10) + parseInt(style.marginRight, 10);
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

export function useAutoSizeColumns<T>() {
  const {
    getComponentState,
    componentActions,
    componentState: { domRef, ready, autoSizeColumnsKey, brain },
  } = useComponentState<InfiniteTableState<T>>();

  const [refreshId, setRefreshId] = useState(0);

  const theKey =
    typeof autoSizeColumnsKey === 'object'
      ? autoSizeColumnsKey.key
      : autoSizeColumnsKey;

  const getTheKey = useLatest<typeof theKey>(theKey);

  const lastExecutedIdentifierRef: MutableRefObject<string | number | null> =
    useRef(null);

  useEffect(() => {
    const key = getTheKey();
    if (key == null) {
      return;
    }

    const { current } = lastExecutedIdentifierRef;

    const onChange = () => {
      if (autoSizeColumnsKey !== current) {
        setRefreshId(refreshId + 1);
      }
    };

    return brain.onRenderRangeChange(onChange);
  }, [brain]);

  useEffect(() => {
    if (theKey == null) {
      return;
    }

    const { autoSizeColumnsKey } = getComponentState();

    let columnsToResize: Set<string> | undefined;
    let columnsToSkip: Set<string> | undefined;

    let includeHeader = true;

    if (typeof autoSizeColumnsKey === 'object') {
      if (autoSizeColumnsKey.columnsToResize) {
        columnsToResize = new Set(autoSizeColumnsKey.columnsToResize);
      }
      if (autoSizeColumnsKey.columnsToSkip) {
        columnsToSkip = new Set(autoSizeColumnsKey.columnsToSkip);
      }
      includeHeader = autoSizeColumnsKey.includeHeader ?? includeHeader;
    }

    lastExecutedIdentifierRef.current = theKey;

    const measuredMaxWidths = getColumnContentMaxWidths(domRef, {
      includeHeader,
      columnsToResize,
      columnsToSkip,
    });

    const colIds = Object.keys(measuredMaxWidths);

    if (!colIds.length) {
      return;
    }

    const columnSizing = getComponentState().columnSizing;
    const newColumnSizing: InfiniteTablePropColumnSizing = {
      ...columnSizing,
    };

    let changed = false;

    colIds.forEach((colId) => {
      newColumnSizing[colId] = {
        width: measuredMaxWidths[colId],
      };
      changed =
        changed || newColumnSizing[colId].width !== columnSizing[colId]?.width;
    });

    if (changed) {
      componentActions.columnSizing = newColumnSizing;
    }
  }, [theKey, ready, refreshId]);
}
