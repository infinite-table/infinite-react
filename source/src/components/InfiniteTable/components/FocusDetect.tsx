import * as React from 'react';
import { CSSProperties, useCallback } from 'react';

import { focusLastFocusableCell } from '../utils/cellFocusUtils';
import { useInfiniteTableStableContext } from '../hooks/useInfiniteTableSelector';
import { useDataSourceStableContext } from '../../DataSource/publicHooks/useDataSourceSelector';

const style: CSSProperties = {
  width: 0,
  height: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
  outline: 'none',
  zIndex: -1,
};

export function FocusDetect<T>() {
  const {
    getState,
    api,
    actions,
    getComputed,
    dataSourceApi,
    dataSourceActions,
  } = useInfiniteTableStableContext<T>();
  const { getDataSourceState, getDataSourceMasterContext } =
    useDataSourceStableContext<T>();

  const { focusDetectDOMRef } = getState();

  const onFocus = useCallback(async () => {
    // this should only be focused when the user is shift+tabbing back into the table
    // so we have to focus the last contentFocusable cell in the grid at this point

    const context = {
      getDataSourceState,
      getDataSourceMasterContext,
      getComputed,
      actions,
      dataSourceActions,
      api,
      getState,
      dataSourceApi,
    };

    focusLastFocusableCell(context);
  }, []);
  return (
    <div
      onFocus={onFocus}
      ref={focusDetectDOMRef}
      tabIndex={0}
      style={style}
    ></div>
  );
}
