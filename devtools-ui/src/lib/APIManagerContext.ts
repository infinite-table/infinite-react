import { createContext, useContext } from 'react';
import type {
  DevToolsOverrides,
  InfiniteTablePropColumnVisibility,
} from '@infinite-table/infinite-react';

export const APIManagerContext = createContext<{
  setColumnVisibility: (
    columnVisibility: InfiniteTablePropColumnVisibility,
  ) => void;
  setGroupBy: (groupBy: { field: string }[]) => void;
  setGroupRenderStrategy: (groupRenderStrategy: string) => void;
  revertProperty: (property: keyof DevToolsOverrides) => void;
  revertAll: () => void;
  overridenProperties: Set<keyof DevToolsOverrides>;
  rerender: () => void;
}>({
  setColumnVisibility: () => {},
  setGroupBy: () => {},
  setGroupRenderStrategy: () => {},
  revertProperty: () => {},
  revertAll: () => {},
  overridenProperties: new Set(),
  rerender: () => {},
});

export function useAPIManagerContext() {
  return useContext(APIManagerContext);
}
