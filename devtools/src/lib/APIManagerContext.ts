import { createContext, useContext } from 'react';

export const APIManagerContext = createContext<{
  setColumnVisibility: (columnId: string, visible: boolean) => void;
}>({
  setColumnVisibility: () => {},
});

export function useAPIManagerContext() {
  return useContext(APIManagerContext);
}
