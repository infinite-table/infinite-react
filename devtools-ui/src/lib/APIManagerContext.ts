import { createContext, useContext } from 'react';

export const APIManagerContext = createContext<{
  setColumnVisibility: (columnId: string, visible: boolean) => void;
  setGroupBy: (groupBy: { field: string }[]) => void;
  setGroupRenderStrategy: (groupRenderStrategy: string) => void;
}>({
  setColumnVisibility: () => {},
  setGroupBy: () => {},
  setGroupRenderStrategy: () => {},
});

export function useAPIManagerContext() {
  return useContext(APIManagerContext);
}
