import * as React from 'react';

export type DevToolsView = 'components' | 'theme';

type DevToolsViewContextType = {
  view: DevToolsView;
  setView: (view: DevToolsView) => void;
};

const DevToolsViewContext = React.createContext<DevToolsViewContextType | null>(
  null,
);

export function DevToolsViewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [view, setView] = React.useState<DevToolsView>('components');

  const value = React.useMemo(() => ({ view, setView }), [view]);

  return (
    <DevToolsViewContext.Provider value={value}>
      {children}
    </DevToolsViewContext.Provider>
  );
}

export function useDevToolsView() {
  const context = React.useContext(DevToolsViewContext);
  if (!context) {
    throw new Error(
      'useDevToolsView must be used within a DevToolsViewProvider',
    );
  }
  return context;
}
