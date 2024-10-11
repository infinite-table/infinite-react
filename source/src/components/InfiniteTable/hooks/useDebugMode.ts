import * as React from 'react';

import { once } from '../../../utils/DeepMap/once';
import { stripVar } from '../../../utils/stripVar';
import { InfiniteTableState } from '../types';

import { CSS_LOADED_VALUE, ThemeVars } from '../vars.css';

import { useInfiniteTable } from './useInfiniteTable';

const logWarning = once(() => {
  console.warn(
    `It appears you have not loaded the CSS file for InfiniteTable.
In most environments, you should be able to fix this by adding the following line:

import '@infinite-table/infinite-react/index.css'

`,
  );
});

const cssFileLoadedVarName = stripVar(ThemeVars.loaded);

export function useDebugMode() {
  const { getState } = useInfiniteTable();

  React.useEffect(() => {
    runDebugMode(getState);
  }, []);
}

function runDebugMode(getState: () => InfiniteTableState<unknown>) {
  const state = getState();
  const { debugMode, domRef } = state;

  if (debugMode) {
    if (domRef.current) {
      const value = getComputedStyle(domRef.current).getPropertyValue(
        cssFileLoadedVarName,
      );

      if (value !== `${CSS_LOADED_VALUE}`) {
        logWarning();
      }
    }
  }
}
