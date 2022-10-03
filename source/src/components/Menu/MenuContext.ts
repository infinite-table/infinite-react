import { createContext, useContext } from 'react';
import { MenuContextValue } from './MenuContextValue';

export const MenuContext = createContext<MenuContextValue | null>(null);

export function useMenuContext(): MenuContextValue {
  const contextValue = useContext(MenuContext);

  return contextValue!;
}
