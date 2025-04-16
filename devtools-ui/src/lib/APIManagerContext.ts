import { createContext, useContext } from 'react';
import type {
  DevToolsOverrides,
  ErrorCodeKey,
  DebugWarningPayload,
  InfiniteTablePropColumnVisibility,
} from '@infinite-table/infinite-react';

export const APIManagerContext = createContext<{
  setColumnVisibility: (
    columnVisibility: InfiniteTablePropColumnVisibility,
  ) => void;
  setGroupBy: (groupBy: { field: string }[]) => void;
  setGroupRenderStrategy: (groupRenderStrategy: string) => void;
  setSortInfo: (sortInfo: { field: string; dir: 1 | -1 }[]) => void;
  setMultiSort: (multiSort: boolean) => void;
  revertProperty: (property: keyof DevToolsOverrides) => void;
  revertAll: () => void;
  overridenProperties: Set<keyof DevToolsOverrides>;
  rerender: () => void;
  warnings: Partial<Record<ErrorCodeKey, DebugWarningPayload>>;
  discardWarning: (warning: ErrorCodeKey) => void;
  discardAllWarnings: () => void;
}>({
  warnings: {},
  discardWarning: () => {},
  discardAllWarnings: () => {},
  setColumnVisibility: () => {},
  setGroupBy: () => {},
  setGroupRenderStrategy: () => {},
  setSortInfo: () => {},
  setMultiSort: () => {},
  revertProperty: () => {},
  revertAll: () => {},
  overridenProperties: new Set(),
  rerender: () => {},
});

export function useAPIManagerContext() {
  return useContext(APIManagerContext);
}
