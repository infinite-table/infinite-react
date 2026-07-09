import { MutableRefObject, useEffect, useRef, useState } from 'react';

import { useManagedComponentState } from '../../hooks/useComponentState';
import { useLatest } from '../../hooks/useLatest';
import { InfiniteTablePropColumnSizing, InfiniteTableState } from '../types';
import { getColumnContentMaxWidths } from '../utils/getColumnContentMaxWidths';

export function useAutoSizeColumns<T>() {
  const {
    getComponentState,
    componentActions,
    componentState: { domRef, ready, autoSizeColumnsKey, brain },
  } = useManagedComponentState<InfiniteTableState<T>>();

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
